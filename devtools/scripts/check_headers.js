const https = require('https');

https.get('https://vktqecgylkjogquhsymz.supabase.co/rest/v1/', {
  headers: {
    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Z698wcBReZzBGsVRJdVmHg_10KeiSD3'
  }
}, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
}).on('error', (e) => {
  console.error(e);
});
