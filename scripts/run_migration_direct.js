const { Client } = require('pg');

const connectionString = 'postgresql://postgres:EgBovcTTPMqZga5W@db.vktqecgylkjogquhsymz.supabase.co:5432/postgres';

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

  await client.query(query);
  console.log('Migration executed successfully!');

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
