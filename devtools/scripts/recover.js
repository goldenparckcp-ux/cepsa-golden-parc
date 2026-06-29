const fs = require('fs');

const logPath = 'C:\\Users\\lv\\.gemini\\antigravity\\brain\\c1dd0b3a-b68b-4dc9-b601-5da87c1b3726\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(logPath, 'utf-8').split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
        const obj = JSON.parse(line);
        // Find all replace_file_content calls for page.tsx
        if (obj.tool_calls) {
            for (const tc of obj.tool_calls) {
                if (tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
                    const args = tc.args ? (typeof tc.args === 'string' ? JSON.parse(tc.args) : tc.args) : {};
                    if (args.TargetFile && args.TargetFile.includes('prices/page.tsx')) {
                        console.log(`\n--- STEP ${obj.step_index} (${tc.name}) ---`);
                        console.log(`StartLine: ${args.StartLine}, EndLine: ${args.EndLine}`);
                        console.log(`TargetContent:\n${args.TargetContent}`);
                        console.log(`ReplacementContent:\n${args.ReplacementContent}`);
                    }
                }
            }
        }
    } catch (e) {
        // ignore JSON parse errors
    }
}
