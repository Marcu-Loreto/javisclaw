import fs from 'fs';
import path from 'path';

function walk(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            walk(filePath, fileList);
        } else if (filePath.endsWith('.ts')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const srcDir = path.resolve(__dirname, '../src');
const files = walk(srcDir);

for (const file of files) {
    let content = fs.readFileSync(file, 'utf-8');
    // Replace relative imports ending with ' or " that don't already have an extension
    content = content.replace(/from\s+['"](\..*?)(?<!\.js)['"]/g, 'from \'$1.js\'');
    fs.writeFileSync(file, content);
}
console.log('Fixed imports in', files.length, 'files');
