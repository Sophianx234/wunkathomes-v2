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

  // Add size={16} to any HugeiconsIcon that is missing a size property
  // Lookahead ensures size= is not present before the end of the tag (>)
  content = content.replace(/(<HugeiconsIcon(?![^>]*?\bsize=)[^>]*?)\/?>/g, '$1 size={16} />');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log('Added missing size={16} attributes safely.');
