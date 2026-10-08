import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

const libsql = createClient({
  url: process.env.DATABASE_URL || 'file:./dev.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const adapter = new PrismaLibSQL(libsql);
const db = new PrismaClient({ adapter });

async function main() {
  const users = await db.admin.findMany();
  console.log(users.map(u => ({ username: u.username, role: u.role })));
}

main().catch(console.error);
