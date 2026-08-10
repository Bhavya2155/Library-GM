import express from 'express';
import db from '../lib/db';
import { auth, isAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/stats', auth, async (req, res) => {
  try {
    const totalStudents = await db.student.count();
    const booksAggr = await db.book.aggregate({
      _sum: {
        quantity: true,
        availableCopies: true
      }
    });
    
    const totalCopies = booksAggr._sum.quantity || 0;
    const availableCopies = booksAggr._sum.availableCopies || 0;
    const issuedCopies = totalCopies - availableCopies;

    res.json({
      totalBooks: totalCopies,
      totalStudents,
      issuedBooks: issuedCopies,
      availableBooks: availableCopies
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/logins', auth, isAdmin, async (req, res) => {
  try {
    const logins = await db.loginHistory.findMany({
      orderBy: { loginTime: 'desc' },
      take: 10
    });
    res.json(logins);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
