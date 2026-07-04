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

    // Primary Brand Accents
    content = content.replace(/text-indigo-600/g, 'text-primary');
    content = content.replace(/text-indigo-500/g, 'text-primary');
    content = content.replace(/text-indigo-700/g, 'text-primary');
    content = content.replace(/bg-indigo-500/g, 'bg-primary');
    content = content.replace(/bg-indigo-600/g, 'bg-primary');
    content = content.replace(/bg-indigo-50/g, 'bg-primary/10');
    content = content.replace(/bg-indigo-100/g, 'bg-primary/20');
    content = content.replace(/border-indigo-500/g, 'border-primary');
    content = content.replace(/border-indigo-200/g, 'border-primary/30');
    content = content.replace(/ring-indigo-500/g, 'ring-primary');
    content = content.replace(/fill-indigo-500/g, 'fill-primary');
    content = content.replace(/shadow-indigo-500/g, 'shadow-primary');

    content = content.replace(/text-teal-600/g, 'text-primary');
    content = content.replace(/text-teal-500/g, 'text-primary');
    content = content.replace(/bg-teal-50/g, 'bg-primary/10');
    content = content.replace(/border-teal-200/g, 'border-primary/30');
    content = content.replace(/fill-teal-500/g, 'fill-primary');

    // Semantic Text & Backgrounds
    content = content.replace(/text-slate-900/g, 'text-foreground');
    content = content.replace(/text-slate-800/g, 'text-foreground');
    content = content.replace(/text-slate-700/g, 'text-foreground/90');
    content = content.replace(/text-slate-600/g, 'text-foreground/80');
    content = content.replace(/text-slate-500/g, 'text-muted-foreground');
    content = content.replace(/text-slate-400/g, 'text-muted-foreground/80');
    content = content.replace(/text-slate-300/g, 'text-muted-foreground/50');
    content = content.replace(/text-slate-200/g, 'text-border');

    content = content.replace(/bg-white/g, 'bg-card');
    content = content.replace(/bg-slate-50/g, 'bg-card/50');
    content = content.replace(/bg-slate-100/g, 'bg-card/80');
    content = content.replace(/bg-slate-200/g, 'bg-border');
    content = content.replace(/bg-slate-900/g, 'bg-foreground text-background');

    content = content.replace(/border-slate-100/g, 'border-border/30');
    content = content.replace(/border-slate-200/g, 'border-border');
    content = content.replace(/border-slate-300/g, 'border-border/80');
    content = content.replace(/border-slate-400/g, 'border-border');

    // Remove legacy Tailwind slate shadows
    content = content.replace(/shadow-slate-200/g, 'shadow-sm');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      modifiedCount++;
      console.log('Updated: ' + filePath.split('src')[1]);
    }
  }
});
console.log('Total files modified for semantic colors: ' + modifiedCount);
