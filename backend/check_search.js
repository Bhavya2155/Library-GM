require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');

const libsql = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

async function main() {
  const allBooks = await prisma.book.findMany();
  const initialBooks = allBooks.map(b => ({ ...b, _id: b.id }));
  
  const books = initialBooks.filter(b => b.availableCopies > 0);
  
  const prefix = 'ST';
  const num = '107';
  const searchCode = `${prefix}-${num}`;
  const searchCodeNoHyphen = `${prefix}${num}`;
  const searchCodeNumOnly = num;
  
  const found = books.find(b => {
    const isbn = b.isbn.toUpperCase();
    return isbn === searchCode || isbn === searchCodeNoHyphen || (prefix === '' && isbn === searchCodeNumOnly);
  });
  
  console.log("Found book in filtered books:", found);
  
  const foundInInitial = initialBooks.find(b => {
    const isbn = b.isbn.toUpperCase();
    return isbn === searchCode || isbn === searchCodeNoHyphen || (prefix === '' && isbn === searchCodeNumOnly);
  });
  console.log("Found book in initialBooks:", foundInInitial);
}

main().catch(console.error).finally(() => prisma.$disconnect());
