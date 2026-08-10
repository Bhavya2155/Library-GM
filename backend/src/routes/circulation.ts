import express from 'express';
import prisma from '../lib/db';
import { auth, isAdmin } from '../middleware/auth';

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const records = await prisma.issuedBook.findMany({
      include: {
        book: { select: { id: true, title: true, isbn: true } },
        student: { select: { id: true, name: true, studentId: true } },
        guest: { select: { id: true, name: true } }
      },
      orderBy: { issueDate: 'desc' }
    });

    const mapped = records.map((r) => ({
      _id: r.id,
      issueDate: r.issueDate,
      dueDate: r.dueDate,
      returnDate: r.returnDate,
      renewDate: r.renewDate,
      status: r.status,
      renewals: r.renewals,
      issuedBy: r.issuedBy,
      bookId: r.book ? { _id: r.book.id, title: r.book.title, isbn: r.book.isbn } : null,
      studentId: r.student ? { _id: r.student.id, name: r.student.name, studentId: r.student.studentId } : null,
      guestId: r.guest ? { _id: r.guest.id, name: r.guest.name } : null
    }));

    res.json(mapped);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/issue', async (req, res) => {
  try {
    const { bookId, studentId, guestId } = req.body;
    
    if (!studentId && !guestId) {
      throw new Error('Must provide either a student or a guest.');
    }

    await prisma.$transaction(async (tx) => {
      const book = await tx.book.findUnique({ where: { id: parseInt(bookId) } });
      if (!book || book.availableCopies <= 0) {
        throw new Error('Book not available');
      }

      const admin = await tx.admin.findUnique({ where: { id: (req as any).adminId } });
      const issuedBy = admin ? admin.username : 'Unknown';

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      if (studentId) {
        const existingIssue = await tx.issuedBook.findFirst({
          where: { studentId: parseInt(studentId), status: 'issued' }
        });
        if (existingIssue) {
          throw new Error('Student already has a book issued. They must return it first.');
        }

        await tx.issuedBook.create({
          data: {
            bookId: parseInt(bookId),
            studentId: parseInt(studentId),
            dueDate,
            renewals: 0,
            issuedBy
          }
        });
      } else if (guestId) {
        const existingIssue = await tx.issuedBook.findFirst({
          where: { guestId: parseInt(guestId), status: 'issued' }
        });
        if (existingIssue) {
          throw new Error('Guest already has a book issued. They must return it first.');
        }

        await tx.issuedBook.create({
          data: {
            bookId: parseInt(bookId),
            guestId: parseInt(guestId),
            dueDate,
            renewals: 0,
            issuedBy
          }
        });
      }

      await tx.book.update({
        where: { id: parseInt(bookId) },
        data: { availableCopies: { decrement: 1 } }
      });
    });

    res.status(201).json({ message: 'Issued successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/renew/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const record = await prisma.issuedBook.findUnique({ where: { id } });
    if (!record || record.status === 'returned') {
      return res.status(400).json({ error: 'Cannot renew a returned book' });
    }
    
    if (record.renewals >= 1) {
      return res.status(400).json({ error: 'Maximum renewals reached. Book must be returned after 14 days.' });
    }

    let newDueDate = record.dueDate ? new Date(record.dueDate) : new Date();
    newDueDate.setDate(newDueDate.getDate() + 7);

    await prisma.issuedBook.update({
      where: { id },
      data: {
        dueDate: newDueDate,
        renewals: { increment: 1 },
        renewDate: new Date()
      }
    });

    res.json({ message: 'Renewed successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/undo-renew/:id', isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const record = await prisma.issuedBook.findUnique({ where: { id } });
    if (!record || record.status === 'returned') {
      return res.status(400).json({ error: 'Cannot undo renew on a returned or invalid book' });
    }
    if (record.renewals < 1) {
      return res.status(400).json({ error: 'Book has not been renewed' });
    }

    let originalDueDate = record.dueDate ? new Date(record.dueDate) : new Date();
    originalDueDate.setDate(originalDueDate.getDate() - 7);

    await prisma.issuedBook.update({
      where: { id },
      data: {
        dueDate: originalDueDate,
        renewals: { decrement: 1 },
        renewDate: null
      }
    });

    res.json({ message: 'Renew undone successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/return/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.$transaction(async (tx) => {
      const record = await tx.issuedBook.findUnique({ where: { id } });
      if (!record || record.status === 'returned') {
        throw new Error('Invalid record or already returned');
      }

      await tx.issuedBook.update({
        where: { id },
        data: { status: 'returned', returnDate: new Date() }
      });

      await tx.book.update({
        where: { id: record.bookId },
        data: { availableCopies: { increment: 1 } }
      });
    });

    res.json({ message: 'Returned successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/undo-return/:id', isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.$transaction(async (tx) => {
      const record = await tx.issuedBook.findUnique({ where: { id } });
      if (!record || record.status === 'issued') {
        throw new Error('Invalid record or not returned yet');
      }

      const book = await tx.book.findUnique({ where: { id: record.bookId } });
      if (!book || book.availableCopies < 1) {
        throw new Error('Cannot undo return. The book has already been issued to someone else and no copies are left.');
      }

      await tx.issuedBook.update({
        where: { id },
        data: { status: 'issued', returnDate: null }
      });

      await tx.book.update({
        where: { id: record.bookId },
        data: { availableCopies: { decrement: 1 } }
      });
    });

    res.json({ message: 'Return undone successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.$transaction(async (tx) => {
      const record = await tx.issuedBook.findUnique({ where: { id } });
      if (!record) throw new Error('Record not found');
      
      if (record.status === 'issued') {
        await tx.book.update({
          where: { id: record.bookId },
          data: { availableCopies: { increment: 1 } }
        });
      }
      
      await tx.issuedBook.delete({ where: { id } });
    });
    
    res.json({ message: 'Deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
