const fs = require('fs');
const path = require('path');
const dir = 'src/pages';
const files = ['Dashboard.tsx', 'Books.tsx', 'Students.tsx', 'Guests.tsx'];
for (const file of files) {
  const fullPath = path.join(dir, file);
  if (fs.existsSync(fullPath)) {
    let code = fs.readFileSync(fullPath, 'utf8');
    
    // Fix nested divs
    code = code.replace(/<div className="overflow-x-auto">\s*<div className="overflow-x-auto w-full">/g, '<div className="overflow-x-auto">');
    code = code.replace(/<\/table>\s*<\/div>\s*<\/div>/g, '</table>\n          </div>');
    
    // Fix table class
    code = code.replace(/<table className=".*?"/g, '<table className="w-full text-left border-collapse min-w-[800px] xl:min-w-full xl:table-fixed"');
    
    fs.writeFileSync(fullPath, code);
  }
}
console.log('Fixed nested divs and table classes!');
