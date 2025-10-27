/**
 * Database Setup Script
 * This script helps you create the database and set up tables
 * Run with: node setup-database.js
 */

import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Client } = pg;

async function setupDatabase() {
  console.log('🚀 [Setup] Starting database setup...\n');

  // Step 1: Check if database exists and create if not
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Connect to default postgres database
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  try {
    console.log('📡 [Setup] Connecting to PostgreSQL...');
    await adminClient.connect();
    console.log('✅ [Setup] Connected to PostgreSQL\n');

    // Check if database exists
    const dbCheck = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [process.env.DB_NAME]
    );

    if (dbCheck.rows.length === 0) {
      console.log(`📝 [Setup] Creating database: ${process.env.DB_NAME}...`);
      await adminClient.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`✅ [Setup] Database '${process.env.DB_NAME}' created!\n`);
    } else {
      console.log(`ℹ️  [Setup] Database '${process.env.DB_NAME}' already exists\n`);
    }

    await adminClient.end();
  } catch (err) {
    console.error('❌ [Setup] Error connecting to PostgreSQL:', err.message);
    console.error('📄 [Setup] Error code:', err.code);
    console.error('\n💡 Possible fixes:');
    console.error('1. Make sure PostgreSQL is running');
    console.error('2. Check your .env file has correct credentials');
    console.error('3. PostgreSQL password might be wrong');
    process.exit(1);
  }

  // Step 2: Create tables using the schema file
  const dbClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  try {
    console.log('📡 [Setup] Connecting to database...');
    await dbClient.connect();
    console.log('✅ [Setup] Connected to database\n');

    console.log('📄 [Setup] Reading schema file...');
    const schemaPath = join(__dirname, 'database', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    console.log('🔨 [Setup] Creating tables...');
    await dbClient.query(schema);
    console.log('✅ [Setup] Tables created successfully!\n');

    // Verify tables were created
    const tables = await dbClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log('📊 [Setup] Tables in database:');
    tables.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    await dbClient.end();
    console.log('\n✅ [Setup] Database setup complete!');
    console.log('🚀 [Setup] You can now start the server with: npm run dev\n');
  } catch (err) {
    console.error('❌ [Setup] Error setting up database:', err.message);
    console.error('📄 [Setup] Error code:', err.code);
    await dbClient.end();
    process.exit(1);
  }
}

setupDatabase();

