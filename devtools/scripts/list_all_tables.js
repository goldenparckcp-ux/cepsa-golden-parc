const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    // List all tables from public schema using RPC or directly querying pg_catalog
    const { data, error } = await supabase.rpc('get_tables'); // if exists
    if (error) {
      // Try raw SQL query if RPC is not available
      const { data: tables, error: err2 } = await supabase.from('orders').select('*').limit(1);
      console.log('orders table check:', err2 ? err2.message : 'Exists');
      const { data: resto_orders, error: err3 } = await supabase.from('restaurant_orders').select('*').limit(1);
      console.log('restaurant_orders table check:', err3 ? err3.message : 'Exists');
      const { data: hotel, error: err4 } = await supabase.from('hotel_reservations').select('*').limit(1);
      console.log('hotel_reservations table check:', err4 ? err4.message : 'Exists');
      const { data: pool, error: err5 } = await supabase.from('pool_bookings').select('*').limit(1);
      console.log('pool_bookings table check:', err5 ? err5.message : 'Exists');
      const { data: service, error: err6 } = await supabase.from('service_bookings').select('*').limit(1);
      console.log('service_bookings table check:', err6 ? err6.message : 'Exists');
    } else {
      console.log('Tables:', data);
    }
  } catch (err) {
    console.error(err);
  }
}

test();
