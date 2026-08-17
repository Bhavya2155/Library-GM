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

    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Flush the headers to establish the SSE connection immediately

    const result = await model.generateContentStream(fullMessage);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to communicate with AI', details: error.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
};
