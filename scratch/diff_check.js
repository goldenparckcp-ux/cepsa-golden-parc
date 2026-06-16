const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\lv\\.gemini\\antigravity\\brain\\c1dd0b3a-b68b-4dc9-b601-5da87c1b3726\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(logPath, 'utf-8').split('\n');

let target = '';
for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
        const obj = JSON.parse(line);
        if (obj.step_index === 2917) {
            const tc = obj.tool_calls[0];
            const args = tc.args ? (typeof tc.args === 'string' ? JSON.parse(tc.args) : tc.args) : {};
            target = args.TargetContent.replace(/\r\n/g, '\n');
        }
    } catch (e) {
    }
}

// Read current file content (which has step 2911 applied)
const filePath = path.join(__dirname, '..', 'app/admin/prices/page.tsx');
let fileContent = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');

// Find where it starts to differ
let matchedLength = 0;
while (matchedLength < target.length && fileContent.includes(target.substring(0, matchedLength + 1))) {
    matchedLength++;
}

console.log(`Matched first ${matchedLength} characters out of ${target.length}.`);
if (matchedLength < target.length) {
    console.log("Difference starts around target index:", matchedLength);
    console.log("Target text chunk around difference:\n" + target.substring(matchedLength - 50, matchedLength + 100));
    console.log("\nSearching for the difference in file content...");
    const sampleToFind = target.substring(matchedLength - 20, matchedLength);
    const idx = fileContent.indexOf(sampleToFind);
    if (idx !== -1) {
        console.log("Found context in file content. File text around difference:\n" + fileContent.substring(idx - 30, idx + 120));
    } else {
        console.log("Context not found in file content!");
    }
}
