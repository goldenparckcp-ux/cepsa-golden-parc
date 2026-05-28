const fs = require('fs');
let content = fs.readFileSync('app/restaurant/page.tsx', 'utf8');

content = content.replace(/const { t } = useTranslation\(\);/g, 'const { t, language } = useTranslation();');

fs.writeFileSync('app/restaurant/page.tsx', content, 'utf8');
console.log('Language extracted');
