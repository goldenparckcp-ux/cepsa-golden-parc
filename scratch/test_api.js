const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vktqecgylkjogquhsymz.supabase.co';
const supabaseKey = 'sb_publishable_Z698wcBReZzBGsVRJdVmHg_10KeiSD3';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Testing Supabase REST API connection...');
  try {
    const { data, error } = await supabase.from('restaurant_items').select('*').limit(1);
    if (error) {
      console.error('API Error:', error);
    } else {
      console.log('API Success! Items found:', data.length);
    }
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}

run();
