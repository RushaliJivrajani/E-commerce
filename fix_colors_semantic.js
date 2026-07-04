const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'ProductDetailWrapper.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace hardcoded slate and white/black with semantic colors
content = content.replace(/text-slate-900/g, 'text-foreground');
content = content.replace(/text-slate-800/g, 'text-foreground');
content = content.replace(/text-slate-700/g, 'text-foreground/90');
content = content.replace(/text-slate-600/g, 'text-foreground/80');
content = content.replace(/text-slate-500/g, 'text-muted-foreground');
content = content.replace(/text-slate-400/g, 'text-muted-foreground');
content = content.replace(/text-slate-300/g, 'text-muted-foreground/50');
content = content.replace(/text-slate-200/g, 'text-border');

content = content.replace(/bg-white/g, 'bg-card');
content = content.replace(/bg-slate-50/g, 'bg-card/50');
content = content.replace(/bg-slate-100/g, 'bg-card/80');
content = content.replace(/bg-slate-200/g, 'bg-border');
content = content.replace(/bg-slate-900/g, 'bg-foreground text-background'); // often used for primary buttons

content = content.replace(/border-slate-100/g, 'border-border/30');
content = content.replace(/border-slate-200/g, 'border-border');
content = content.replace(/border-slate-300/g, 'border-border/80');

content = content.replace(/fill-slate-100/g, 'fill-border');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed semantic colors in PDP.');
