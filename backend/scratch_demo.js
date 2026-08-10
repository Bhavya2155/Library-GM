const Database = require('better-sqlite3');
const db = new Database('library.db');

const book = db.prepare('SELECT id FROM books LIMIT 1').get();
const student = db.prepare('SELECT id FROM students LIMIT 1').get();

if(book && student) {
   // 15 days ago (Overdue - Return Only)
   db.prepare(`INSERT INTO issued_books (bookId, studentId, issueDate, dueDate, status, renewals) 
               VALUES (?, ?, datetime('now', '-15 days'), datetime('now', '-8 days'), 'issued', 0)`).run(book.id, student.id);
   
   // Renewed (Undo Renew)
   db.prepare(`INSERT INTO issued_books (bookId, studentId, issueDate, dueDate, renewDate, status, renewals) 
               VALUES (?, ?, datetime('now', '-2 days'), datetime('now', '+12 days'), datetime('now', '-1 days'), 'issued', 1)`).run(book.id, student.id);
               
   // Returned (Undo Return)
   db.prepare(`INSERT INTO issued_books (bookId, studentId, issueDate, dueDate, returnDate, status, renewals) 
               VALUES (?, ?, datetime('now', '-10 days'), datetime('now', '-3 days'), datetime('now', '-2 days'), 'returned', 0)`).run(book.id, student.id);
               
   console.log('success');
}
