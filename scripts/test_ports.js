process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Client } = require('pg');

async function test(port) {
  const connectionString = `postgresql://postgres.vktqecgylkjogquhsymz:EgBovcTTPMqZga5W@aws-0-eu-west-1.pooler.supabase.com:${port}/postgres?sslmode=require`;
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log(`Testing port ${port}...`);
    await client.connect();
    console.log(`🎉 SUCCESS on port ${port}!`);
    await client.end();
  } catch (err) {
    console.log(`❌ FAILED on port ${port}: ${err.message}`);
  }
}

async function main() {
  await test(5432);
  await test(6543);
}

main();
