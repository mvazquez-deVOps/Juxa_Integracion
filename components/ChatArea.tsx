import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { User, Paperclip, Mic, Copy, Check } from 'lucide-react';
import { TypingIndicator } from './TypingIndicator';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types'; // tipos

  type ChatAreaProps = {
    messages?: Message[];    
    isTyping?: boolean;      
    selectedRole: string | null; 
    onTokenUpdate: (metadata: any) => void;
    setMessages: Dispatch<SetStateAction<Message[]>>; 
  };

  export function ChatArea({ 
    messages = [], 
    isTyping = false,
    selectedRole,
    onTokenUpdate 
  }: ChatAreaProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);


    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
      scrollToBottom();
    }, [messages, isTyping]); // Agregamos isTyping al efecto para que haga scroll cuando aparezca el indicador

    const handleCopy = async (text: string, id: string) => {
      try {
        const cleanText = text
          .replace(/[#*`_~]/g, '')
          .replace(/\[(.*?)\]\(.*?\)/g, '$1')
          .replace(/^-\s/gm, '')
          .replace(/^\d+\.\s/gm, '')
          .trim();
        await navigator.clipboard.writeText(cleanText);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000); // Reset del icono tras 2s
      } catch (err) {
        console.error("Error al copiar:", err);
      }
    };
  return (
    <div className="min-w-0 p-4 md:p-8 space-y-6 md:space-y-12 bg-background">
      {messages.map((message) => (
        <div key={message.id}>
          {message.isTyping ? (
            <div className="max-w-3xl mx-auto w-full flex gap-3 md:gap-6 items-start animate-in fade-in slide-in-from-bottom-2 duration-700">
              <div className="shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-lg bg-white/10 flex items-center justify-center shadow-lg text-white">
                <img
                  src="/LOGO2.png"
                  alt="JUXA"
                  className="w-14 h-14 object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Asistente JUXA</p>
                <TypingIndicator />
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full flex gap-6 items-start animate-in fade-in slide-in-from-bottom-2 duration-700">
              <div
                className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center shadow-md ${message.role === 'user'
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-white/10 border border-white/10'
                  }`}
              >
                {message.role === 'user' ? <User size={20} /> : <img
                  src="/LOGO2.png"
                  alt="JUXA"
                  className="w-14 h-14 object-contain"
                />}
              </div>

              <div className="min-w-0 space-y-2 relative">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                    {message.role === 'user' ? 'Abogado Consultante' : 'Asistente JUXA'}
                  </p>
                  <span className="text-[10px] text-muted-foreground/30">
                    {new Date(message.timestamp).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {message.attachmentType && (
                  <div className={`mb-3 overflow-hidden rounded-2xl border border-white/10 bg-white/5 w-fit max-w-sm shadow-2xl animate-in zoom-in-95 duration-300`}>
                    {/* CASO 1: IMÁGENES */}
                    {message.attachmentType === 'image' ? (
                      <div className="flex flex-col group relative">
                        <img
                          src={message.attachmentUrl}
                          alt={message.attachmentName}
                          className="w-full h-auto max-h-[350px] object-contain bg-black/20 cursor-pointer transition-transform duration-500 hover:scale-[1.02]"
                          onClick={() => window.open(message.attachmentUrl, '_blank')}
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-black/50 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
                            <Copy size={14} className="text-white/70" />
                          </div>
                        </div>
                        <div className="px-3 py-2 flex items-center gap-2 bg-black/40 backdrop-blur-md border-t border-white/5">
                          <Paperclip className="w-3 h-3 text-primary" />
                          <span className="text-[10px] font-medium truncate text-white/80 tracking-wide">
                            {message.attachmentName || 'Imagen adjunta'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* CASO 2: DOCUMENTOS O VOZ */
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 to-transparent">
                        <div className="p-2 bg-primary/20 rounded-lg border border-primary/20">
                          {message.attachmentType === 'document' || message.attachmentType === 'pdf' ? (
                            <Paperclip className="w-4 h-4 text-primary" />
                          ) : (
                            <Mic className="w-4 h-4 text-primary" />
                          )}

                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-foreground/90 truncate pr-4">
                            {message.attachmentName || 'Archivo adjunto'}
                          </span>
                          <span className="text-[9px] uppercase tracking-tighter text-muted-foreground/60 font-bold">
                            {message.attachmentType}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

            


                )}

                

                <div className="text-foreground/90 leading-relaxed text-sm md:text-base font-light selection:bg-secondary/30 max-w-full overflow-hidden break-words text-left">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ children }) => (
                        <div className="my-4 overflow-x-auto rounded-lg border border-white/10 shadow-xl">
                          <table className="w-full border-collapse text-left">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-white/5 border-b border-white/10">
                          {children}
                        </thead>
                      ),
                      // Forzamos que las celdas de encabezado no se rompan
                      th: ({ children }) => (
                        <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-primary whitespace-nowrap">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="px-4 py-3 text-sm text-white/80 border-b border-white/5 align-top min-w-[150px]">
                          <div className="leading-relaxed">
                            {children}
                          </div>
                        </td>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary 
                            font-medium 
                            decoration-primary/30 
                            hover:decoration-primary 
                            hover:text-secondary 
                            transition-all 
                            duration-200 
                            break-all 
                            cursor-pointer"
                        >
                          {children}
                        </a>
                      ),
                      p: ({ children }) => (
                        <p className="whitespace-pre-wrap text-sm md:text-base font-light text-foreground/90 mb-4 break-words text-left">
                          {children}
                        </p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-foreground break-words">
                          {children}
                        </strong>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base md:text-lg font-bold mt-6 mb-2 text-primary break-words text-left">
                          {children}
                        </h3>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc ml-4 md:ml-6 mb-4 text-left space-y-2">
                          {children}
                        </ul>
                      ),
                      li: ({ children }) => (
                        <li className="break-words text-sm md:text-base">
                          {children}
                        </li>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                  {message.role === 'assistant' && message.id !== '1' && (
                    <button
                      onClick={() => handleCopy(message.content, message.id)}
                      className="p-2 mt-2 hover:bg-white/5 rounded-md text-muted-foreground hover:text-white transition-colors flex items-center gap-2 group/btn"
                      title="Copiar mensaje"
                    >
                      {copiedId === message.id ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} className="group-hover/btn:scale-110 transition-transform" />
                      )}
                      <span className="text-[10px] uppercase font-bold tracking-wider">
                        {copiedId === message.id ? 'Copiado' : 'Copiar'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Indicador de escritura adicional si es necesario */}
      {isTyping && !messages.some(m => m.isTyping) && (
        <div className="max-w-3xl mx-auto w-full flex gap-6 items-start">
          <TypingIndicator />
        </div>
      )}

      <div ref={messagesEndRef} className="h-10 md:h-20" />
    </div>
  );
}