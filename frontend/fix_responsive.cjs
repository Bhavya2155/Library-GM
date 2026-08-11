const fs = require('fs');
const path = require('path');
const dir = 'src/pages';
const files = ['Dashboard.tsx', 'Books.tsx', 'Students.tsx', 'Guests.tsx', 'Circulation.tsx'];
for (const file of files) {
  const fullPath = path.join(dir, file);
  if (fs.existsSync(fullPath)) {
    let code = fs.readFileSync(fullPath, 'utf8');
    
    // Fix table class
    code = code.replace(/<table min-w-max className="/g, '<table className="min-w-max ');
    
    // Fix Circulation specific responsive issues
    if (file === 'Circulation.tsx') {
      code = code.replace(/className="flex justify-between items-center mb-8 shrink-0"/g, 'className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 shrink-0"');
      code = code.replace(/className="flex items-center gap-3"/g, 'className="flex flex-wrap items-center gap-3 w-full lg:w-auto"');
    }
    
    fs.writeFileSync(fullPath, code);
  }
}
console.log('Fixed responsive layout bugs!');
