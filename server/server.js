import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db.js';

dotenv.config();

const app = express();

// Validate Environment Variables
if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('sk_test_...')) {
    console.error('❌ FATAL ERROR: STRIPE_SECRET_KEY is missing or invalid in .env');
    console.error('Please update .env with your actual Stripe API keys.');
    process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICES = {
    'auto-1': 49900,
    'auto-2': 129900,
    'auto-3': 199900,
    'lease-1': 89900,
    'lease-2': 179900,
    'lease-3': 299900
};

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

app.use(cors());
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
            success_url: `http://localhost:3000/#/dashboard?newCase=${caseId}&pkg=${packageId}&success=true`,
            cancel_url: `http://localhost:3000/#/checkout/${packageId}?canceled=true`,
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

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
