const fs = require('fs');
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../library.db'));
const text = fs.readFileSync(path.join(__dirname, 'ocr_data.txt'), 'utf8');

const lines = text.split('\n').map(l => l.trim()).filter(l => l);

const records = [];
let currentRecord = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const match = line.match(/^(\d+)\s+([A-Za-z0-9-]+)\s+(.+)$/);
  if (match) {
    if (currentRecord) {
      records.push(currentRecord);
    }
    currentRecord = {
      sr: parseInt(match[1]),
      isbn: match[2],
      title: match[3],
      rawLines: []
    };
  } else if (currentRecord) {
    currentRecord.rawLines.push(line);
  }
}
if (currentRecord) records.push(currentRecord);

const languages = ['GUJARATI', 'ENGLISH', 'HINDI', 'UNKNOWN'];
let successCount = 0;

records.forEach(r => {
  const fullText = r.rawLines.join(' ');
  
  let language = '';
  let author = '';
  let category = '';
  
  let langIndex = -1;
  for (const lang of languages) {
    const idx = fullText.lastIndexOf(lang); // Use lastIndexOf to catch the language properly
    if (idx !== -1 && idx > langIndex) {
      langIndex = idx;
      language = lang;
    }
  }
  
  if (langIndex !== -1) {
    author = fullText.substring(0, langIndex).trim();
    category = fullText.substring(langIndex + language.length).trim();
  } else {
    author = fullText;
    category = 'UNKNOWN';
  }
  
  category = category.replace(/\s*\/\s*/g, ' / ').replace(/\s+/g, ' ');
  author = author.replace(/\s+/g, ' ');

  try {
    const existing = db.prepare('SELECT id FROM books WHERE isbn = ?').get(r.isbn);
    if (!existing) {
       db.prepare(`INSERT INTO books (title, author, isbn, category, quantity, availableCopies) VALUES (?, ?, ?, ?, ?, ?)`).run(r.title, author, r.isbn, category, 1, 1);
       successCount++;
    }
  } catch(e) {
    console.error('Error inserting', r.isbn, e.message);
  }
});

console.log(`Parsed ${records.length} records. Successfully inserted ${successCount} new books.`);
