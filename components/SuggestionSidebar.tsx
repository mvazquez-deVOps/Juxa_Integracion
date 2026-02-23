import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, ChevronRight, Sparkles } from 'lucide-react';

interface SuggestionsSidebarProps {
  suggestions: string[];
  onSuggestionClick: (text: string) => void;
  isVisible: boolean;
}

export const SuggestionsSidebar: React.FC<SuggestionsSidebarProps> = ({ suggestions, onSuggestionClick, isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && suggestions.length > 0 && (
        <motion.aside
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="hidden xl:flex flex-col w-80 bg-black border-l border-white/10 h-screen sticky top-0 overflow-hidden shadow-[-20px_0_60px_rgba(0,0,0,0.8)] z-30"
        >
          {/* Luz ambiental institucional */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />

          <header className="p-8 border-b border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.6em]">Proyección Legal</span>
            </div>
            <h3 className="text-xl font-light italic tracking-tighter text-white/90">Sugerencias Semánticas</h3>
          </header>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {suggestions.map((text, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                onClick={() => onSuggestionClick(text)}
                className="w-full text-left group relative p-5 bg-white/[0.02] border border-white/5 hover:border-primary/40 transition-all duration-500 rounded-none overflow-hidden"
              >
                <div className="flex items-start gap-3">
                  <Scale className="w-4 h-4 text-white/20 mt-0.5 group-hover:text-primary transition-colors" />
                  <p className="text-sm text-white/50 font-light leading-relaxed italic group-hover:text-white transition-colors">
                    "{text}"
                  </p>
                </div>
                <ChevronRight className="absolute bottom-4 right-4 w-3 h-3 text-white/10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </motion.button>
            ))}
          </div>

          <footer className="p-8 border-t border-white/5 bg-white/[0.01]">
            <p className="text-[9px] text-white/10 tracking-[0.5em] uppercase leading-relaxed text-center font-medium">
              Análisis de Contexto <br /> Basado en IA Judicial
            </p>
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};