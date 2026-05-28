const fs = require('fs');
let content = fs.readFileSync('app/restaurant/page.tsx', 'utf8');

content = content.replace(/name: customizeItem\.name,/g, 'name: customizeItem.name,\n            name_ar: customizeItem.name_ar,');

fs.writeFileSync('app/restaurant/page.tsx', content, 'utf8');
console.log('Cart updated');
