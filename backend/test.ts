import db from './src/lib/db'; async function main() { console.log('Books:', await db.book.count()); } main().finally(()=>process.exit(0));
