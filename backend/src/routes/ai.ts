import { Router } from 'express';
import { chatWithAI } from '../controllers/ai';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/chat', aiLimiter, chatWithAI);

export default router;
