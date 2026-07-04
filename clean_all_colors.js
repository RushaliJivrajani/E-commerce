const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedCount = 0;

walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // Catch ALL variants of legacy colors
    content = content.replace(/text-indigo-\d+/g, 'text-primary');
    content = content.replace(/bg-indigo-\d+/g, 'bg-primary');
    content = content.replace(/border-indigo-\d+/g, 'border-primary');
    content = content.replace(/ring-indigo-\d+/g, 'ring-primary');
    content = content.replace(/fill-indigo-\d+/g, 'fill-primary');
    content = content.replace(/shadow-indigo-\d+/g, 'shadow-primary');

    content = content.replace(/text-teal-\d+/g, 'text-primary');
    content = content.replace(/bg-teal-\d+/g, 'bg-primary/10');
    content = content.replace(/border-teal-\d+/g, 'border-primary/30');

    content = content.replace(/text-rose-\d+/g, 'text-primary');
    content = content.replace(/bg-rose-\d+/g, 'bg-primary');
    content = content.replace(/border-rose-\d+/g, 'border-primary');

    // Also some weird ones in hover:
    content = content.replace(/hover:text-indigo-\d+/g, 'hover:text-primary');
    content = content.replace(/hover:bg-indigo-\d+/g, 'hover:bg-primary');
    content = content.replace(/hover:border-indigo-\d+/g, 'hover:border-primary');

    // Replace the specific shadow that causes the yellow glow in empty cart
    content = content.replace(/shadow-\[0_0_20px_rgba\(251,191,36,0\.3\)\]/g, 'shadow-[0_0_20px_rgba(255,45,45,0.3)]');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      modifiedCount++;
      console.log('Updated: ' + filePath.split('src')[1]);
    }
  }
});
console.log('Total files modified for ALL legacy colors: ' + modifiedCount);
