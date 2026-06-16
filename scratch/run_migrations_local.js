const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgresql://postgres.vktqecgylkjogquhsymz:EgBovcTTPMqZga5W@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require";

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
