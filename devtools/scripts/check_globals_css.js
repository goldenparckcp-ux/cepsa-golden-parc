const fs = require('fs');
const content = fs.readFileSync('c:/Users/lv/OneDrive/Desktop/woork/golden parck cepsa/cepsa-golden-park/app/globals.css', 'utf8');
console.log('Contains scrollbar-hide:', content.includes('scrollbar-hide'));
if (content.includes('scrollbar-hide')) {
    // print where it is
    const lines = content.split('\n');
    lines.forEach((l, i) => {
        if (l.includes('scrollbar-hide')) {
            console.log(`Line ${i+1}: ${l}`);
            for (let j = i; j < i + 8; j++) {
                console.log(`  ${j+1}: ${lines[j]}`);
            }
        }
    });
}
