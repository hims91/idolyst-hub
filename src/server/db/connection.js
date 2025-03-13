
const { Pool } = require('pg');

let pool;

const connectDb = async () => {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    // Test connection
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    client.release();
    
    return pool;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDb first.');
  }
  return pool;
};

module.exports = {
  connectDb,
  getPool
};
