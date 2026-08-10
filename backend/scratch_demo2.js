const Database = require('better-sqlite3');
const db = new Database('library.db');

const book = db.prepare('SELECT id FROM books LIMIT 1 OFFSET 1').get() || db.prepare('SELECT id FROM books LIMIT 1').get();
const student = db.prepare('SELECT id FROM students LIMIT 1 OFFSET 1').get() || db.prepare('SELECT id FROM students LIMIT 1').get();

if(book && student) {
   // Due in 12 hours (Will trigger notification)
   db.prepare(`INSERT INTO issued_books (bookId, studentId, issueDate, dueDate, status, renewals) 
               VALUES (?, ?, datetime('now', '-6 days'), datetime('now', '+12 hours'), 'issued', 0)`).run(book.id, student.id);
               
   console.log('Added another notification example!');
}
