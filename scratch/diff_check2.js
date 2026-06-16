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

const filePath = path.join(__dirname, '..', 'app/admin/prices/page.tsx');
let fileContent = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');

// Find return block in fileContent (which matches target start)
const startIdx = fileContent.indexOf('    return (\n        <div className="space-y-8 pb-16 animate-fade-in">');
console.log("Start index in file content:", startIdx);

if (startIdx === -1) {
    console.log("Could not find start of target in fileContent!");
    process.exit(1);
}

let matchedLength = 0;
while (matchedLength < target.length && fileContent.substring(startIdx, startIdx + matchedLength + 1) === target.substring(0, matchedLength + 1)) {
    matchedLength++;
}

console.log(`Matched first ${matchedLength} characters starting from return block.`);
console.log("Mismatch at target character:", JSON.stringify(target[matchedLength]));
console.log("File content at mismatch:", JSON.stringify(fileContent[startIdx + matchedLength]));

console.log("\nTarget around mismatch:\n" + target.substring(matchedLength - 50, matchedLength + 50));
console.log("\nFile content around mismatch:\n" + fileContent.substring(startIdx + matchedLength - 50, startIdx + matchedLength + 50));
