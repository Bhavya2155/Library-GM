require('dotenv').config();
const { createClient } = require('@libsql/client');
const fs = require('fs');
const Database = require('better-sqlite3');

async function migrate() {
  console.log("Connecting to local DB...");
  const localDb = new Database('./library.db');
  
  console.log("Connecting to Turso...");
  const turso = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
  });

  const tables = localDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
  
  for (const { name: tableName } of tables) {
    console.log(`Migrating table: ${tableName}`);
    const { sql } = localDb.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name=?").get(tableName);
    try { await turso.execute(sql); } catch (e) { }

    const rows = localDb.prepare(`SELECT * FROM "${tableName}"`).all();
    if (rows.length === 0) continue;

    const columns = Object.keys(rows[0]);
    const placeholders = columns.map(() => '?').join(',');
    const insertSql = `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(',')}) VALUES (${placeholders})`;

    const batchSize = 100;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const statements = batch.map(row => ({
        sql: insertSql,
        args: columns.map(c => row[c] === null ? null : row[c])
      }));
      try { await turso.batch(statements, 'write'); } catch (e) { console.log(e.message); }
    }
  }
  console.log("Migration complete!");
}
migrate().catch(console.error);
