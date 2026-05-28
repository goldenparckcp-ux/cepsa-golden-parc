const fs = require('fs');
let content = fs.readFileSync('app/hotel/page.tsx', 'utf8');

// Reduce container paddings
content = content.replace(/p-5 md:p-8 space-y-6/g, 'p-3 md:p-4 space-y-4');
content = content.replace(/p-6 rounded-2xl/g, 'p-4 rounded-xl');

// Reduce room image sizes
content = content.replace(/h-48 md:h-56/g, 'h-32 md:h-40');

// Reduce title sizes inside cards
content = content.replace(/text-xl font-black/g, 'text-lg font-black');

// Make the features grid tighter
content = content.replace(/gap-4 mt-4/g, 'gap-2 mt-3');

fs.writeFileSync('app/hotel/page.tsx', content, 'utf8');
console.log('Hotel UI compacted');
