const fs = require('fs');
const path = require('path');
const dir = 'src/pages';
const files = ['Dashboard.tsx', 'Books.tsx', 'Students.tsx', 'Guests.tsx', 'Circulation.tsx'];
for (const file of files) {
  const fullPath = path.join(dir, file);
  if (fs.existsSync(fullPath)) {
    let code = fs.readFileSync(fullPath, 'utf8');
    
    // First, let's normalize by replacing all table classes back to base
    code = code.replace(/<table className="min-w-max w-full text-left border-collapse">/g, '<table className="w-full text-left border-collapse min-w-[800px] xl:min-w-full xl:table-fixed">');
    code = code.replace(/<table className="w-full text-left border-collapse min-w-max">/g, '<table className="w-full text-left border-collapse min-w-[800px] xl:min-w-full xl:table-fixed">');
    
    // Fallbacks just in case
    code = code.replace(/<table className="min-w-[800px] xl:min-w-full xl:table-fixed w-full text-left border-collapse">/g, '<table className="w-full text-left border-collapse min-w-[800px] xl:min-w-full xl:table-fixed">');

    fs.writeFileSync(fullPath, code);
  }
}
console.log('Fixed PC tables!');
