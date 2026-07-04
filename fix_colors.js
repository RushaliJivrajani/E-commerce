const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'ProductDetailWrapper.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace tailwind colors with CSS variables (primary)
content = content.replace(/text-indigo-600/g, 'text-primary');
content = content.replace(/text-indigo-500/g, 'text-primary');
content = content.replace(/text-indigo-700/g, 'text-primary');
content = content.replace(/bg-indigo-500/g, 'bg-primary');
content = content.replace(/bg-indigo-600/g, 'bg-primary');
content = content.replace(/bg-indigo-50/g, 'bg-primary/10');
content = content.replace(/bg-indigo-100/g, 'bg-primary/20');
content = content.replace(/border-indigo-500/g, 'border-primary');
content = content.replace(/ring-indigo-500/g, 'ring-primary');
content = content.replace(/shadow-indigo-500\/20/g, 'shadow-primary/20');
content = content.replace(/shadow-indigo-500\/40/g, 'shadow-primary/40');
content = content.replace(/fill-indigo-500/g, 'fill-primary');

// Teal/Green fixes
content = content.replace(/text-teal-600/g, 'text-primary');
content = content.replace(/text-teal-500/g, 'text-primary');
content = content.replace(/bg-teal-50/g, 'bg-primary/10');
content = content.replace(/border-teal-200/g, 'border-primary/30');

// Rose fixes (usually errors or discounts)
content = content.replace(/bg-rose-500/g, 'bg-primary');
content = content.replace(/text-rose-500/g, 'text-primary');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed PDP colors.');
