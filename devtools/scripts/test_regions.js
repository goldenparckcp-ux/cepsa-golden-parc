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

// Parse project ref and password from connection string
let dbPassword = "";
let projectRef = "";

const matches = connectionString.match(/postgresql:\/\/[^:]+:([^@]+)@([^:/]+)/);
if (matches) {
  dbPassword = matches[1];
  const host = matches[2];
  const hostParts = host.split('.');
  if (hostParts.includes('supabase')) {
    // e.g. db.vktqecgylkjogquhsymz.supabase.co
    projectRef = hostParts[1];
  } else if (hostParts[0].startsWith('postgres-')) {
    // e.g. postgres-vktqecgylkjogquhsymz
    projectRef = hostParts[0].replace('postgres-', '');
  }
}

// Fallback user check for pooler username (postgres.project_ref)
const userMatches = connectionString.match(/postgresql:\/\/([^:]+):/);
if (userMatches && userMatches[1].includes('.')) {
  projectRef = userMatches[1].split('.')[1];
}

projectRef = process.env.SUPABASE_PROJECT_REF || projectRef || 'vktqecgylkjogquhsymz';
dbPassword = process.env.DATABASE_PASSWORD || dbPassword;

if (!dbPassword) {
  console.error("Error: Database password could not be parsed from DATABASE_URL.");
  process.exit(1);
}

const regions = [
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-central-2',
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2', 'ap-south-1',
  'sa-east-1', 'ca-central-1', 'me-central-1', 'af-south-1'
];

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const url = `postgresql://postgres.${projectRef}:${dbPassword}@${host}:6543/postgres?sslmode=require`;
  
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
