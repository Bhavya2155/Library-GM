import express from 'express';
import prisma from '../lib/db';
import { auth, isAdmin } from '../middleware/auth';

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let books;
    if (search) {
      books = await prisma.book.findMany({
        where: {
          OR: [
            { title: { contains: String(search), mode: 'insensitive' } },
            { author: { contains: String(search), mode: 'insensitive' } },
            { isbn: { contains: String(search), mode: 'insensitive' } },
          ]
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      books = await prisma.book.findMany({ orderBy: { createdAt: 'desc' } });
    }
    
    res.json(books.map(b => ({ ...b, _id: b.id })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', isAdmin, async (req, res) => {
  try {
    const { title, author, isbn, category, quantity } = req.body;
    const book = await prisma.book.create({
      data: {
        title, author, isbn, category, quantity: parseInt(quantity), availableCopies: parseInt(quantity)
      }
    });
    res.status(201).json({ ...book, _id: book.id });
  } catch (err: any) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'ISBN already exists' });
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { title, author, isbn, category, quantity } = req.body;
    const bookId = parseInt(req.params.id);
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    
    if (!book) return res.status(404).json({ error: "Not found" });
    
    const qtyDiff = parseInt(quantity) - book.quantity;
    
    const updated = await prisma.book.update({
      where: { id: bookId },
      data: {
        title, author, isbn, category, quantity: parseInt(quantity),
        availableCopies: book.availableCopies + qtyDiff
      }
    });
    res.json({ ...updated, _id: updated.id });
  } catch (err: any) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'ISBN already exists' });
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await prisma.book.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Cannot delete: Book has circulation records.' });
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;
