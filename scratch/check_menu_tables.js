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
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const hasMenuItems = content.includes('menu_items');
      const hasRestaurantItems = content.includes('restaurant_items');
      if (hasMenuItems || hasRestaurantItems) {
        console.log(`File: ${fullPath}`);
        if (hasMenuItems) console.log('  -> contains "menu_items"');
        if (hasRestaurantItems) console.log('  -> contains "restaurant_items"');
      }
    }
  }
}

search('c:/Users/lv/OneDrive/Desktop/woork/golden parck cepsa/cepsa-golden-park');
