const fs = require('fs');
const path = require('path');

const dir = 'src/pages';
const files = ['Dashboard.tsx', 'Books.tsx', 'Students.tsx', 'Guests.tsx'];

for (const file of files) {
  const fullPath = path.join(dir, file);
  if (fs.existsSync(fullPath)) {
    let code = fs.readFileSync(fullPath, 'utf8');

    // Replace `<table` with `<div className="overflow-x-auto w-full"><table`
    // But we need to make sure we don't do it twice, and we close it properly
    // It's easier to just use a targeted replace.
    if (!code.includes('<div className="overflow-x-auto w-full">')) {
      code = code.replace(/<table /g, `<div className="overflow-x-auto w-full">\n              <table min-w-max `);
      code = code.replace(/<\/table>/g, `</table>\n            </div>`);
    }

    fs.writeFileSync(fullPath, code);
  }
}
console.log('Tables made responsive!');
