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
  const books = await prisma.book.findMany();
  console.log("Matching ST-107:", books.filter(b => b.isbn.toUpperCase().includes('107')));
}

main().catch(console.error).finally(() => prisma.$disconnect());
