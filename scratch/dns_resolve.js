const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

console.log('Resolving db.vktqecgylkjogquhsymz.supabase.co using Google and Cloudflare DNS...');
dns.resolve4('db.vktqecgylkjogquhsymz.supabase.co', (err, addresses) => {
  if (err) {
    console.error('IPv4 resolution failed:', err.message);
  } else {
    console.log('IPv4 Addresses:', addresses);
  }
});

dns.resolve6('db.vktqecgylkjogquhsymz.supabase.co', (err, addresses) => {
  if (err) {
    console.error('IPv6 resolution failed:', err.message);
  } else {
    console.log('IPv6 Addresses:', addresses);
  }
});

dns.resolve4('aws-0-eu-west-3.pooler.supabase.com', (err, addresses) => {
  if (err) {
    console.error('Pooler resolution failed:', err.message);
  } else {
    console.log('Pooler IPs:', addresses);
  }
});
