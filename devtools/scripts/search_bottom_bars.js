const fs = require('fs');
const path = require('path');

function search(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        search(fullPath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('fixed bottom') || content.includes('bottom-0') || content.includes('z-50') && content.includes('bar')) {
        console.log(`File: ${fullPath}`);
      }
    }
  }
}

search('c:/Users/lv/OneDrive/Desktop/woork/golden parck cepsa/cepsa-golden-park');
