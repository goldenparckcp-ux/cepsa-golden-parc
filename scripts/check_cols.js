const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

function getEnvVar(name) {
  const match = envContent.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return match ? match[1].trim() : null;
}

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY') || getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

console.log('Using URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('restaurant_items').select('*').limit(1);
  if (error) {
    console.error('Error fetching restaurant_items:', error);
  } else {
    console.log('Fields in restaurant_items:', Object.keys(data[0] || {}));
  }
}

check();
