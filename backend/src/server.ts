import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import bookRoutes from './routes/books';
import studentRoutes from './routes/students';
import circulationRoutes from './routes/circulation';
import notificationRoutes from './routes/notifications';
import guestsRoutes from './routes/guests';
import aiRoutes from './routes/ai';
import './lib/db';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

import { cleanupDatabase } from './jobs/cron';
app.get('/api/cron/cleanup', async (req, res) => {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}` && process.env.VERCEL) {
    return res.status(401).end('Unauthorized');
  }
  await cleanupDatabase();
  res.status(200).send('Cleanup complete');
});

app.get('/', (req, res) => res.status(200).send('API is running'));

app.use('/api/admin', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/guests', guestsRoutes);
app.use('/api/circulation', circulationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/assistant', aiRoutes);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT} with SQLite Database`));
}

export default app;
