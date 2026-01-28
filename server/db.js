import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'cases.json');

const isProduction = !!process.env.DATABASE_URL;

let pool;

if (isProduction) {
    pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    // Initialize Table
    pool.query(`
    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL
    );
  `).catch(err => console.error('Error initializing DB:', err));
} else {
    // Initialize Local DB if not exists
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify({ cases: [] }, null, 2));
    }
}

export const db = {
    read: async () => {
        if (isProduction) {
            const res = await pool.query('SELECT data FROM cases');
            return { cases: res.rows.map(r => r.data) };
        } else {
            try {
                const data = fs.readFileSync(DB_PATH, 'utf8');
                return JSON.parse(data);
            } catch (err) {
                return { cases: [] };
            }
        }
    },
    // Write is only used internally in file mode, but for API consistency we keep it blank for PG
    write: async (data) => {
        if (!isProduction) {
            fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
        }
    },
    createCase: async (caseData) => {
        if (isProduction) {
            await pool.query(
                'INSERT INTO cases (id, data) VALUES ($1, $2)',
                [caseData.id, caseData]
            );
            return caseData;
        } else {
            const data = await db.read();
            data.cases.push(caseData);
            await db.write(data);
            return caseData;
        }
    },
    getCase: async (id) => {
        if (isProduction) {
            const res = await pool.query('SELECT data FROM cases WHERE id = $1', [id]);
            return res.rows[0]?.data;
        } else {
            const data = await db.read();
            return data.cases.find(c => c.id === id);
        }
    },
    updateCaseStatus: async (id, status) => {
        if (isProduction) {
            // First fetch to get data
            const res = await pool.query('SELECT data FROM cases WHERE id = $1', [id]);
            if (res.rows.length === 0) return null;

            const caseData = res.rows[0].data;
            caseData.status = status;
            caseData.lastUpdated = new Date().toISOString();

            await pool.query(
                'UPDATE cases SET data = $1 WHERE id = $2',
                [caseData, id]
            );
            return caseData;
        } else {
            const data = await db.read();
            const index = data.cases.findIndex(c => c.id === id);
            if (index !== -1) {
                data.cases[index].status = status;
                data.cases[index].lastUpdated = new Date().toISOString();
                await db.write(data);
                return data.cases[index];
            }
            return null;
        }
    },
    updateCaseData: async (id, partialData) => {
        if (isProduction) {
            const res = await pool.query('SELECT data FROM cases WHERE id = $1', [id]);
            if (res.rows.length === 0) return null;

            const currentData = res.rows[0].data;
            const newData = { ...currentData, ...partialData, lastUpdated: new Date().toISOString() };

            await pool.query(
                'UPDATE cases SET data = $1 WHERE id = $2',
                [newData, id]
            );
            return newData;
        } else {
            const data = await db.read();
            const index = data.cases.findIndex(c => c.id === id);
            if (index !== -1) {
                data.cases[index] = { ...data.cases[index], ...partialData, lastUpdated: new Date().toISOString() };
                await db.write(data);
                return data.cases[index];
            }
            return null;
        }
    },
    deleteCase: async (id) => {
        if (isProduction) {
            await pool.query('DELETE FROM cases WHERE id = $1', [id]);
            return true;
        } else {
            const data = await db.read();
            const initialLength = data.cases.length;
            data.cases = data.cases.filter(c => c.id !== id);
            if (data.cases.length < initialLength) {
                await db.write(data);
                return true;
            }
            return false;
        }
    }
};
