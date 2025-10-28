import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

console.log('🔌 [Database] Loading database configuration...');
console.log('🔌 [Database] Environment variables:', {
  DB_HOST: process.env.DB_HOST || 'localhost (default)',
  DB_PORT: process.env.DB_PORT || '5432 (default)',
  DB_NAME: process.env.DB_NAME || 'MISSING!',
  DB_USER: process.env.DB_USER || 'MISSING!',
  DB_PASSWORD: process.env.DB_PASSWORD ? '***' : 'MISSING!'
});

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false // Use false for self-signed certs or if CA validation is tricky.
                               // For production, consider using Aiven's CA cert properly.
  }
});

// Test database connection
pool.on('connect', (client) => {
  console.log('✅ [Database] New client connected to PostgreSQL');
});

pool.on('error', (err, client) => {
  console.error('❌ [Database] Connection pool error:', err.message);
  console.error('📄 [Database] Error details:', err);
});

pool.on('acquire', () => {
  console.log('🔓 [Database] Client acquired from pool');
});

pool.on('release', () => {
  console.log('🔒 [Database] Client released to pool');
});

// Test query on startup
async function testDatabaseConnection() {
  console.log('🧪 [Database] Testing database connection...');
  try {
    const result = await pool.query('SELECT NOW() as current_time, current_database() as database, current_user as user');
    console.log('✅ [Database] Connection successful!');
    console.log('📊 [Database] Database info:', result.rows[0]);
  } catch (err) {
    console.error('❌ [Database] Connection failed!');
    console.error('📄 [Database] Error code:', err.code);
    console.error('📄 [Database] Error message:', err.message);
    console.error('📄 [Database] Full error:', err);
    
    // Provide helpful error messages
    if (err.code === 'ENOTFOUND') {
      console.error('💡 [Database] Fix: Check DB_HOST in .env file');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('💡 [Database] Fix: PostgreSQL might not be running');
      console.error('💡 [Database] Fix: Start PostgreSQL service or check DB_PORT');
    } else if (err.code === '28P01') {
      console.error('💡 [Database] Fix: Wrong username or password in .env file');
    } else if (err.code === '3D000') {
      console.error('💡 [Database] Fix: Database does not exist. Create it first!');
    } else if (err.code === '23505') {
      console.error('💡 [Database] Fix: Duplicate key violation - user already exists');
    }
  }
}

testDatabaseConnection();

export default pool;
