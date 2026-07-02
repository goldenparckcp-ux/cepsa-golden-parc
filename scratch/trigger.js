const http = require('http');

console.log('Sending migration request to running dev server...');

http.get('http://localhost:3001/api/temp-migrate', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Response Status:', res.statusCode);
    console.log('Response Body:', data);
  });
}).on('error', (err) => {
  console.error('Error sending request:', err.message);
});
