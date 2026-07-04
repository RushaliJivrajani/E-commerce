const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', '(storefront)', 'account', 'login', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// The login page has hardcoded bg-black and text-black which doesn't respect theme tokens.
content = content.replace(/text-black/g, 'text-foreground');
content = content.replace(/bg-black/g, 'bg-foreground');
content = content.replace(/border-black/g, 'border-foreground');
content = content.replace(/hover:text-black/g, 'hover:text-foreground');
content = content.replace(/focus:border-black/g, 'focus:border-foreground');

// The left panel
content = content.replace(/bg-foreground p-12 text-white/g, 'bg-card p-12 text-foreground');
content = content.replace(/bg-gradient-to-t from-black via-black\/80 to-black\/20/g, 'bg-gradient-to-t from-background via-background/80 to-background/20');

// The button has bg-foreground text-white, but in light mode foreground is black, white is white. But we should just use primary or default btn styles.
content = content.replace(/bg-foreground py-4/g, 'bg-primary py-4 hover:bg-primary/90');
content = content.replace(/text-white/g, 'text-primary-foreground');

// The SVG icons that were white
content = content.replace(/text-primary-foreground/g, 'text-foreground'); // Revert text-white to foreground where it shouldn't be primary

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed login page colors');
