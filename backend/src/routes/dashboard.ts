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

router.get('/analytics', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.issueDate = {};
      if (startDate) dateFilter.issueDate.gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        dateFilter.issueDate.lte = end;
      }
    }

    // Top Readers
    const readersGroup = await db.issuedBook.groupBy({
      by: ['studentId'],
      _count: { studentId: true },
      where: { studentId: { not: null }, ...dateFilter },
      orderBy: { _count: { studentId: 'desc' } }
    });
    
    const studentIds = readersGroup.map(g => g.studentId as number);
    const students = await db.student.findMany({
      where: { id: { in: studentIds } },
      select: { id: true, name: true, studentId: true }
    });
    
    const topReaders = readersGroup.map(g => {
      const student = students.find(s => s.id === g.studentId);
      return { 
        name: student?.name || 'Unknown', 
        studentId: student?.studentId || 'N/A',
        count: g._count.studentId 
      };
    });

    // Popular Books
    const booksGroup = await db.issuedBook.groupBy({
      by: ['bookId'],
      _count: { bookId: true },
      where: { ...dateFilter },
      orderBy: { _count: { bookId: 'desc' } },
      take: 20 // Limit to top 20 popular books
    });

    const bookIds = booksGroup.map(g => g.bookId);
    const books = await db.book.findMany({
      where: { id: { in: bookIds } },
      select: { id: true, title: true }
    });

    const popularBooks = booksGroup.map(g => {
      const book = books.find(b => b.id === g.bookId);
      return {
        title: book?.title || 'Unknown',
        count: g._count.bookId
      };
    });

    res.json({ topReaders, popularBooks });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
