const fs = require('fs');
const path = require('path');

function processFile(filepath) {
    const origContent = fs.readFileSync(filepath, 'utf8');
    let content = origContent;

    // 1. BORDERS & SHADOWS
    content = content.replace(/\brounded-(?:xl|2xl|3xl)\b/g, 'rounded-lg');
    content = content.replace(/\bshadow-(?:md|lg|xl|2xl)\b/g, 'shadow-sm');
    content = content.replace(/\bborder-(?:slate|gray|zinc)-(?:100|200)(?!\/\d+)\b/g, 'border-zinc-200/60');

    // 3. COLOR PALETTE PURGE (Neutral Shifts)
    content = content.replace(/\bbg-(?:slate|gray)-50(?!\/\d+)\b/g, 'bg-zinc-50/50');
    content = content.replace(/\bbg-(?:slate|gray|zinc)-100(?!\/\d+)\b/g, 'bg-zinc-100/50');
    
    // Switch all slate/gray text and backgrounds to zinc
    content = content.replace(/\btext-(?:slate|gray)-(\d{3})\b/g, 'text-zinc-$1');
    content = content.replace(/\bbg-(?:slate|gray)-(\d{3})(?!\/\d+)\b/g, 'bg-zinc-$1');

    if (origContent !== content) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log('Updated: ' + filepath);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

walkDir('src/app');
walkDir('src/components');
