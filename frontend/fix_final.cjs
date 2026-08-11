const fs = require('fs');
const path = require('path');
const dir = 'src/pages';
const files = ['Dashboard.tsx', 'Books.tsx', 'Students.tsx', 'Guests.tsx', 'Circulation.tsx'];

for (const file of files) {
  const fullPath = path.join(dir, file);
  if (fs.existsSync(fullPath)) {
    let code = fs.readFileSync(fullPath, 'utf8');
    
    // Replace all w-[xx%] in th tags
    code = code.replace(/w-\[\d+%\]/g, '');
    
    // Replace table classes with a simple table-auto, w-full, whitespace-nowrap
    code = code.replace(/<table className="w-full text-left border-collapse min-w-max md:min-w-full md:table-fixed">/g, '<table className="w-full text-left border-collapse whitespace-nowrap">');
    
    fs.writeFileSync(fullPath, code);
  }
}
console.log('Removed percentage widths and simplified table classes');
