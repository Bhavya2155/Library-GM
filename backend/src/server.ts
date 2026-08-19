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
import './lib/db'; // Initialize DB
import { initCronJobs } from './jobs/cron';

dotenv.config();

// Initialize background jobs
initCronJobs();

const app = express();
app.use(cors());
app.use(express.json());

// Root ping route for uptime monitors
app.get('/', (req, res) => {
  res.status(200).send('API is running');
});

app.use('/api/admin', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/guests', guestsRoutes);
app.use('/api/circulation', circulationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/assistant', aiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT} with SQLite Database`));
