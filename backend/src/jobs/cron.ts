import prisma from '../lib/db';

export async function cleanupDatabase() {
  console.log('Running daily cleanup cron job...');
  
  try {
    const oneAndHalfYearsAgo = new Date();
    oneAndHalfYearsAgo.setMonth(oneAndHalfYearsAgo.getMonth() - 18);

    const deletedLogins = await prisma.loginHistory.deleteMany({
      where: { loginTime: { lt: oneAndHalfYearsAgo } }
    });
    console.log(`Deleted ${deletedLogins.count} login history records older than 1.5 years.`);

    const deletedIssued = await prisma.issuedBook.deleteMany({
      where: { status: 'returned', returnDate: { lt: oneAndHalfYearsAgo } }
    });
    console.log(`Deleted ${deletedIssued.count} returned circulation records older than 1.5 years.`);

  } catch (error) {
    console.error('Error during daily cleanup cron job:', error);
  }
}
