const { createClient } = require('@libsql/client');
require('dotenv').config();

const libsql = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  try {
    const res = await libsql.execute("SELECT name FROM sqlite_master WHERE type='table';");
    console.log('Tables:', res.rows.map(r => r.name));
    
    for (let r of res.rows) {
      if (r.name !== 'sqlite_sequence' && r.name !== 'sqlite_stat1') {
        const count = await libsql.execute(`SELECT count(*) as c FROM ${r.name}`);
        console.log(`Table ${r.name} count:`, count.rows[0].c);
      }
    }
  } catch (err) {
    console.error(err);
  }
}
main();
