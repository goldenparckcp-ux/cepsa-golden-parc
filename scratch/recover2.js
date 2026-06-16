const fs = require('fs');
const logPath = 'C:\\Users\\lv\\.gemini\\antigravity\\brain\\c1dd0b3a-b68b-4dc9-b601-5da87c1b3726\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(logPath, 'utf-8').split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
        const obj = JSON.parse(line);
        if (obj.tool_calls) {
            for (const tc of obj.tool_calls) {
                if (tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
                    const args = tc.args ? (typeof tc.args === 'string' ? JSON.parse(tc.args) : tc.args) : {};
                    const contentStr = JSON.stringify(args);
                    if (contentStr.includes('drawerType') || contentStr.includes('activeTab') || contentStr.includes('lubricantItems')) {
                        console.log(`Step ${obj.step_index}: ${tc.name} targeting: ${args.TargetFile}`);
                    }
                }
            }
        }
    } catch (e) {
    }
}
