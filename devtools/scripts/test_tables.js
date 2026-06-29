const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    const { data: lube, error: lubeErr } = await supabase.from('lubricant_items').select('*');
    console.log('lubricant_items:', lubeErr ? lubeErr.message : `Success: ${lube.length} items`);

    const { data: fuel, error: fuelErr } = await supabase.from('fuel_prices').select('*');
    console.log('fuel_prices:', fuelErr ? fuelErr.message : `Success: ${fuel.length} items`);
  } catch (err) {
    console.error(err);
  }
}

test();
