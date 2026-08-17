import { Router } from 'express';
import { chatWithAI } from '../controllers/ai';

const router = Router();

router.post('/chat', chatWithAI);

export default router;
