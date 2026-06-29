const https = require('https');
const ipaddr = require('ipaddr.js'); // Wait, we can write a simple subnet check ourselves to avoid dependencies!

const targetIp = '2a05:d018:65a:e202:51ae:29f1:5502:5fd';

// Simple IPv6 parser and subnet matcher
function ipv6ToBinaryString(ip) {
  // Normalize
  let parts = ip.split('::');
  let left = parts[0] ? parts[0].split(':') : [];
  let right = parts[1] ? parts[1].split(':') : [];
  
  while (left.length + right.length < 8) {
    left.push('0');
  }
  
  let fullParts = left.concat(right);
  let binary = '';
  for (let part of fullParts) {
    let num = parseInt(part, 16);
    binary += num.toString(2).padStart(16, '0');
  }
  return binary;
}

function matchSubnet(ip, cidr) {
  const [subnet, maskStr] = cidr.split('/');
  const mask = parseInt(maskStr, 10);
  
  const ipBin = ipv6ToBinaryString(ip);
  const subnetBin = ipv6ToBinaryString(subnet);
  
  return ipBin.substring(0, mask) === subnetBin.substring(0, mask);
}

https.get('https://ip-ranges.amazonaws.com/ip-ranges.json', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(`Searching through ${json.ipv6_prefixes.length} IPv6 prefixes...`);
      for (const prefix of json.ipv6_prefixes) {
        if (matchSubnet(targetIp, prefix.ipv6_prefix)) {
          console.log(`🎉 Found matching subnet: ${prefix.ipv6_prefix}`);
          console.log(`Region: ${prefix.region}`);
          console.log(`Service: ${prefix.service}`);
        }
      }
    } catch (err) {
      console.error('Error parsing JSON:', err);
    }
  });
}).on('error', (err) => {
  console.error('Error fetching IP ranges:', err);
});
