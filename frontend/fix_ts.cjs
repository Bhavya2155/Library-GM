const fs = require('fs');

const path = 'd:/mern-library/frontend/src/pages/Circulation.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix implicit any errors in Circulation.tsx
content = content.replace(/books\.find\(b =>/g, `books.find((b: any) =>`);
content = content.replace(/allBooks\.find\(b =>/g, `allBooks.find((b: any) =>`);
content = content.replace(/books\.filter\(b =>/g, `books.filter((b: any) =>`);

fs.writeFileSync(path, content);
console.log('Fixed typescript any errors');
