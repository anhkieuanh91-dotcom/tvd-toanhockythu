import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/src/contexts/LanguageContext';

const Chatbot = () => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  const initialMessage = language === 'en' 
    ? 'Hello! I am your friendly Math Assistant. How can I help you today?' 
    : 'Chào em! Thầy là trợ lý Toán học vui vẻ. Em cần giúp gì không nào?';
    
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: initialMessage }
  ]);
  
  // Update initial message when language changes if it's the only message
  useEffect(() => {
    if (messages.length === 1) {
      setMessages([{ role: 'model', text: initialMessage }]);
    }
  }, [language, initialMessage]);

  useEffect(() => {
    const handleExplainProblem = async (event: any) => {
      const { question, userAnswer, correctAnswer, explanation } = event.detail;
      
      setIsOpen(true);
      setIsLoading(true);

      const prompt = language === 'en'
        ? `I am playing a math game. Here is a problem I just encountered:
Question: ${question}
My answer: ${userAnswer}
Correct answer: ${correctAnswer}
Short explanation: ${explanation}

Can you explain this problem to me more clearly and simply, like a teacher? If I was wrong, help me understand why.`
        : `Em đang chơi trò chơi toán học. Đây là bài toán em vừa gặp:
Câu hỏi: ${question}
Câu trả lời của em: ${userAnswer}
Đáp án đúng: ${correctAnswer}
Giải thích ngắn gọn: ${explanation}

Thầy có thể giải thích kỹ hơn và đơn giản hơn bài toán này cho em được không? Nếu em làm sai, hãy giúp em hiểu tại sao nhé.`;

      setMessages(prev => [...prev, { role: 'user', text: prompt }]);

      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("API Key missing");
        
        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction = language === 'en'
          ? "You are a friendly, funny, and patient primary school math teacher. Explain math problems simply and clearly, suitable for primary school students (grades 1 to 5). Use standard but approachable English. Always encourage the students."
          : "Bạn là một giáo viên dạy toán tiểu học thân thiện, vui tính và kiên nhẫn. Hãy giải thích các bài toán một cách đơn giản, dễ hiểu, phù hợp với lứa tuổi học sinh tiểu học (từ lớp 1 đến lớp 5). Sử dụng ngôn ngữ tiếng Việt chuẩn mực nhưng gần gũi. Luôn khuyến khích học sinh.";

        const chat = ai.chats.create({
          model: "gemini-3-flash-preview",
          config: { systemInstruction },
          history: messages
            .filter((m, i) => !(i === 0 && m.role === 'model'))
            .map(m => ({ 
              role: m.role as "user" | "model", 
              parts: [{ text: m.text }] 
            })),
        });

        const result = await chat.sendMessage({ message: prompt });
        if (result.text) {
          setMessages(prev => [...prev, { role: 'model', text: result.text }]);
        }
      } catch (error) {
        console.error("Error explaining problem:", error);
        setMessages(prev => [...prev, { role: 'model', text: language === 'en' ? "Sorry, I couldn't generate an explanation right now." : "Xin lỗi em, thầy chưa thể giải thích ngay lúc này được." }]);
      } finally {
        setIsLoading(false);
      }
    };

    window.addEventListener('explain-math-problem', handleExplainProblem);
    return () => window.removeEventListener('explain-math-problem', handleExplainProblem);
  }, [language, messages]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const noKeyMessage = language === 'en'
        ? 'API Key not found. Please set GEMINI_API_KEY in your environment variables (e.g., on Vercel).'
        : 'Không tìm thấy mã API. Vui lòng thiết lập GEMINI_API_KEY trong biến môi trường (ví dụ: trên Vercel).';
      setMessages(prev => [...prev, { role: 'model', text: noKeyMessage }]);
      setIsLoading(false);
      return;
    }
    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = language === 'en'
      ? "You are a friendly, funny, and patient primary school math teacher. Explain math problems simply and clearly, suitable for primary school students (grades 1 to 5). Use standard but approachable English. Always encourage the students. If a student asks a math problem, suggest how to solve it rather than giving the answer immediately."
      : "Bạn là một giáo viên dạy toán tiểu học thân thiện, vui tính và kiên nhẫn. Hãy giải thích các bài toán một cách đơn giản, dễ hiểu, phù hợp với lứa tuổi học sinh tiểu học (từ lớp 1 đến lớp 5). Sử dụng ngôn ngữ tiếng Việt chuẩn mực nhưng gần gũi. Luôn khuyến khích học sinh. Nếu học sinh hỏi bài toán, hãy gợi ý cách giải chứ không đưa ra đáp án ngay lập tức.";

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: systemInstruction,
      },
      history: messages
        .filter((m, i) => !(i === 0 && m.role === 'model'))
        .map(m => ({
          role: m.role as "user" | "model",
          parts: [{ text: m.text }]
        })),
    });

      const result = await chat.sendMessage({ message: userMessage });
      const response = result.text;

      if (response) {
        setMessages(prev => [...prev, { role: 'model', text: response }]);
      } else {
        throw new Error("No response text");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = language === 'en'
        ? 'Sorry, I am having some connection issues. Please try again later!'
        : 'Xin lỗi em, thầy đang gặp chút trục trặc kết nối. Em thử lại sau nhé!';
      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden"
          >
            <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Bot className="w-6 h-6" />
                <span className="font-bold">{t('chatbot.title')}</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-700 p-1 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('chatbot.placeholder')}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
              <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()} className="rounded-full bg-indigo-600 hover:bg-indigo-700 shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-indigo-700 transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
      </motion.button>
    </>
  );
};

export default Chatbot;
