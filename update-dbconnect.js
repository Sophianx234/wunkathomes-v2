const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
let changedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const importRegex = /import\s+DbConnect\s+from\s+['"]([^'"]*DbConnect)['"]/g;
  if (importRegex.test(content)) {
    content = content.replace(importRegex, 'import { connectToDatabase } from \'$1\'');
    changed = true;
  }

  if (content.includes('DbConnect()')) {
    content = content.replace(/DbConnect\(\)/g, 'connectToDatabase()');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
    console.log('Updated', file);
  }
}

console.log('Total files updated:', changedCount);
