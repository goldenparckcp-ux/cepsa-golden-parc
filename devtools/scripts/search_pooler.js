const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

function search(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.git' || file === '.next') continue;
    
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      search(fullPath);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.sql') || file.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('pooler.supabase.com') || content.includes('aws-0')) {
          console.log(`Found match in: ${fullPath}`);
          // Print matching lines
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            if (line.includes('pooler.supabase.com') || line.includes('aws-0')) {
              console.log(`  L${idx + 1}: ${line.trim()}`);
            }
          });
        }
      }
    }
  }
}

search(rootDir);
