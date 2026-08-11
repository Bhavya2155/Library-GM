const fs = require('fs');
const path = require('path');
const dir = 'src/pages';
const files = ['Books.tsx', 'Students.tsx', 'Guests.tsx'];
for (const file of files) {
  const fullPath = path.join(dir, file);
  if (fs.existsSync(fullPath)) {
    let code = fs.readFileSync(fullPath, 'utf8');
    
    // Replace header wrapper
    code = code.replace(/<div className="flex justify-between items-center mb-8">/g, '<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">');
    
    // Replace action wrapper
    code = code.replace(/<div className="flex gap-4">/g, '<div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">');
    
    // Make search bar stretch on mobile
    code = code.replace(/<div className="relative">\s*<Search/g, '<div className="relative w-full sm:w-auto">\n            <Search');
    
    // Make inputs stretch
    code = code.replace(/w-72/g, 'w-full sm:w-72');
    code = code.replace(/w-64/g, 'w-full sm:w-64');

    fs.writeFileSync(fullPath, code);
  }
}
console.log('Fixed headers for mobile layout wrap!');
