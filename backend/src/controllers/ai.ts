import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key is not configured on the server.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const systemPrompt = `You are a helpful AI assistant for the Gnan Mandir Library Portal. Keep your answers relatively short and helpful.`;
    const fullMessage = `${systemPrompt}\n\nUser: ${message}`;

    const result = await model.generateContent(fullMessage);
    const response = await result.response;
    const text = response.text();

    return res.json({ reply: text });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return res.status(500).json({ error: 'Failed to communicate with AI', details: error.message });
  }
};
