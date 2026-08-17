const { createClient } = require('@libsql/client');
require('dotenv').config();

const libsql = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  try {
    await libsql.execute("ALTER TABLE books ADD COLUMN language TEXT NOT NULL DEFAULT 'English';");
    console.log('Added language column to books table');
  } catch(err) {
    console.error('Error:', err);
  }
}
main();
