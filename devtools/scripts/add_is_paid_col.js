const { Client } = require('pg');
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
      fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
        const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
        if (match) {
          const key = match[1].trim();
          let val = match[2].trim();
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
          process.env[key] = val;
        }
      });
    }
  } catch (err) {}
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Error: DATABASE_URL environment variable is missing.");
  process.exit(1);
}

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
