import express from 'express';
import prisma from '../lib/db';
import { auth, isAdmin } from '../middleware/auth';

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { search, category, language, sortBy, sortOrder } = req.query;
    let whereClause: any = {
      isbn: { not: { startsWith: 'CUSTOM-' } }
    };
    
    if (search) {
      whereClause.OR = [
        { title: { contains: String(search) } },
        { author: { contains: String(search) } },
        { isbn: { contains: String(search) } },
      ];
    }
    
    if (category && category !== 'All') {
      whereClause.category = { contains: String(category) };
    }
    
    if (language && language !== 'All') {
      whereClause.language = { contains: String(language) };
    }

    let orderByClause: any = { createdAt: 'desc' };
    if (sortBy) {
      const order = sortOrder === 'asc' ? 'asc' : 'desc';
      orderByClause = { [String(sortBy)]: order };
    }

    const books = await prisma.book.findMany({
      where: whereClause,
      orderBy: orderByClause
    });
    
    res.json(books.map(b => ({ ...b, _id: b.id })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', isAdmin, async (req, res) => {
  try {
    const { title, author, isbn, category, language, quantity } = req.body;
    const book = await prisma.book.create({
      data: {
        title, author, isbn, category, language: language || 'English', quantity: parseInt(quantity), availableCopies: parseInt(quantity)
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
    const { title, author, isbn, category, language, quantity } = req.body;
    const bookId = parseInt(req.params.id);
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    
    if (!book) return res.status(404).json({ error: "Not found" });
    
    const qtyDiff = parseInt(quantity) - book.quantity;
    
    const updated = await prisma.book.update({
      where: { id: bookId },
      data: {
        title, author, isbn, category, language: language || 'English',
        quantity: parseInt(quantity),
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
