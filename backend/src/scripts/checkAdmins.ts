import prisma from '../lib/db';

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

main().catch(console.error);
