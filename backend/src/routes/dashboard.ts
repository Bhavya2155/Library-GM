import express from 'express';
import db from '../lib/db';
import { auth, isAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/stats', auth, (req, res) => {
  try {
    const totalStudents = (db.prepare('SELECT COUNT(*) as count FROM students').get() as any).count;
    const booksAggr = db.prepare('SELECT SUM(quantity) as totalQty, SUM(availableCopies) as totalAvail FROM books').get() as any;
    
    const totalCopies = booksAggr.totalQty || 0;
    const availableCopies = booksAggr.totalAvail || 0;
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

router.get('/logins', auth, isAdmin, (req, res) => {
  try {
    const logins = db.prepare('SELECT * FROM login_history ORDER BY loginTime DESC LIMIT 10').all();
    res.json(logins);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
