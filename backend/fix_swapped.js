const { createClient } = require('@libsql/client');
require('dotenv').config();

const libsql = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  try {
    const res = await libsql.execute("SELECT id, category, language FROM books WHERE category IN ('ENGLISH', 'GUJARATI', 'HINDI', 'SANSKRIT', 'English', 'Gujarati', 'Hindi', 'Sanskrit', 'MARATHI', 'Marathi')");
    
    console.log(`Found ${res.rows.length} swapped books.`);
    
    let updated = 0;
    for (let r of res.rows) {
      await libsql.execute({
        sql: "UPDATE books SET category = ?, language = ? WHERE id = ?",
        args: [r.language, r.category, r.id]
      });
      updated++;
    }
    console.log(`Successfully fixed ${updated} books.`);
  } catch (err) {
    console.error(err);
  }
}
main();
