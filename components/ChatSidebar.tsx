import { MessageSquare, Plus, Clock, X, Scale, LogOut, Home, Sparkles, MessageCircle } from 'lucide-react';
import { Conversation } from '../App';

type ChatSidebarProps = {
  onSuggestionClick: (suggestion: string) => void;
  conversations: Conversation[];
  onLoadConversation: (conv: Conversation) => void;
  onNewChat: () => void;
  onAdjustProfile: () => void;
  isOpen: boolean;
  onClose: () => void;
  userData?: any;
  onNavigate: (view: any) => void;
  suggestedPrompts: string[];
};

export function ChatSidebar({
  onSuggestionClick,
  conversations,
  onLoadConversation,
  onNewChat,
  onAdjustProfile,
  isOpen,
  onClose,
  userData,
  onNavigate,
  suggestedPrompts,
}: ChatSidebarProps) {
  
  const handleLogout = () => {
    localStorage.removeItem('juxa_token');
    localStorage.removeItem('juxa_user_data');
    onNavigate('home');
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Principal */}
      <div 
        className={`fixed lg:relative inset-y-0 left-0 z-50 bg-sidebar border-r border-white/10 flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen 
            ? "w-80 opacity-100" : "w-0 opacity-0 border-none" 
            } h-[100svh] bg-sidebar`}
      >
        {/* Header con Perfil de Usuario */}
        <div className="min-w-[320px] flex flex-col h-full overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30">
                  {userData?.name?.charAt(0) || 'U'}
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white truncate w-32">
                    {userData?.name || 'Usuario JUXA'}
                  </span>
                  <span className="text-[10px] text-muted-foreground">Sesión Activa</span>
                </div>
            </div>
            <button onClick={() => onNavigate('home')} className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground transition-colors">
              <Home className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground transition-colors active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Botón Nueva Consulta */}
          <div className="p-4 px-6 shrink-0">
            <button
              onClick={() => { onNewChat(); onClose(); }}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-primary hover:brightness-110 text-white rounded-xl transition-all font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20"
            >
              <Plus className="w-5 h-5" />
              <span>Nueva consulta</span>
            </button>
          </div>

          <div className="p-6 pt-2 mb-8">
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-accent-blue" />
              Sugerencias
            </h2>
            
            <div className="space-y-2">
              {suggestedPrompts.length > 0 ? (
                suggestedPrompts.map((text, idx) => (
                  <button
                    key={idx}
                    onClick={() => { onSuggestionClick(text); onClose(); }}
                    className="w-full text-left p-3 bg-white/[0.02] border border-white/5 hover:border-primary/40 rounded-xl transition-all group"
                  >
                    <div className="flex items-start gap-2">
                      <MessageCircle size={12} className="mt-1 text-primary/40 group-hover:text-primary" />
                      <p className="text-[11px] text-white/50 group-hover:text-white leading-relaxed italic">
                        "{text}"
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-[11px] text-muted-foreground/30 px-2">
                  Haz una consulta para recibir sugerencias inteligentes.
                </p>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {/* Historial */}
            {conversations.length > 0 && (
              <div className="p-6 pt-6 border-t border-white/5 mt-4">
                <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-accent-blue" />
                  Historial
                </h2>
                <div className="space-y-1">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => { onLoadConversation(conversation); onClose(); }}
                      className="w-full text-left px-4 py-2.5 text-xs text-muted-foreground hover:bg-white/5 hover:text-white rounded-lg transition-all"
                    >
                      <div className="truncate">{conversation.title}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 mb-[env(safe-area-inset-bottom)] shrink-0 bg-sidebar">
            <button
              onClick={() => { onAdjustProfile(); onClose(); }}
              className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-muted-foreground hover:text-secondary transition-all uppercase tracking-widest"
            >
              <Scale className="w-4 h-4" />
              Cambiar Perfil Legal
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-red-400 hover:bg-red-400/10 transition-all uppercase tracking-widest border-t border-white/5"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </>
  );
}