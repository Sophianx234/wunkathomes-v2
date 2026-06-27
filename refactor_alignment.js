const fs = require('fs');
const walkSync = (dir, filelist = []) => {
  if (!fs.existsSync(dir)) return filelist;
  fs.readdirSync(dir).forEach(file => {
    const dirFile = require('path').join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.tsx') || dirFile.endsWith('.jsx')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync('./src/app').concat(walkSync('./src/components'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Text line height alignments
  // Anywhere there's text-xs, text-[11px], text-[12px], text-[13px] text-[10px], ensure we have leading-tight
  content = content.replace(/className="([^"]*?text-(?:xs|sm|\[[0-9]+px\])[^"]*?)"/g, (match, p1) => {
    let classes = p1.split(' ');
    // If it doesn't already have a leading class
    if (!classes.some(c => c.startsWith('leading-'))) {
      classes.push('leading-tight');
    }
    return `className="${classes.join(' ')}"`;
  });

  // 2. Button and isolated Icon wrappers
  // e.g., if there's a Button variant="icon" or size="icon"
  content = content.replace(/(<Button[^>]*?size="icon"[^>]*?)className="([^"]*?)"/g, (match, p1, p2) => {
    let classes = p2.split(' ');
    const desired = ['flex', 'items-center', 'justify-center', 'shrink-0'];
    desired.forEach(d => { if (!classes.includes(d)) classes.push(d); });
    return `${p1}className="${classes.join(' ')}"`;
  });

  // 3. Flex icon and text alignments
  // In many places, it's just `flex items-center gap-1`. The rule requests gap-2 or gap-1.5 for high density.
  // We'll replace gap-1 with gap-1.5 if it is adjacent to items-center
  content = content.replace(/items-center gap-1\b/g, 'items-center gap-1.5');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log('Alignment refactoring complete.');
