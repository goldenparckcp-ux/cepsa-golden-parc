const fs = require('fs');
let content = fs.readFileSync('lib/state/CartContext.tsx', 'utf8');
content = content.replace(/name: string;/g, 'name: string;\n    name_ar?: string;');
fs.writeFileSync('lib/state/CartContext.tsx', content, 'utf8');
