
import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, UserRole } from '../types';
import { chatGeneral } from '../services/geminiService';

interface ChatInterfaceProps {
  currentRole: UserRole;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentRole }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatGeneral(messages, userMsg.text, currentRole);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Lo siento, ocurrió un error al procesar tu mensaje." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 relative z-10 scrollbar-hide">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
             <div className="w-16 h-16 bg-blue-900/20 rounded-2xl flex items-center justify-center">
                 <MessageSquare className="w-8 h-8 text-blue-400" />
             </div>
             <h3 className="text-xl font-bold text-slate-300">JUXA CHAT</h3>
             <p className="text-sm text-slate-500 max-w-sm">
                Soy tu asistente jurídico inteligente. Pregúntame sobre leyes, conceptos, estrategias o pídeme redactar cláusulas breves.
             </p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-xl ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-[#151517] border border-white/10 text-slate-200 rounded-bl-none'
                }`}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-[#151517] border border-white/10 p-4 rounded-2xl rounded-bl-none">
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></div>
                    </div>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-[#0a0a0a] border-t border-white/10 relative z-20">
        <div className="max-w-4xl mx-auto flex items-center space-x-3 bg-[#151517] border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:border-blue-500/50 transition-colors">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escribe tu consulta jurídica..."
                className="flex-1 bg-transparent border-none text-white text-sm px-4 py-3 outline-none placeholder:text-slate-500"
            />
            <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-blue-600"
            >
                <Send className="w-4 h-4" />
            </button>
        </div>
        <p className="text-[10px] text-center text-slate-600 mt-3">
            JUXA Intelligence puede cometer errores. Verifica la información legal importante.
        </p>
      </div>
    </div>
  );
};
