const fs = require('fs');
let content = fs.readFileSync('app/services/pool/page.tsx', 'utf8');

// Container padding
content = content.replace(/p-5 md:p-8 space-y-6/g, 'p-3 md:p-4 space-y-4');

// Hero image size
content = content.replace(/h-48 md:h-80/g, 'h-32 md:h-48');
content = content.replace(/text-xl md:text-4xl font-black/g, 'text-lg md:text-2xl font-black');

// Ambiance buttons
content = content.replace(/py-3 md:py-6/g, 'py-2 md:py-3');
content = content.replace(/text-xl md:text-3xl/g, 'text-lg md:text-xl');

// Formula cards padding
content = content.replace(/p-4 md:p-5/g, 'p-3 md:p-4');

// Bottom action bar
content = content.replace(/p-4 md:p-6/g, 'p-3 md:p-4');
content = content.replace(/py-4 md:py-5/g, 'py-3 md:py-4');

fs.writeFileSync('app/services/pool/page.tsx', content, 'utf8');
console.log('Pool UI compacted');
