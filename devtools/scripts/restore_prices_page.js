const fs = require('fs');
const path = require('path');

// 1. Get original content from git HEAD
const filePath = path.join(__dirname, '..', 'app/admin/prices/page.tsx');
const { execSync } = require('child_process');
execSync('git checkout app/admin/prices/page.tsx');
let fileContent = fs.readFileSync(filePath, 'utf-8');

console.log(`Original file length: ${fileContent.split('\n').length} lines`);

function replaceSpaceInsensitive(source, target, replacement) {
    // Escape regex special chars
    const escaped = target.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    // Replace whitespace sequences with \s+
    const regexStr = escaped.replace(/\s+/g, '\\s+');
    const regex = new RegExp(regexStr);
    const match = source.match(regex);
    if (match) {
        return source.replace(regex, replacement);
    }
    return null;
}

// 2. Read logs to get all modifications in chronological order
const logPath = 'C:\\Users\\lv\\.gemini\\antigravity\\brain\\c1dd0b3a-b68b-4dc9-b601-5da87c1b3726\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(logPath, 'utf-8').split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
        const obj = JSON.parse(line);
        // ONLY APPLY STEPS BEFORE THE BUGGY STEP 3170
        if (obj.step_index < 3170 && obj.tool_calls) {
            for (const tc of obj.tool_calls) {
                if (tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
                    const args = tc.args ? (typeof tc.args === 'string' ? JSON.parse(tc.args) : tc.args) : {};
                    if (args.TargetFile) {
                        const targetFileNormalized = args.TargetFile.replace(/\\/g, '/');
                        if (targetFileNormalized.includes('app/admin/prices/page.tsx')) {
                            console.log(`Applying step ${obj.step_index} (${tc.name})...`);
                            if (tc.name === 'replace_file_content') {
                                const target = args.TargetContent;
                                const replacement = args.ReplacementContent;
                                const res = replaceSpaceInsensitive(fileContent, target, replacement);
                                if (res !== null) {
                                    fileContent = res;
                                    console.log(`  Success!`);
                                } else {
                                    console.warn(`  Warning: TargetContent not found in file content for step ${obj.step_index}!`);
                                }
                            } else if (tc.name === 'multi_replace_file_content') {
                                const chunks = args.ReplacementChunks || [];
                                for (const chunk of chunks) {
                                    const target = chunk.TargetContent;
                                    const replacement = chunk.ReplacementContent;
                                    const res = replaceSpaceInsensitive(fileContent, target, replacement);
                                    if (res !== null) {
                                        fileContent = res;
                                        console.log(`  Chunk Success!`);
                                    } else {
                                        console.warn(`  Warning: Chunk TargetContent not found in file content!`);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    } catch (e) {
        // ignore JSON parse errors
    }
}

// Write the recovered content back
fs.writeFileSync(filePath, fileContent, 'utf-8');
console.log(`Recovered file length: ${fileContent.split('\n').length} lines`);
