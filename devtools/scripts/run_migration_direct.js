const { Client } = require('pg');

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

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Error: DATABASE_URL environment variable is missing.");
  process.exit(1);
}

async function run() {
  console.log('Connecting directly to Supabase via IPv6...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  console.log('Connected successfully!');

  console.log('Executing migration...');
  const query = `
    ALTER TABLE public.restaurant_orders ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0;
    ALTER TABLE public.restaurant_orders ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.restaurant_orders ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
    NOTIFY pgrst, 'reload schema';
  `;

  const res = await client.query(query);
  console.log('Migration query executed!');

  const checkRes = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'restaurant_orders' 
      AND column_name IN ('deposit_amount', 'deposit_paid', 'payment_intent_id');
  `);
  console.log('Current columns in DB:', checkRes.rows);

  await client.end();
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
