const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;
    
    // Replace indigo and violet with slate
    content = content.replace(/indigo/g, 'slate');
    content = content.replace(/violet/g, 'slate');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('Updated: ' + filePath);
    }
  }
});
console.log('Done replacing colors.');
