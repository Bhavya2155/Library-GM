import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import bookRoutes from './routes/books';
import studentRoutes from './routes/students';
import circulationRoutes from './routes/circulation';
import notificationRoutes from './routes/notifications';
import guestsRoutes from './routes/guests';
import aiRoutes from './routes/ai';
import { apiLimiter } from './middleware/rateLimiter';
import './lib/db';

dotenv.config();

const app = express();

// Trust reverse proxy (Vercel, load balancers) for accurate client IP detection & rate limiting
app.set('trust proxy', 1);

// HTTP Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // CSP managed via Vercel headers for optimal client caching
}));

// CORS Protection: restrict access to trusted domains & Vercel deployments
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    try {
      const parsed = new URL(origin);
      if (
        allowedOrigins.includes(origin) ||
        parsed.hostname === 'localhost' ||
        parsed.hostname === '127.0.0.1' ||
        parsed.hostname.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
    } catch {
      // ignore URL parsing error
    }
    return callback(new Error('Blocked by CORS policy'));
  },
  credentials: true
}));

// Body parsing with safe size limit
app.use(express.json({ limit: '5mb' }));

// Apply general rate limiting across all API endpoints
app.use('/api', apiLimiter);

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
