require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');

const libsql = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
})

const adapter = new PrismaLibSQL(libsql)
const prisma = new PrismaClient({ adapter })

async function main() {
  const admins = await prisma.admin.findMany({
    select: { id: true, username: true, role: true }
  });
  console.log("Admins:", admins);
  
  const history = await prisma.loginHistory.findMany({
    orderBy: { loginTime: 'desc' },
    take: 5
  });
  console.log("Recent logins:", history);
}

main().catch(console.error).finally(() => prisma.$disconnect());
