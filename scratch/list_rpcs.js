const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Try calling a dummy function to see if we get an RPC list or error
  const { data, error } = await supabase.rpc('get_my_claims').catch(e => ({ error: e }));
  console.log("get_my_claims response:", { data, error });
  
  // Try querying a public function view if allowed
  const { data: functions, error: funcErr } = await supabase
    .from('pg_proc')
    .select('proname')
    .limit(10)
    .catch(() => ({ data: null, error: 'Cannot query pg_proc directly' }));
  console.log("pg_proc test:", { functions, funcErr });
}

run();
