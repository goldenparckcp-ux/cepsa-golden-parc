const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env variables NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    const { data: lube, error: lubeErr } = await supabase.from('lubricant_items').select('*');
    console.log('lubricant_items:', lubeErr ? lubeErr.message : `Success: ${lube.length} items`);
    if (!lubeErr && lube && lube.length > 0) {
      console.log('Sample lubricant:', lube[0]);
    }

    const { data: fuel, error: fuelErr } = await supabase.from('fuel_prices').select('*');
    console.log('fuel_prices:', fuelErr ? fuelErr.message : `Success: ${fuel.length} items`);
    if (!fuelErr && fuel && fuel.length > 0) {
      console.log('Sample fuel prices:', fuel[0]);
    }
  } catch (err) {
    console.error(err);
  }
}

test();
