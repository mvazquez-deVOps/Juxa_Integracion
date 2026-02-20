
import React from 'react';
import { Command, ChevronDown, Scale, Briefcase, Gavel, Building2, Home, ArrowLeft } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onGoHome: () => void;
  showHomeButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentRole, onRoleChange, onGoHome, showHomeButton }) => {
  return (
    <header className="bg-[#050505] text-white p-4 flex items-center justify-between border-b border-white/10 relative z-50">
      <div className="flex items-center space-x-4">
          <div 
            className="flex items-center space-x-3 cursor-pointer group transition-all hover:bg-white/5 p-2 -ml-2 rounded-xl"
            onClick={onGoHome}
            title="Ir al Menú Principal"
          >
            <div className="bg-white/5 p-2 rounded-lg border border-white/10 group-hover:border-emerald-500/50 transition-colors relative">
              {showHomeButton ? (
                 <ArrowLeft className="w-5 h-5 text-emerald-500" />
              ) : (
                 <Command className="w-5 h-5 text-emerald-500" />
              )}
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight group-hover:text-emerald-400 transition-colors">
                <span className={!showHomeButton ? "text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500" : "text-white"}>JUXA</span>
              </h1>
            </div>
          </div>
      </div>
      
      <div className="flex items-center space-x-4">
          <div className="relative group">
            <button className="flex items-center space-x-2 text-[10px] font-bold tracking-widest uppercase text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20 hover:bg-blue-500/20 transition-all">
               {currentRole === UserRole.JUZGADOR && <Scale className="w-3 h-3 mr-1"/>}
               {currentRole === UserRole.POSTULANTE && <Briefcase className="w-3 h-3 mr-1"/>}
               {currentRole === UserRole.FISCALIA && <Gavel className="w-3 h-3 mr-1"/>}
               {currentRole === UserRole.AUTORIDAD && <Building2 className="w-3 h-3 mr-1"/>}
               <span className="hidden md:inline">MODO: {currentRole}</span>
               <span className="md:hidden">{currentRole.substring(0,3)}</span>
               <ChevronDown className="w-3 h-3 ml-1" />
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#0f0f11] border border-white/10 rounded-xl shadow-2xl overflow-hidden hidden group-hover:block animate-fade-in z-50">
               <div className="p-2 space-y-1">
                  <div className="text-[10px] text-slate-500 px-2 py-1 uppercase font-bold tracking-wider">Seleccionar Perfil</div>
                  
                  <button onClick={() => onRoleChange(UserRole.JUZGADOR)} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center hover:bg-white/5 ${currentRole === UserRole.JUZGADOR ? 'text-blue-400 bg-blue-500/10' : 'text-slate-300'}`}>
                     <Scale className="w-4 h-4 mr-2" /> JUZGADOR
                  </button>
                  <button onClick={() => onRoleChange(UserRole.FISCALIA)} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center hover:bg-white/5 ${currentRole === UserRole.FISCALIA ? 'text-red-400 bg-red-500/10' : 'text-slate-300'}`}>
                     <Gavel className="w-4 h-4 mr-2" /> FISCALÍA
                  </button>
                  <button onClick={() => onRoleChange(UserRole.POSTULANTE)} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center hover:bg-white/5 ${currentRole === UserRole.POSTULANTE ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-300'}`}>
                     <Briefcase className="w-4 h-4 mr-2" /> POSTULANTE
                  </button>
                  <button onClick={() => onRoleChange(UserRole.AUTORIDAD)} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center hover:bg-white/5 ${currentRole === UserRole.AUTORIDAD ? 'text-amber-400 bg-amber-500/10' : 'text-slate-300'}`}>
                     <Building2 className="w-4 h-4 mr-2" /> AUTORIDAD
                  </button>
               </div>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-xs font-bold shadow-lg shadow-blue-900/20 text-white cursor-help" title="Usuario Pro">
            AD
          </div>
      </div>
    </header>
  );
};
