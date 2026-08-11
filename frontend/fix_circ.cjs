const fs = require('fs');

const path = 'd:/mern-library/frontend/src/pages/Circulation.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Replace initialBooks hook
content = content.replace(
  `const { data: initialBooks } = useSWR('/books');`,
  `const { data: initialBooks = [], mutate: mutateBooks } = useSWR('/books');`
);

// 2. Remove books useState and replace with derived state
content = content.replace(
  `  const [books, setBooks] = useState<any[]>([]);\n`,
  `  const books = (initialBooks || []).filter((b: any) => b.availableCopies > 0);\n  const allBooks = initialBooks || [];\n`
);

// 3. Remove the useEffect for books
content = content.replace(
  `  useEffect(() => {\n    if (initialBooks) setBooks(initialBooks.filter((b: any) => b.availableCopies > 0));\n  }, [initialBooks]);\n\n`,
  ``
);

// 4. Update handleIssue optimistic update
content = content.replace(
  `          setBooks(prev => prev.map(b => b._id === bookId ? { ...b, availableCopies: b.availableCopies - 1 } : b).filter(b => b.availableCopies > 0));`,
  `          mutateBooks((prev: any[] = []) => prev.map(b => b._id === bookId ? { ...b, availableCopies: b.availableCopies - 1 } : b), false);`
);

// 5. Update return optimistic update (success)
content = content.replace(
  `      // Instant Reflect\n      setRecords(prev => prev.map(r => r._id === id ? { ...r, status: 'returned', returnDate: new Date().toISOString() } : r));\n      setBooks(prev => prev.map(b => b._id === records.find(r => r._id === id)?.bookId?._id ? { ...b, availableCopies: b.availableCopies + 1 } : b));\n\n      axios.post(\`/circulation/return/\${id}\`)`,
  `      // Instant Reflect\n      setRecords(prev => prev.map(r => r._id === id ? { ...r, status: 'returned', returnDate: new Date().toISOString() } : r));\n      const bookIdToReturn = records.find(r => r._id === id)?.bookId?._id;\n      mutateBooks((prev: any[] = []) => prev.map(b => b._id === bookIdToReturn ? { ...b, availableCopies: b.availableCopies + 1 } : b), false);\n\n      axios.post(\`/circulation/return/\${id}\`)`
);

// 6. Update return rollback (error)
content = content.replace(
  `          setBooks(prev => prev.map(b => b._id === record.bookId?._id ? { ...b, availableCopies: b.availableCopies - 1 } : b).filter(b => b.availableCopies > 0));`,
  `          mutateBooks((prev: any[] = []) => prev.map(b => b._id === record.bookId?._id ? { ...b, availableCopies: b.availableCopies - 1 } : b), false);`
);

// 7. Update undo-return optimistic update
content = content.replace(
  `      // Instant Reflect\n      setRecords(prev => prev.map(r => r._id === id ? { ...r, status: 'issued', returnDate: null } : r));\n      setBooks(prev => prev.map(b => b._id === records.find(r => r._id === id)?.bookId?._id ? { ...b, availableCopies: b.availableCopies - 1 } : b));\n\n      axios.post(\`/circulation/undo-return/\${id}\`)`,
  `      // Instant Reflect\n      setRecords(prev => prev.map(r => r._id === id ? { ...r, status: 'issued', returnDate: null } : r));\n      const bookIdToUndo = records.find(r => r._id === id)?.bookId?._id;\n      mutateBooks((prev: any[] = []) => prev.map(b => b._id === bookIdToUndo ? { ...b, availableCopies: b.availableCopies - 1 } : b), false);\n\n      axios.post(\`/circulation/undo-return/\${id}\`)`
);

// 8. Update undo-return rollback (error)
content = content.replace(
  `          setBooks(prev => prev.map(b => b._id === record.bookId?._id ? { ...b, availableCopies: b.availableCopies + 1 } : b));`,
  `          mutateBooks((prev: any[] = []) => prev.map(b => b._id === record.bookId?._id ? { ...b, availableCopies: b.availableCopies + 1 } : b), false);`
);

// 9. Update delete optimistic update
content = content.replace(
  `        setBooks(prev => prev.map(b => b._id === record.bookId?._id ? { ...b, availableCopies: b.availableCopies + 1 } : b));`,
  `        mutateBooks((prev: any[] = []) => prev.map(b => b._id === record.bookId?._id ? { ...b, availableCopies: b.availableCopies + 1 } : b), false);`
);

// 10. Change rendering logic for title and ISBN to use allBooks so it doesn't disappear immediately
content = content.replace(
  `{books.find(b => b._id === bookId)?.title}`,
  `{allBooks.find(b => b._id === bookId)?.title}`
);
content = content.replace(
  `{books.find(b => b._id === bookId)?.title}`,
  `{allBooks.find(b => b._id === bookId)?.title}`
);
content = content.replace(
  `{books.find(b => b._id === bookId)?.isbn}`,
  `{allBooks.find(b => b._id === bookId)?.isbn}`
);

fs.writeFileSync(path, content);
console.log('Done modifying Circulation.tsx');
