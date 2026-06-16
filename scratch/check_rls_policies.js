const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  try {
    // We can query pg_policies using RPC or check directly by executing raw SQL or querying the API
    console.log("Checking RLS policies on Supabase...");
    
    // Let's attempt an insert using the service role (always works)
    const testItem = {
      name_fr: "Test Item RLS",
      category_id: "FastFood",
      base_price: 15,
      description_fr: "Test RLS insert",
      is_available: true,
      sort_order: 999
    };
    
    const { data: svcInsert, error: svcErr } = await supabase.from('restaurant_items').insert([testItem]).select();
    console.log("Service role insert check:", svcErr ? svcErr.message : "Success (Service Role can insert)");
    
    if (svcInsert && svcInsert.length > 0) {
      // Clean up
      await supabase.from('restaurant_items').delete().eq('id', svcInsert[0].id);
    }

    // Now let's try with the anon client!
    const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data: anonInsert, error: anonErr } = await anonClient.from('restaurant_items').insert([testItem]).select();
    console.log("Anon client insert check (RLS):", anonErr ? anonErr.message : "Success (Anon can insert - RLS is open!)");
    
    if (anonInsert && anonInsert.length > 0) {
      // Clean up
      await supabase.from('restaurant_items').delete().eq('id', anonInsert[0].id);
    }
  } catch (err) {
    console.error(err);
  }
}

check();
