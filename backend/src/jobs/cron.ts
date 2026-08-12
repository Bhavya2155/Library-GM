import cron from 'node-cron';
import prisma from '../lib/db';

export function initCronJobs() {
  // Run daily at midnight: '0 0 * * *'
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily cleanup cron job...');
    
    try {
      // 1.5 years ago (approx 18 months or 547 days)
      const oneAndHalfYearsAgo = new Date();
      oneAndHalfYearsAgo.setMonth(oneAndHalfYearsAgo.getMonth() - 18);

      // 1. Delete LoginHistory older than 1.5 years
      const deletedLogins = await prisma.loginHistory.deleteMany({
        where: {
          loginTime: {
            lt: oneAndHalfYearsAgo
          }
        }
      });
      console.log(`Deleted ${deletedLogins.count} login history records older than 1.5 years.`);

      // 2. Delete IssuedBooks that are returned and older than 1.5 years
      const deletedIssued = await prisma.issuedBook.deleteMany({
        where: {
          status: 'returned',
          returnDate: {
            lt: oneAndHalfYearsAgo
          }
        }
      });
      console.log(`Deleted ${deletedIssued.count} returned circulation records older than 1.5 years.`);

    } catch (error) {
      console.error('Error during daily cleanup cron job:', error);
    }
  });
}
