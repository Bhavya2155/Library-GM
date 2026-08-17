const { createClient } = require('@libsql/client');
require('dotenv').config();
const fs = require('fs');

const libsql = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  const data = JSON.parse(fs.readFileSync('./books_data.json', 'utf8'));
  console.log(`Loaded ${data.length} books. Inserting...`);
  
  const clean = (s) => s ? String(s).replace(/\n/g, ' ').trim() : '';
  
  let success = 0;
  let failed = 0;
  
  for (let b of data) {
    try {
      await libsql.execute({
        sql: `INSERT INTO books (isbn, title, author, category, language, quantity, availableCopies, createdAt) 
              VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        args: [
          clean(b.isbn),
          clean(b.title),
          clean(b.author),
          clean(b.category),
          clean(b.language),
          b.quantity,
          b.availableCopies
        ]
      });
      success++;
    } catch (e) {
      if (e.message.includes('UNIQUE constraint failed')) {
         failed++;
      } else {
         console.error('Failed on', b.isbn, e.message);
         failed++;
      }
    }
    if (success > 0 && success % 100 === 0) console.log(`Inserted ${success} books...`);
  }
  
  console.log(`Finished! Success: ${success}, Failed: ${failed}`);
}

main();
