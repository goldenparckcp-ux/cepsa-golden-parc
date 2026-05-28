const fs = require('fs');
let content = fs.readFileSync('app/restaurant/page.tsx', 'utf8');

const oldText = "Visez le QR Code présent {onSiteLocation === 'table' ? 'sur votre table' : 'à votre place'}.";
const newText = "{onSiteLocation === 'table' ? 'Visez le QR Code sur votre table' : onSiteLocation === 'pool' ? 'Visez le QR Code à votre place' : onSiteLocation === 'room' ? 'Visez le QR Code dans votre chambre' : 'Visez le QR Code'}";

content = content.replace(oldText, newText);

fs.writeFileSync('app/restaurant/page.tsx', content, 'utf8');
console.log('Scanner text updated');
