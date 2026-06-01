import { Pool } from 'pg';

// This pulls the DATABASE_URL straight out of your .env file
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export const db = {
    query: (text: string, params?: any[]) => pool.query(text, params),
};
