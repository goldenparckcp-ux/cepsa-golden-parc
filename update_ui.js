const fs = require('fs');
let content = fs.readFileSync('app/restaurant/page.tsx', 'utf8');

content = content.replace(/>{item\.name}</g, '>{language === "ar" ? (item.name_ar || item.name) : item.name}<');

content = content.replace(/>{item\.description}</g, '>{language === "ar" ? (item.description_ar || item.description) : item.description}<');

content = content.replace(/title={customizeItem\?.name \|\| "Personnaliser"}/g, 'title={(language === "ar" && customizeItem?.name_ar) ? customizeItem.name_ar : (customizeItem?.name || "Personnaliser")}');

content = content.replace(/<div className="font-bold text-white text-lg truncate">{item\.name}<\/div>/g, '<div className="font-bold text-white text-lg truncate">{language === "ar" ? (item.name_ar || item.name) : item.name}</div>');

content = content.replace(/result\[0\]\.text;/g, '(result[0] as any).text;');

fs.writeFileSync('app/restaurant/page.tsx', content, 'utf8');
console.log('UI updated');
