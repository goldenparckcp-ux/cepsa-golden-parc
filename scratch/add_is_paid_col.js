const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Supabase postgres connection string
const connectionString = "postgresql://postgres:EgBovcTTPMqZga5W@db.vktqecgylkjogquhsymz.supabase.co:5432/postgres";

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  console.log("Connecting to Postgres database...");
  try {
    await client.connect();
    console.log("Connected successfully! Checking/altering restaurant_orders table...");
    
    // Add is_paid column
    await client.query(`
      ALTER TABLE public.restaurant_orders 
      ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;
    `);
    console.log("Successfully added is_paid column (if it did not exist).");
    
    // Also, update existing completed orders to be marked as is_paid = true
    const res = await client.query(`
      UPDATE public.restaurant_orders 
      SET is_paid = TRUE 
      WHERE status = 'completed';
    `);
    console.log(`Updated ${res.rowCount} existing completed orders to is_paid = TRUE.`);
    
  } catch (err) {
    console.error("Postgres connection or query error:", err);
  } finally {
    await client.end();
  }
}

run();
