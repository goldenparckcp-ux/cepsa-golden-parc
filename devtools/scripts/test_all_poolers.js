process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
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

const connectionStringEnv = process.env.DATABASE_URL;
if (!connectionStringEnv) {
  console.error("Error: DATABASE_URL environment variable is missing.");
  process.exit(1);
}

// Parse project ref and password from connection string
let dbPassword = "";
let projectRef = "";

const matches = connectionStringEnv.match(/postgresql:\/\/[^:]+:([^@]+)@([^:/]+)/);
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
const userMatches = connectionStringEnv.match(/postgresql:\/\/([^:]+):/);
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
  const connectionString = `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-${region}.pooler.supabase.com:6543/postgres?sslmode=require`;
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
