const fs = require('fs');
const content = fs.readFileSync('lib/i18n/dictionaries.ts', 'utf8');

const regex = /^\s*'([^']+)':/gm;
let match;
const keys = new Set();
const duplicates = new Set();
let lineNumber = 1;

const lines = content.split('\n');
lines.forEach((line, i) => {
    const m = line.match(/^\s*'([^']+)':/);
    if (m) {
        const key = m[1];
        if (keys.has(key)) {
            duplicates.add(key + " at line " + (i+1));
        } else {
            keys.add(key);
        }
    }
});

console.log('Duplicates:');
duplicates.forEach(d => console.log(d));
