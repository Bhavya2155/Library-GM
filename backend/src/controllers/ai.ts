import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { libraryTools } from '../lib/aiTools';
import { db } from '../lib/db';

const executeTool = async (call: any) => {
  const name = call.name;
  const args = call.args;

  try {
    switch (name) {
      case 'search_books':
        if (args.query) {
           return await db.book.findMany({
             where: {
               OR: [
                 { title: { contains: args.query } },
                 { author: { contains: args.query } },
                 { category: { contains: args.query } }
               ]
             },
             take: 10
           });
        }
        return await db.book.findMany({ take: 10 });
      case 'check_book_availability':
        return await db.book.findMany({
          where: { title: { contains: args.title } },
          select: { title: true, quantity: true, availableCopies: true }
        });
      case 'get_student_info':
        return await db.student.findMany({
          where: {
            OR: [
              { name: { contains: args.query } },
              { studentId: { contains: args.query } },
              { email: { contains: args.query } }
            ]
          },
          take: 5
        });
      case 'get_issued_books':
        const whereClause: any = { status: 'issued' };
        if (args.studentId) whereClause.student = { studentId: args.studentId };
        if (args.overdueOnly) whereClause.dueDate = { lt: new Date() };
        return await db.issuedBook.findMany({
          where: whereClause,
          include: { book: true, student: true },
          take: 10
        });
      case 'get_library_stats':
        const [totalBooks, activeStudents, issuedBooks] = await Promise.all([
          db.book.count(),
          db.student.count(),
          db.issuedBook.count({ where: { status: 'issued' } })
        ]);
        return { totalBooks, activeStudents, issuedBooks };
      default:
        return { error: `Tool ${name} not found` };
    }
  } catch (error: any) {
    return { error: error.message };
  }
};

export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { message, messages } = req.body;
    
    // Fallback to message if messages array is not provided
    const userMessage = message || (messages && messages.length > 0 ? messages[messages.length - 1].content : '');

    if (!userMessage) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key is not configured.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash-lite",
      tools: [{ functionDeclarations: libraryTools }]
    });

    const systemPrompt = `You are a helpful AI assistant for the Gnan Mandir Library Portal. Keep your answers relatively short and helpful. You have access to the library database via tools. If the user asks a question about books, students, or stats, USE THE TOOLS to look up the real data before answering. Do not guess information.`;

    // Format history if provided
    let history = [];
    if (messages && messages.length > 1) {
       history = messages.slice(0, -1).map((msg: any) => ({
         role: msg.role === 'assistant' ? 'model' : 'user',
         parts: [{ text: msg.content }]
       }));
    }

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood.' }] },
        ...history
      ]
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let result = await chat.sendMessageStream(userMessage);

    // Loop to handle potential function calls
    while (true) {
      let functionCallFound = false;
      let functionCallsToExecute = [];

      for await (const chunk of result.stream) {
        if (chunk.functionCalls && chunk.functionCalls.length > 0) {
          functionCallFound = true;
          functionCallsToExecute.push(...chunk.functionCalls);
        } else {
           try {
             const text = chunk.text();
             if (text) {
               res.write(`data: ${JSON.stringify({ text })}\n\n`);
             }
           } catch (e) {
             // chunk.text() throws if it's a function call without text. Ignore.
           }
        }
      }

      if (functionCallFound) {
        const functionResponses = [];
        for (const call of functionCallsToExecute) {
           const toolResult = await executeTool(call);
           functionResponses.push({
             functionResponse: {
               name: call.name,
               response: toolResult
             }
           });
        }
        // Send the function response back to the model
        result = await chat.sendMessageStream(functionResponses);
      } else {
        break; // No more function calls, generation is done
      }
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
