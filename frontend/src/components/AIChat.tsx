import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { X, Send, Bot, User, Loader2, Sparkles, RotateCcw } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hi there! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const botMessageId = Date.now().toString() + 'bot';
      setMessages(prev => [...prev, { id: botMessageId, role: 'assistant', content: '' }]);

      const response = await fetch(`${axios.defaults.baseURL}/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.content,
          messages: [...messages, userMessage] 
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          
          let newlineIndex;
          while ((newlineIndex = buffer.indexOf('\n\n')) !== -1) {
            const sseMessage = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 2);
            
            const lines = sseMessage.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6);
                if (dataStr === '[DONE]') break;
                
                try {
                  const data = JSON.parse(dataStr);
                  if (data.error) {
                    throw new Error(data.error);
                  }
                  if (data.text) {
                    setMessages(prev => prev.map(msg => 
                      msg.id === botMessageId ? { ...msg, content: msg.content + data.text } : msg
                    ));
                  }
                } catch (e) {
                  if (e instanceof Error && !e.message.includes('JSON')) {
                     throw e;
                  }
                }
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      const errDetail = error.response?.data?.error || error.response?.data?.details || error.message || 'Unknown error';
      const errorMessage: Message = { id: Date.now().toString() + 'err', role: 'assistant', content: `Error: ${errDetail}` };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const suggestions = [
    "Check availability",
    "List overdue books",
    "Find student info",
    "Library stats"
  ];

  return (
    <>
      {/* Floating Chat Button container */}
      <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}>
        
        {/* Popup Text Bubble */}
        <div className="relative bg-white text-indigo-700 text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-lg border border-indigo-100 animate-bounce cursor-pointer" onClick={() => setIsOpen(true)}>
          How can I help you?
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-indigo-100 transform rotate-45"></div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:bg-indigo-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
          aria-label="Open AI Assistant"
        >
          <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 z-50 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
        style={{ height: '500px', maxHeight: 'calc(100vh - 48px)' }}
      >
        {/* Header */}
        <div className="bg-indigo-600 text-white p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">GnanMandir AI Assistant</h3>
              <p className="text-xs text-indigo-200">Powered by AI</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => {
                setMessages([{ id: Date.now().toString(), role: 'assistant', content: 'Hi there! How can I help you today?' }]);
              }}
              title="New Chat"
              className="text-indigo-200 hover:text-white transition-colors p-1"
            >
              <RotateCcw size={18} />
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-indigo-200 hover:text-white transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages Wrapper */}
        <div className="flex-1 relative bg-slate-50 overflow-hidden flex flex-col">
          {/* Watermark Logo */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.04]">
            <img src="/logo.png" alt="" className="w-48 h-48 object-contain grayscale" />
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative z-10">
            {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="px-4 py-3 bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-slate-100 shrink-0 flex flex-col gap-2">
          {messages.length === 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar w-full">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(suggestion)}
                  className="shrink-0 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-medium rounded-full transition-colors border border-indigo-100 whitespace-nowrap"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 px-4 py-2 rounded-full border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-1" />}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
