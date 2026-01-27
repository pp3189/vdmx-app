import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from './db.js';

dotenv.config();

const app = express();

// Enable CORS immediately for ALL routes
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature']
}));
// app.options('*', cors()); // REMOVED: Incompatible with Express 5 (wildcard not supported)

// Health Check
app.get('/', (req, res) => {
    res.send('✅ API is operational (VDMX Risk Intelligence)');
});

// Validate Environment Variables
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey || stripeKey.includes('sk_test_...')) {
    console.error('❌ CRITICAL WARNING: STRIPE_SECRET_KEY is missing or invalid in .env');
    console.error('The server will start, but payments WILL FAIL.');
    // We do NOT exit here to allow debugging via the health check
} else {
    console.log('✅ STRIPE_SECRET_KEY is present');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('⚠️ WARNING: STRIPE_WEBHOOK_SECRET is missing. Webhooks will fail.');
}

if (!process.env.DATABASE_URL) {
    console.warn('⚠️ PROD WARNING: DATABASE_URL is missing. Using local JSON file (data will be lost on restart).');
} else {
    console.log('✅ DATABASE_URL is present');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICES = {
    'auto-1': 49900,
    'auto-2': 129900,
    'auto-3': 199900,
    'lease-1': 89900,
    'lease-2': 179900,
    'lease-3': 299900,
    'test-pkg': 1000 // $10.00 MXN (Stripe minimum is approx $10 MXN)
};

// --- FILE UPLOAD SETUP ---
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Serve Uploaded Files (Explicit CORS)
app.use('/uploads', cors(), express.static(UPLOAD_DIR));

// Debug: List Uploaded Files
app.get('/api/debug/uploads', (req, res) => {
    try {
        const files = fs.readdirSync(UPLOAD_DIR);
        res.json({
            count: files.length,
            path: UPLOAD_DIR,
            files: files
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// -------------------------

// Webhook requires raw body
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const { case_id, package_id } = paymentIntent.metadata;
        const amountReceived = paymentIntent.amount_received;
        const expectedAmount = PRICES[package_id];

        if (package_id && (!expectedAmount || amountReceived !== expectedAmount)) {
            console.error(`❌ Fraud Alert: Invalid amount for ${package_id}. Expected ${expectedAmount}, got ${amountReceived}`);
            return res.status(400).send('Invalid amount');
        }

        console.log(`💰 Payment succeeded for Case ${case_id}`);

        // Update DB
        await db.updateCaseStatus(case_id, 'PAID');
    }

    res.send();
});

// app.use(cors()); // Moved to top
app.use(express.json());

// Create Checkout Session
app.post('/create-checkout-session', async (req, res) => {
    const { packageId, price, name } = req.body;

    // Validation
    const expectedPriceCents = PRICES[packageId];
    if (!expectedPriceCents) {
        return res.status(400).json({ error: 'Invalid package' });
    }

    // Generate Case ID
    const caseId = `CASE-${Math.floor(1000 + Math.random() * 9000)}`;

    // Save initial Pending Case to DB
    await db.createCase({
        id: caseId,
        packageId,
        status: 'PAYMENT_PENDING',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    });

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'mxn',
                        product_data: {
                            name: name || 'Risk Analysis Package', // Fallback name
                            metadata: {
                                package_id: packageId
                            }
                        },
                        unit_amount: expectedPriceCents,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/#/dashboard?newCase=${caseId}&pkg=${packageId}&success=true`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/#/checkout/${packageId}?canceled=true`,
            payment_intent_data: {
                metadata: {
                    case_id: caseId,
                    package_id: packageId
                }
            }
        });

        res.json({ url: session.url });
    } catch (e) {
        console.error('Stripe Session Creation Failed:', e.message);
        res.status(500).json({
            error: 'Payment initialization failed. Please check server logs.',
            details: e.message
        });
    }
});

// Check Case Status
app.get('/api/case/:id', async (req, res) => {
    const caseData = await db.getCase(req.params.id);
    if (!caseData) {
        return res.status(404).json({ error: 'Case not found' });
    }
    res.json(caseData);
});

// Update Case Data (Form Submit & File Upload)
app.put('/api/case/:id', upload.any(), async (req, res) => {
    const { id } = req.params;
    let body = req.body;

    // Handle JSON parsing if mixed content
    if (body.data) {
        try {
            body = JSON.parse(body.data);
        } catch (e) { console.error("JSON Parse Error", e); }
    }

    console.log(`📝 UPDATE REQUEST for ${id}:`, JSON.stringify(body, null, 2));

    // Handle Uploaded Files
    if (req.files && req.files.length > 0) {
        // Construct dynamic base URL
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.get('host');
        const baseUrl = `${protocol}://${host}`;

        const newDocs = req.files.map(f => ({
            id: f.fieldname,
            name: f.originalname,
            url: `${baseUrl}/uploads/${f.filename}`,
            size: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
            date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
        }));

        // Merge with existing docs logic would be here, but for now we append/replace
        // For MVP, if clean list is sent, we use that. 
        // We attach the URL to the document metadata
        if (body.documents) {
            body.documents = body.documents.map(d => {
                const file = newDocs.find(f => f.id === d.id);
                return file ? { ...d, url: file.url } : d;
            });
        } else {
            body.documents = newDocs;
        }
    }

    try {
        const updatedCase = await db.updateCaseData(id, body);
        if (!updatedCase) {
            return res.status(404).json({ error: 'Case not found' });
        }
        res.json(updatedCase);
    } catch (e) {
        console.error('Update Error:', e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Debug: Create Test Case (Bypass Payment)
app.post('/api/debug/create-case', async (req, res) => {
    const caseId = `CASE-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
    const packageId = 'test-pkg';

    const newCase = {
        id: caseId,
        packageId,
        status: 'PAID', // Start as PAID so it goes to Form
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        formData: {},
        documents: []
    };

    await db.createCase(newCase);
    console.log(`🧪 DEBUG: Created Test Case ${caseId}`);
    res.json({ id: caseId });
});

// Admin: Get All Cases
app.get('/api/admin/cases', async (req, res) => {
    // Basic protection for MVP
    const authHeader = req.headers['authorization'];
    if (authHeader !== 'Bearer admin-secret-123') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const data = await db.read();
        res.json(data.cases);
    } catch (e) {
        console.error('Admin Error:', e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3001;
console.log(`🚀 Attempting to start server on port ${PORT}...`);
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running successfully on port ${PORT}`);
    console.log(`👉 Health check available at /`);
});
