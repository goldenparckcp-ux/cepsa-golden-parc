const fs = require('fs');
let content = fs.readFileSync('app/profile/page.tsx', 'utf8');

const regex = /if \(diffMins <= 45\) \{[\s\S]*?\} else \{[\s\S]*?\}/;
const newLogic = if (diffMins <= 45) {
                alert("Annulation impossible: Il reste moins de 45 minutes. La commande ne peut plus être annulée.");
                return;
            } else {
                refundMsg = \\\n\\nDes frais de 10 DH seront déduits de votre garantie. Le reste (\ DH) sera remboursé.\;
            };

content = content.replace(regex, newLogic);
fs.writeFileSync('app/profile/page.tsx', content, 'utf8');
console.log('Cancel logic updated');
