process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

function getEnvVar(name) {
  const match = envContent.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return match ? match[1].trim() : null;
}

const connectionString = "postgresql://postgres:EgBovcTTPMqZga5W@[2a05:d018:65a:e202:51ae:29f1:5502:5fd]:5432/postgres";

const client = new Client({
  connectionString: connectionString,
});

async function run() {
  await client.connect();
  console.log('Connected to database.');

  try {
    console.log('Creating permissive policies and verifying RLS on restaurant_items...');
    
    // 1. Drop existing write policy if exists
    await client.query(`DROP POLICY IF EXISTS "Enable all access for restaurant_items" ON public.restaurant_items;`);
    
    // 2. Create ALL access policy for restaurant_items
    await client.query(`CREATE POLICY "Enable all access for restaurant_items" ON public.restaurant_items FOR ALL USING (true) WITH CHECK (true);`);
    console.log('Policy "Enable all access for restaurant_items" created successfully.');

    // 3. Drop existing write policy for categories if exists
    await client.query(`DROP POLICY IF EXISTS "Enable all access for restaurant_categories" ON public.restaurant_categories;`);
    
    // 4. Create ALL access policy for restaurant_categories
    await client.query(`CREATE POLICY "Enable all access for restaurant_categories" ON public.restaurant_categories FOR ALL USING (true) WITH CHECK (true);`);
    console.log('Policy "Enable all access for restaurant_categories" created successfully.');

  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await client.end();
  }
}

run();
