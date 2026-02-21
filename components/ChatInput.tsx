import { useState, useRef } from 'react';
import { Send, Paperclip, Mic, X } from 'lucide-react';

type ChatInputProps = {
  onSendMessage: (
    content: string,
    attachmentType?: 'document' | 'voice' | 'image' | 'pdf',
    attachmentName?: string,
    file?: File,
    url?: string
  ) => void;
};

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<{
    type: 'document' | 'voice' | 'image' | 'pdf';
    name: string;
    file?: File;
    attachmentUrl?: string;
  } | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() || attachment) {
      const defaultText = attachment?.type === 'image' ? 'Imagen adjunta' :
        attachment?.type === 'document' ? 'Archivo adjunto' :
          'Mensaje de voz';

      onSendMessage(
        message.trim() || defaultText,
        attachment?.type,
        attachment?.name,
        attachment?.file,
        attachment?.attachmentUrl
      );

      setMessage('');
      setAttachment(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const isImage = selectedFile.type.startsWith('image/');
      const previewUrl = isImage ? URL.createObjectURL(selectedFile) : undefined;

      setAttachment({
        type: isImage ? 'image' : 'document',
        name: selectedFile.name,
        file: selectedFile,
        attachmentUrl: previewUrl
      });
    }
  };

  const handleVoiceRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setAttachment({
          type: 'voice',
          name: 'Grabación de voz.mp3'
        });
      }, 2000);
    }
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          // Creamos la URL para la miniatura
          const previewUrl = URL.createObjectURL(file);

          setAttachment({
            type: 'image',
            name: `Captura_${new Date().getTime()}.png`,
            file: file,
            attachmentUrl: previewUrl
          });

          // Opcional: Si quieres que no se pegue el texto "image.png" en el textarea
          e.preventDefault();
        }
      }
    }
  };

  return (
    <div className="bg-transparent px-0 pb-1 pt-0">
      <div className="max-w-3xl mx-auto relative">

        {/* Contenedor Principal de Entrada */}
        <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl focus-within:border-primary/40 transition-all duration-300 group overflow-hidden">

          {/* PREVIEW INTEGRADO (NUEVO) */}
          {attachment && (
            <div className="px-4 pt-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="relative inline-block group/preview">
                {attachment.type === 'image' && attachment.attachmentUrl ? (
                  <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                    <img
                      src={attachment.attachmentUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
                    <Paperclip className="w-4 h-4 text-primary" />
                    <span className="text-xs text-foreground truncate max-w-[150px]">{attachment.name}</span>
                  </div>
                )}

                {/* Botón para eliminar adjunto */}
                <button
                  onClick={() => setAttachment(null)}
                  className="absolute -top-2 -right-2 p-1 bg-background border border-white/10 rounded-full text-foreground/70 hover:text-white shadow-xl opacity-100 md:opacity-0 group-hover/preview:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-end p-1.5 md:p-2">
            {/* Botones de acción lateral */}
            <div className="flex gap-0.5 md:gap-1 pb-1 pl-0.5 md:pl-2">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 md:p-3 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all"
              >
                <Paperclip size={18} className="md:w-5 md:h-5" />
              </button>
              <button
                onClick={handleVoiceRecord}
                className={`p-2 md:p-3 rounded-full transition-all ${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}
              >
                <Mic size={20} />
              </button>
            </div>

            {/* Area de Texto */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              onPaste={handlePaste}
              placeholder="Escribe tu consulta legal..."
              className="flex-1 bg-transparent 
              border-none px-2 md:px-4 py-3 md:py-4 text-foreground placeholder:text-muted-foreground/40 resize-none min-h-[48px] md:min-h-[56px] max-h-32 text-sm md:text-base font-light outline-none focus:ring-0"
              rows={1}
            />

            {/* Botón de Enviar */}
            <div className="pb-1 pr-1">
              <button
                onClick={handleSend}
                disabled={!message.trim() && !attachment}
                className="p-3 md:p-4 bg-gradient-to-br from-primary to-secondary text-white rounded-full hover:scale-105 active:scale-95 disabled:opacity-20 transition-all"
              >
                <Send size={18} className="md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Info Inferior */}
        <p className="text-[6px] md:text-[9px] text-center text-white/40 mt-2 uppercase tracking-[0.2em]">
          JUXA AI • Inteligencia Legal Protegida
        </p>
      </div>
    </div>
  );
}