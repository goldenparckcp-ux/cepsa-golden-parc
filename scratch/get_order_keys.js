const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('restaurant_orders').select('*').limit(1);
  if (error) {
    console.error("Error fetching order:", error);
  } else if (data && data.length > 0) {
    console.log("Order keys:", Object.keys(data[0]));
    console.log("Sample order:", data[0]);
  } else {
    console.log("No orders found in table, querying information_schema...");
    const { data: cols, error: colsErr } = await supabase.rpc('execute_sql', {
      sql_query: "SELECT column_name FROM information_schema.columns WHERE table_name = 'restaurant_orders'"
    }).catch(() => ({ data: null, error: 'RPC failed' }));
    
    if (cols) {
      console.log("Columns:", cols);
    } else {
      // Direct SQL using a query if rpc execute_sql is not defined
      console.log("Could not inspect columns directly. We will add is_paid column if needed.");
    }
  }
}

run();
