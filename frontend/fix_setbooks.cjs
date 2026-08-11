const fs = require('fs');

const path = 'd:/mern-library/frontend/src/pages/Circulation.tsx';
let content = fs.readFileSync(path, 'utf8');

// handleIssue
content = content.replace(/setBooks\(prev => prev\.map\(b => b\._id === bookId \? \{ \.\.\.b, availableCopies: b\.availableCopies - 1 \} : b\)\.filter\(b => b\.availableCopies > 0\)\);/g, 
  `mutateBooks((prev: any[] = []) => prev.map(b => b._id === bookId ? { ...b, availableCopies: b.availableCopies - 1 } : b), false);`);

// handleReturn
content = content.replace(/setBooks\(prev => prev\.map\(b => b\._id === records\.find\(r => r\._id === id\)\?\.bookId\?\._id \? \{ \.\.\.b, availableCopies: b\.availableCopies \+ 1 \} : b\)\);/g,
  `const returnedBookId = records.find(r => r._id === id)?.bookId?._id;\n      mutateBooks((prev: any[] = []) => prev.map(b => b._id === returnedBookId ? { ...b, availableCopies: b.availableCopies + 1 } : b), false);`);

// handleReturn error rollback
content = content.replace(/setBooks\(prev => prev\.map\(b => b\._id === record\.bookId\?\._id \? \{ \.\.\.b, availableCopies: b\.availableCopies - 1 \} : b\)\.filter\(b => b\.availableCopies > 0\)\);/g,
  `mutateBooks((prev: any[] = []) => prev.map(b => b._id === record.bookId?._id ? { ...b, availableCopies: b.availableCopies - 1 } : b), false);`);

// handleUndoReturn
content = content.replace(/setBooks\(prev => prev\.map\(b => b\._id === records\.find\(r => r\._id === id\)\?\.bookId\?\._id \? \{ \.\.\.b, availableCopies: b\.availableCopies - 1 \} : b\)\);/g,
  `const undoBookId = records.find(r => r._id === id)?.bookId?._id;\n      mutateBooks((prev: any[] = []) => prev.map(b => b._id === undoBookId ? { ...b, availableCopies: b.availableCopies - 1 } : b), false);`);

// handleUndoReturn error rollback
content = content.replace(/setBooks\(prev => prev\.map\(b => b\._id === record\.bookId\?\._id \? \{ \.\.\.b, availableCopies: b\.availableCopies \+ 1 \} : b\)\);/g,
  `mutateBooks((prev: any[] = []) => prev.map(b => b._id === record.bookId?._id ? { ...b, availableCopies: b.availableCopies + 1 } : b), false);`);

// handleDelete
content = content.replace(/setBooks\(prev => prev\.map\(b => b\._id === record\.bookId\?\._id \? \{ \.\.\.b, availableCopies: b\.availableCopies \+ 1 \} : b\)\);/g,
  `mutateBooks((prev: any[] = []) => prev.map(b => b._id === record.bookId?._id ? { ...b, availableCopies: b.availableCopies + 1 } : b), false);`);

fs.writeFileSync(path, content);
console.log('Done fixing setBooks');
