const dns = require('dns');

dns.resolve4('vktqecgylkjogquhsymz.supabase.co', (err, addresses) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('IP Addresses:', addresses);
  
  // Also resolve the pooler just to see if it works
  dns.resolve4('aws-0-eu-west-1.pooler.supabase.com', (err2, addr2) => {
    console.log('Pooler eu-west-1 IPs:', err2 ? err2.message : addr2);
  });

  dns.resolve4('aws-0-eu-west-3.pooler.supabase.com', (err3, addr3) => {
    console.log('Pooler eu-west-3 IPs:', err3 ? err3.message : addr3);
  });

  dns.resolve4('aws-0-eu-central-1.pooler.supabase.com', (err4, addr4) => {
    console.log('Pooler eu-central-1 IPs:', err4 ? err4.message : addr4);
  });
});
