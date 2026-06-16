const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  try {
    const { data, error } = await supabase.from('restaurant_items').select('*').limit(1);
    if (!error && data) {
      console.log('Columns in restaurant_items:', Object.keys(data[0] || {}));
    } else {
      console.error('Error fetching restaurant_items columns:', error);
    }
  } catch (err) {
    console.error(err);
  }
}

check();
