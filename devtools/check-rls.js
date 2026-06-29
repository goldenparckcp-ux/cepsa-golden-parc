const { Client } = require('pg');

async function checkPolicies() {
  // Load .env.local if present
  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '.env.local');
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
  } catch (e) {}

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Error: DATABASE_URL environment variable is missing.");
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Check if RLS is enabled on tables
    const rlsRes = await client.query(`
      SELECT relname, relrowsecurity 
      FROM pg_class 
      WHERE relnamespace = 'public'::regnamespace AND relkind = 'r';
    `);
    console.log('--- RLS Status on Tables ---');
    console.table(rlsRes.rows);

    // List all policies
    const polRes = await client.query(`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
      FROM pg_policies 
      WHERE schemaname = 'public';
    `);
    console.log('\n--- Active Policies ---');
    console.table(polRes.rows);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkPolicies();
