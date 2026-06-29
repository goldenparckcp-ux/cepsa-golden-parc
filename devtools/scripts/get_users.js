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

const connectionString = process.env.DATABASE_URL_POOLER || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Error: DATABASE_URL_POOLER or DATABASE_URL environment variable is missing.");
  process.exit(1);
}

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
