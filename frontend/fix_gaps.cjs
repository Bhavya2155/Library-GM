const fs = require('fs');
const path = require('path');
const dir = 'src/pages';
const files = ['Dashboard.tsx', 'Books.tsx', 'Students.tsx', 'Guests.tsx', 'Circulation.tsx'];

for (const file of files) {
  const fullPath = path.join(dir, file);
  if (fs.existsSync(fullPath)) {
    let code = fs.readFileSync(fullPath, 'utf8');
    
    // Change padding for h-full overflow-y-auto p-8
    code = code.replace(/className="h-full overflow-y-auto p-8"/g, 'className="h-full overflow-y-auto p-4 md:p-8"');
    
    // Change padding for h-full flex flex-col p-8
    code = code.replace(/className="h-full flex flex-col p-8 overflow-hidden"/g, 'className="h-full flex flex-col p-4 md:p-8 overflow-hidden"');
    
    // Change Circulation padding
    if (file === 'Circulation.tsx') {
        code = code.replace(/px-8 pt-8 pb-0/g, 'px-4 pt-4 md:px-8 md:pt-8 pb-0');
    }
    
    // Fix table class: Replace min-w-[800px] xl:min-w-full xl:table-fixed with min-w-max md:min-w-full md:table-fixed
    code = code.replace(/min-w-\[800px\] xl:min-w-full xl:table-fixed/g, 'min-w-max md:min-w-full md:table-fixed');
    
    fs.writeFileSync(fullPath, code);
  }
}
console.log('Fixed padding and table width constraint');
