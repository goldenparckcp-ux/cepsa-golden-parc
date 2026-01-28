const fs = require('fs');
const path = require('path');

// Color replacements map
const replacements = [
    // Blue to Red
    { from: /bg-blue-600/g, to: 'bg-red-600' },
    { from: /bg-blue-500/g, to: 'bg-red-500' },
    { from: /bg-blue-900/g, to: 'bg-red-900' },
    { from: /text-blue-400/g, to: 'text-red-400' },
    { from: /text-blue-500/g, to: 'text-red-500' },
    { from: /text-blue-200/g, to: 'text-red-200' },
    { from: /border-blue-500/g, to: 'border-red-500' },
    { from: /from-blue-600/g, to: 'from-red-600' },
    { from: /from-blue-900/g, to: 'from-red-900' },
    { from: /to-blue-500/g, to: 'to-red-700' },
    { from: /shadow-blue-500/g, to: 'shadow-red-500' },
    { from: /focus:border-blue-500/g, to: 'focus:border-red-500' },
    { from: /hover:bg-blue-500/g, to: 'hover:bg-red-500' },
    { from: /group-hover:bg-blue-500/g, to: 'group-hover:bg-red-500' },

    // Cyan to Red
    { from: /bg-cyan-600/g, to: 'bg-red-600' },
    { from: /bg-cyan-500/g, to: 'bg-red-500' },
    { from: /text-cyan-400/g, to: 'text-red-400' },
    { from: /text-cyan-500/g, to: 'text-red-500' },
    { from: /border-cyan-500/g, to: 'border-red-500' },
    { from: /shadow-cyan-500/g, to: 'shadow-red-500' },
    { from: /focus:border-cyan-500/g, to: 'focus:border-red-500' },
    { from: /hover:bg-cyan-500/g, to: 'hover:bg-red-500' },
    { from: /group-hover:bg-cyan-500/g, to: 'group-hover:bg-red-500' },
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    replacements.forEach(({ from, to }) => {
        if (from.test(content)) {
            content = content.replace(from, to);
            modified = true;
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed: ${filePath}`);
        return 1;
    }
    return 0;
}

function walkDir(dir) {
    let count = 0;
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            count += walkDir(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            count += processFile(filePath);
        }
    });

    return count;
}

console.log('🎨 Starting color correction...\n');
const totalFixed = walkDir('./app');
console.log(`\n✅ Fixed ${totalFixed} files!`);
