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

const client = new Client({
  connectionString,
});

async function main() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL database.');

  try {
    console.log('Dropping and updating status constraints on hotel_reservations...');
    await client.query(`
      ALTER TABLE hotel_reservations DROP CONSTRAINT IF EXISTS hotel_reservations_status_check;
      ALTER TABLE hotel_reservations ADD CONSTRAINT hotel_reservations_status_check 
        CHECK (status IN ('reserved', 'checked_in', 'checked_out', 'cleaning', 'cancelled', 'forfeited'));
    `);

    console.log('Dropping and updating status constraints on pool_bookings...');
    await client.query(`
      ALTER TABLE pool_bookings DROP CONSTRAINT IF EXISTS pool_bookings_status_check;
      ALTER TABLE pool_bookings ADD CONSTRAINT pool_bookings_status_check 
        CHECK (status IN ('active', 'pending', 'checked_in', 'completed', 'cancelled', 'forfeited'));
    `);

    console.log('Dropping and updating status constraints on service_bookings...');
    await client.query(`
      ALTER TABLE service_bookings DROP CONSTRAINT IF EXISTS service_bookings_status_check;
      ALTER TABLE service_bookings ADD CONSTRAINT service_bookings_status_check 
        CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'forfeited'));
    `);

    console.log('Successfully updated all database status check constraints!');
  } catch (err) {
    console.error('Database update failed:', err);
  } finally {
    await client.end();
  }
}

main();
