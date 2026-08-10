require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const bcrypt = require('bcryptjs');

const libsql = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
})

const adapter = new PrismaLibSQL(libsql)
const prisma = new PrismaClient({ adapter })

async function main() {
  const newPassword = await bcrypt.hash('Dada1234', 10);
  
  await prisma.admin.update({
    where: { username: 'Dada' },
    data: { password: newPassword }
  });
  
  console.log("Password for Dada has been reset to Dada1234");
}

main().catch(console.error).finally(() => prisma.$disconnect());
