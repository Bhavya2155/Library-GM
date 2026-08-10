import express from 'express';
import prisma from '../lib/db';
import { auth, isAdmin } from '../middleware/auth';

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const guests = await prisma.guest.findMany({ orderBy: { id: 'desc' } });
    res.json(guests.map(g => ({ ...g, _id: g.id })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', isAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const guest = await prisma.guest.create({
      data: { name }
    });
    res.status(201).json({ ...guest, _id: guest.id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const guest = await prisma.guest.update({
      where: { id: parseInt(req.params.id) },
      data: { name }
    });
    res.json({ ...guest, _id: guest.id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await prisma.guest.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Deleted successfully' });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Cannot delete guest because they have an active circulation record.' });
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;
