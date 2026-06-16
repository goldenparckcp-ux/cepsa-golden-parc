const { Client } = require('pg');

const regions = [
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-central-2',
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2', 'ap-south-1',
  'sa-east-1', 'ca-central-1', 'me-central-1', 'af-south-1'
];

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const url = `postgresql://postgres.vktqecgylkjogquhsymz:EgBovcTTPMqZga5W@${host}:6543/postgres?sslmode=require`;
  
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    console.log(`✅ SUCCESS: Connected to pooler in region: ${region}`);
    await client.end();
    return true;
  } catch (err) {
    if (err.message.includes('not found')) {
      // Tenant not found means this region is not the one
      // console.log(`❌ Region ${region}: tenant not found`);
    } else {
      console.log(`⚠️ Region ${region}: connection failed with: ${err.message}`);
      // If it's a password error, it means we reached the tenant!
      if (err.message.includes('password') || err.message.includes('authentication')) {
        console.log(`🎉 Found correct region (auth error): ${region}`);
        await client.end().catch(()=>{});
        return true;
      }
    }
    await client.end().catch(()=>{});
    return false;
  }
}

async function run() {
  console.log("Testing regions to find where the Supabase project is hosted...");
  for (const region of regions) {
    const found = await testRegion(region);
    if (found) {
      console.log(`\nFound target pooler region: ${region}`);
      break;
    }
  }
  console.log("Done.");
}

run();
