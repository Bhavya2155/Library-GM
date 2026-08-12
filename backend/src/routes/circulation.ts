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

    // 1. Fetch all required data concurrently to save network round trips
    const [book, admin, existingIssue] = await Promise.all([
      prisma.book.findUnique({ where: { id: parseInt(bookId) } }),
      prisma.admin.findUnique({ where: { id: (req as any).adminId } }),
      studentId 
        ? prisma.issuedBook.findFirst({ where: { studentId: parseInt(studentId), status: 'issued' } })
        : prisma.issuedBook.findFirst({ where: { guestId: parseInt(guestId), status: 'issued' } })
    ]);

    if (!book || book.availableCopies <= 0) {
      throw new Error('Book not available');
    }

    if (existingIssue) {
      throw new Error(studentId ? 'Student already has a book issued. They must return it first.' : 'Guest already has a book issued. They must return it first.');
    }

    let issuerPrefix = 'Sevak';
    if (admin) {
      if (admin.role === 'coordinator') issuerPrefix = 'Coordinator';
      else if (admin.role === 'admin' || admin.role === 'super') issuerPrefix = 'Admin';
    }
    const issuedBy = admin ? `${issuerPrefix}: ${admin.username}` : 'Unknown';
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    // 2. Perform writes in a single batch transaction (1 network round trip)
    await prisma.$transaction([
      prisma.issuedBook.create({
        data: {
          bookId: parseInt(bookId),
          studentId: studentId ? parseInt(studentId) : null,
          guestId: guestId ? parseInt(guestId) : null,
          dueDate,
          renewals: 0,
          issuedBy
        }
      }),
      prisma.book.update({
        where: { id: parseInt(bookId) },
        data: { availableCopies: { decrement: 1 } }
      })
    ]);

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
    
    // 1. Fetch record first
    const record = await prisma.issuedBook.findUnique({ where: { id } });
    if (!record || record.status === 'returned') {
      throw new Error('Invalid record or already returned');
    }

    // 2. Perform writes in a single batch transaction
    await prisma.$transaction([
      prisma.issuedBook.update({
        where: { id },
        data: { status: 'returned', returnDate: new Date() }
      }),
      prisma.book.update({
        where: { id: record.bookId },
        data: { availableCopies: { increment: 1 } }
      })
    ]);

    res.json({ message: 'Returned successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/undo-return/:id', isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // 1. Fetch record with book included (1 network round trip)
    const record = await prisma.issuedBook.findUnique({ 
      where: { id },
      include: { book: true }
    });

    if (!record || record.status === 'issued') {
      throw new Error('Invalid record or not returned yet');
    }

    if (!record.book || record.book.availableCopies < 1) {
      throw new Error('Cannot undo return. The book has already been issued to someone else and no copies are left.');
    }

    // 2. Perform writes in a single batch transaction
    await prisma.$transaction([
      prisma.issuedBook.update({
        where: { id },
        data: { status: 'issued', returnDate: null }
      }),
      prisma.book.update({
        where: { id: record.bookId },
        data: { availableCopies: { decrement: 1 } }
      })
    ]);

    res.json({ message: 'Return undone successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // 1. Fetch record first
    const record = await prisma.issuedBook.findUnique({ where: { id } });
    if (!record) throw new Error('Record not found');
    
    // 2. Perform writes in a single batch transaction
    const operations: any[] = [];
    if (record.status === 'issued') {
      operations.push(
        prisma.book.update({
          where: { id: record.bookId },
          data: { availableCopies: { increment: 1 } }
        })
      );
    }
    operations.push(prisma.issuedBook.delete({ where: { id } }));

    await prisma.$transaction(operations);
    
    res.json({ message: 'Deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
