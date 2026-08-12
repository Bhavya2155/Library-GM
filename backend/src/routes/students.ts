import express from 'express';
import prisma from '../lib/db';
import { auth, isAdmin } from '../middleware/auth';

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const students = await prisma.student.findMany();
    students.sort((a, b) => {
      const numA = parseInt(a.studentId || '0', 10);
      const numB = parseInt(b.studentId || '0', 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return (a.studentId || '').localeCompare(b.studentId || '');
    });
    res.json(students.map(s => ({ ...s, _id: s.id })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', isAdmin, async (req, res) => {
  try {
    const { name, studentId } = req.body;
    const student = await prisma.student.create({
      data: { name, studentId, email: '', phone: '' }
    });
    res.status(201).json({ ...student, _id: student.id });
  } catch (err: any) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'GM No. already exists' });
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { name, studentId } = req.body;
    const updated = await prisma.student.update({
      where: { id: parseInt(req.params.id) },
      data: { name, studentId }
    });
    res.json({ ...updated, _id: updated.id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await prisma.student.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Cannot delete: Student has circulation records.' });
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;
