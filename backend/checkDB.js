const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
require('dotenv').config();
const libsql = createClient({ url: process.env.DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const adapter = new PrismaLibSQL(libsql);
const db = new PrismaClient({ adapter });
async function main() {
  const h = await db.loginHistory.findMany();
  console.log(h);
}
main().finally(() => db.$disconnect());
