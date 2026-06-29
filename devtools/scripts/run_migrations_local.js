const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

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

const connectionString = process.env.DATABASE_URL_POOLER || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Error: DATABASE_URL_POOLER or DATABASE_URL environment variable is missing.");
  process.exit(1);
}

async function run() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log("Connecting to Supabase Database...");
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();
    console.log("Connected successfully!");

    console.log("Reading migration SQL...");
    const sqlPath = path.join(__dirname, '../supabase-lubricants-fuels.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Executing migration SQL...");
    await client.query(sql);
    console.log("Migration executed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
    console.log("Connection closed.");
  }
}

run();
