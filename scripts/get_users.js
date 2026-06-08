process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Client } = require('pg');

const connectionString = "postgresql://postgres.vktqecgylkjogquhsymz:EgBovcTTPMqZga5W@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require";

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  try {
    const res = await client.query('SELECT id, email FROM auth.users LIMIT 5;');
    console.log('Users in database:', res.rows);
  } catch (err) {
    console.error('Error querying users:', err);
  } finally {
    await client.end();
  }
}

run();
