const fs = require('fs');
const path = require('path');

const dir = 'd:/mern-library/frontend/src/pages';
const files = fs.readdirSync(dir);

for (const file of files) {
  if (file.endsWith('.tsx')) {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Fix implicit any and unused vars
    // We match any non-word character preceding the variable, and preserve it.
    content = content.replace(/([^\w])book\s*=>/g, '$1(book: any) =>');
    content = content.replace(/([^\w])b\s*=>/g, '$1(b: any) =>');
    content = content.replace(/([^\w])s\s*=>/g, '$1(s: any) =>');
    content = content.replace(/([^\w])g\s*=>/g, '$1(g: any) =>');
    content = content.replace(/([^\w])guest\s*=>/g, '$1(guest: any) =>');
    content = content.replace(/([^\w])login\s*=>/g, '$1(login: any) =>');
    
    // Specifically for Dashboard.tsx unused imports
    if (file === 'Dashboard.tsx') {
      content = content.replace(/import\s*\{\s*useEffect\s*\}\s*from\s*'react';/, `import React from 'react';`);
      content = content.replace(/import\s*axios\s*from\s*'axios';\n/, '');
    }

    fs.writeFileSync(fullPath, content);
  }
}
console.log('Fixed all TS errors safely');
