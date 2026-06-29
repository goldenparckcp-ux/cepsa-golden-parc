const https = require('https');

https.get('https://ipinfo.io/2a05:d018:65a:e202:51ae:29f1:5502:5fd/json', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('IP Location Data:', JSON.parse(data));
  });
}).on('error', (err) => {
  console.error('Error fetching IP data:', err);
});
