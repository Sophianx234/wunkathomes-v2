const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  if (!fs.existsSync(dir)) return filelist;
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
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

  // 1. Padding & Margin standardization (Steps of 2 or 4)
  // Replaces: p-3 -> p-4, m-3 -> m-4, gap-3 -> gap-4, px-3 -> px-4, etc.
  content = content.replace(/\b([pm]|gap|px|py|mx|my|pt|pb|mt|mb|pl|pr|ml|mr)-3\b/g, '$1-4');
  content = content.replace(/\b([pm]|gap|px|py|mx|my|pt|pb|mt|mb|pl|pr|ml|mr)-5\b/g, '$1-6');
  content = content.replace(/\b([pm]|gap|px|py|mx|my|pt|pb|mt|mb|pl|pr|ml|mr)-7\b/g, '$1-8');
  content = content.replace(/\b([pm]|gap|px|py|mx|my|pt|pb|mt|mb|pl|pr|ml|mr)-9\b/g, '$1-8');
  content = content.replace(/\b([pm]|gap|px|py|mx|my|pt|pb|mt|mb|pl|pr|ml|mr)-10\b/g, '$1-8');

  // 2. Optical Icon Standardization (strokeWidth=1.5 globally)
  // Replace existing strokeWidth with 1.5
  content = content.replace(/(<HugeiconsIcon[^>]*?)\bstrokeWidth=\{?[0-9.]+\}?(.*?\/?>)/g, '$1strokeWidth={1.5}$2');
  
  // If no strokeWidth exists, add it
  content = content.replace(/(<HugeiconsIcon(?:(?!strokeWidth).)*?)\/?>/g, (match) => {
    if (match.includes('strokeWidth')) return match;
    return match.replace(/\/?>$/, ' strokeWidth={1.5} />');
  });

  // Size standardization for HugeiconsIcon
  // Match `size={number}` or `size="number"`
  content = content.replace(/(<HugeiconsIcon[^>]*?\bsize=\{?)[1-9](\}?.*?\/?>)/g, '$114$2'); // size < 10 -> 14
  content = content.replace(/(<HugeiconsIcon[^>]*?\bsize=\{?)1[0-3](\}?.*?\/?>)/g, '$114$2'); // 10-13 -> 14
  content = content.replace(/(<HugeiconsIcon[^>]*?\bsize=\{?)1[4-5](\}?.*?\/?>)/g, '$114$2'); // 14-15 -> 14
  content = content.replace(/(<HugeiconsIcon[^>]*?\bsize=\{?)1[7-9](\}?.*?\/?>)/g, '$116$2'); // 17-19 -> 16
  content = content.replace(/(<HugeiconsIcon[^>]*?\bsize=\{?)[2-9][1-9](\}?.*?\/?>)/g, '$120$2'); // >= 21 -> 20

  // 3. Icon Color Standardization
  // Let's inject text-zinc-400 on HugeiconsIcon if it doesn't have a color class explicitly
  content = content.replace(/(<HugeiconsIcon[^>]*?)className="([^"]*?)"(.*?\/>)/g, (match, p1, p2, p3) => {
    let classes = p2.split(' ');
    classes = classes.filter(c => !c.startsWith('text-') || c.includes('white') || c.includes('emerald') || c.includes('rose') || c.includes('amber') || c.includes('blue') || c.includes('current'));
    if (!classes.some(c => c.startsWith('text-'))) {
      classes.push('text-zinc-400');
    }
    return `${p1}className="${classes.join(' ')}"${p3}`;
  });

  // Also add hover transitions to buttons and Link tags globally
  // We'll look for className="..." in <Link> or <Button> and add transition if missing
  // Since we don't have a full AST parser, we'll just aggressively add transitions to elements with interactive states (like hover:)
  content = content.replace(/className="([^"]*?hover:[^"]*?)"/g, (match, p1) => {
    let classes = p1.split(' ');
    if (!classes.includes('transition-all') && !classes.includes('transition-colors')) {
      classes.push('transition-all', 'duration-200', 'ease-out');
    }
    return `className="${classes.join(' ')}"`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log('Spacing and icons refactored successfully.');
