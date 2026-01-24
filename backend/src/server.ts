import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Routes Placeholder
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Mock Route for Dashboard Data (To be replaced with real integrations)
app.get('/api/dashboard', async (req, res) => {
  // In a real scenario, this would call services/elastic.ts, services/defender.ts, etc.
  res.json({
    message: "Endpoint pronto para integração. Implementar lógica de agregação aqui."
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
