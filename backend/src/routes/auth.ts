import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/db';
import { auth, isAdmin } from '../middleware/auth';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await prisma.admin.findUnique({ where: { username } });
    
    if (!admin) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Log the successful login (unless it's the dev account)
    if (admin.username !== 'Dada') {
      prisma.loginHistory.create({
        data: {
          username: admin.username,
          role: admin.role
        }
      }).catch(err => console.error("History Error:", err));
    }

    const token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token, username, role: admin.role });
  } catch (err: any) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

router.post('/seed', async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({ where: { username: 'admin' } });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.admin.create({
        data: {
          username: 'admin',
          password: hashedPassword
        }
      });
      res.json({ message: 'Admin seeded (admin / admin123)' });
    } else {
      res.json({ message: 'Admin already exists' });
    }
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/update', async (req, res) => {
  try {
    const { currentPassword, newUsername, newPassword } = req.body;
    
    // Auth middleware doesn't currently verify token on auth routes, so let's check it manually or use auth middleware
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch(err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const admin = await prisma.admin.findUnique({ where: { id: decoded.id } });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    
    // Only admins can change other users' passwords, otherwise they can only change their own.
    // The current update logic is only changing the logged-in user's credentials, so this is safe for staff too.

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect current password' });

    let finalUsername = admin.username;
    let finalPassword = admin.password;

    if (newUsername) {
      finalUsername = newUsername;
    }
    if (newPassword) {
      finalPassword = await bcrypt.hash(newPassword, 10);
    }

    await prisma.admin.update({
      where: { id: decoded.id },
      data: {
        username: finalUsername,
        password: finalPassword
      }
    });

    res.json({ message: 'Credentials updated successfully', username: finalUsername });
  } catch (err: any) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Username already taken' });
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/history', auth, isAdmin, async (req, res) => {
  try {
    const history = await prisma.loginHistory.findMany({
      orderBy: { loginTime: 'desc' }
    });
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/staff', auth, isAdmin, async (req, res) => {
  try {
    const staff = await prisma.admin.findMany({
      where: {
        username: { not: 'Dada' }, // Protect master developer
        role: { in: ['coordinator', 'leader', 'student'] } // Never expose admin/super accounts
      },
      select: {
        id: true,
        username: true,
        role: true
      }
    });
    res.json(staff);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/staff', auth, isAdmin, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    if (!['coordinator', 'leader', 'student'].includes(role)) return res.status(400).json({ error: 'Invalid role. Allowed: coordinator, leader, student.' });
    
    const existing = await prisma.admin.findUnique({ where: { username } });
    if (existing) return res.status(400).json({ error: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await prisma.admin.create({
      data: { username, password: hashedPassword, role }
    });
    
    res.status(201).json({ id: result.id, username, role });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/staff/:id', auth, isAdmin, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username) return res.status(400).json({ error: 'Username is required' });
    if (!['coordinator', 'leader', 'student'].includes(role)) return res.status(400).json({ error: 'Invalid role. Allowed: coordinator, leader, student.' });
    
    // Only allow editing coordinator/leader/student — never admin/super
    const record = await prisma.admin.findFirst({
      where: {
        id: parseInt(req.params.id),
        username: { not: 'Dada' },
        role: { in: ['coordinator', 'leader', 'student'] }
      }
    });
    if (!record) return res.status(404).json({ error: 'Account not found or protected' });

    const data: any = { username, role };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    await prisma.admin.update({
      where: { id: parseInt(req.params.id) },
      data
    });
    
    res.json({ message: 'Updated successfully' });
  } catch (err: any) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Username already taken' });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/staff/:id', auth, isAdmin, async (req, res) => {
  try {
    // Only allow deleting coordinator/leader/student — never admin/super
    const record = await prisma.admin.findFirst({
      where: {
        id: parseInt(req.params.id),
        username: { not: 'Dada' },
        role: { in: ['coordinator', 'leader', 'student'] }
      }
    });
    if (!record) return res.status(404).json({ error: 'Account not found or protected' });
    
    await prisma.admin.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
