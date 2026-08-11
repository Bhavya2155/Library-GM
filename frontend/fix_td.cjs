const fs = require('fs');
let code = fs.readFileSync('src/pages/Books.tsx', 'utf8');

code = code.replace(/<td className="p-4 text-slate-500 font-mono text-xs truncate">\{book\.isbn\}<\/td>/g, '<td className="p-4 text-slate-500 font-mono text-xs truncate max-w-[120px] md:max-w-none">{book.isbn}</td>');
code = code.replace(/<td className="p-4 text-slate-900 font-medium truncate">\{book\.title\}<\/td>/g, '<td className="p-4 text-slate-900 font-medium truncate max-w-[180px] md:max-w-none">{book.title}</td>');
code = code.replace(/<td className="p-4 text-slate-600 truncate">\{book\.author\}<\/td>/g, '<td className="p-4 text-slate-600 truncate max-w-[150px] md:max-w-none">{book.author}</td>');

fs.writeFileSync('src/pages/Books.tsx', code);
