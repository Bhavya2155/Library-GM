require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

const libsql = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash('Mangeshbhai1234', 10);
  
  await prisma.admin.update({
    where: { username: 'Mangeshbhai' },
    data: { password: hash }
  });
  console.log("Mangeshbhai password reset to Mangeshbhai1234");
}

main().catch(console.error).finally(() => prisma.$disconnect());
