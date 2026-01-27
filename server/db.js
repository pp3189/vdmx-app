import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'cases.json');

// Initialize DB if not exists
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ cases: [] }, null, 2));
}

export const db = {
  read: () => {
    try {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      return { cases: [] };
    }
  },
  write: (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  },
  createCase: (caseData) => {
    const data = db.read();
    data.cases.push(caseData);
    db.write(data);
    return caseData;
  },
  getCase: (id) => {
    const data = db.read();
    return data.cases.find(c => c.id === id);
  },
  updateCaseStatus: (id, status) => {
    const data = db.read();
    const index = data.cases.findIndex(c => c.id === id);
    if (index !== -1) {
      data.cases[index].status = status;
      data.cases[index].lastUpdated = new Date().toISOString();
      db.write(data);
      return data.cases[index];
    }
    return null;
  }
};
