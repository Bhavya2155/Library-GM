import express from 'express';
import db from '../lib/db';
import { auth } from '../middleware/auth';

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const records = await db.$queryRaw`
      SELECT 
        ib.id as _id, ib.dueDate,
        b.title as "bookTitle",
        s.studentId as "studentGmNo",
        s.name as "studentName",
        s.email as "studentEmail",
        g.name as "guestName"
      FROM issued_books ib
      JOIN books b ON ib.bookId = b.id
      LEFT JOIN students s ON ib.studentId = s.id
      LEFT JOIN guests g ON ib.guestId = g.id
      WHERE ib.status = 'issued' 
      AND ib.dueDate <= datetime('now', '+1 day')
      ORDER BY ib.dueDate ASC
    `;

    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
