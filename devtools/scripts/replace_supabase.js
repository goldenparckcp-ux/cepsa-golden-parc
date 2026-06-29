const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'app/admin/prices/page.tsx',
  'app/admin/qrcodes/page.tsx',
  'app/admin/content/page.tsx',
  'app/admin/layout.tsx'
];

filesToUpdate.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Add import { adminDb } if it doesn't exist
    if (!content.includes('import { adminDb }')) {
      content = content.replace(
        /import \{ supabase \} from "@\/lib\/supabase";/g,
        `import { supabase } from "@/lib/supabase";\nimport { adminDb } from "@/lib/admin-api";`
      );
    }
    
    // Replace supabase.from with adminDb
    content = content.replace(/supabase\s*\.\s*from\s*\(/g, 'adminDb(');
    
    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
