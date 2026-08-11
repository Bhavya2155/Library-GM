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
  const book = await prisma.book.findFirst({ where: { isbn: 'ST-107' } });
  const records = await prisma.issuedBook.findMany({ where: { bookId: book.id } });
  console.log("Book:", book);
  console.log("Records:", records);
}

main().catch(console.error).finally(() => prisma.$disconnect());
