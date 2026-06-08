process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Client } = require('pg');

const regions = [
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'ap-southeast-1',
  'ap-northeast-1',
  'ca-central-1',
  'sa-east-1',
  'ap-south-1'
];

async function testRegion(region) {
  const connectionString = `postgresql://postgres.vktqecgylkjogquhsymz:EgBovcTTPMqZga5W@aws-0-${region}.pooler.supabase.com:6543/postgres?sslmode=require`;
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log(`Testing region ${region}...`);
    await client.connect();
    console.log(`🎉 SUCCESS: Connected to region ${region}!`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`❌ FAILED for region ${region}: ${err.message.split('\n')[0]}`);
    return false;
  }
}

async function main() {
  for (const region of regions) {
    const success = await testRegion(region);
    if (success) {
      console.log(`\nFound correct region: ${region}`);
      break;
    }
  }
}

main();
