import React from 'react';
import { 
  Gavel, GraduationCap, BookOpen, University, 
  Briefcase, Landmark, Receipt, Scale, ChevronRight,
  BrainCircuit // Añadimos este para el Icono central
} from 'lucide-react';
import { UserRole } from '../types';

interface RoleSelectionProps {
  onRoleSelect: (role: string) => void;
}

const ROLES = [
  // ... (Tus roles se mantienen igual)
  {
    id: UserRole.POSTULANTE,
    label: 'Abogado Postulante',
    desc: 'Estrategia procesal, redacción de demandas, control de plazos y fundamentos de derecho.',
    icon: <Gavel className="w-6 h-6" />
  },
  {
    id: UserRole.ESTUDIANTE,
    label: 'Estudiante de Derecho',
    desc: 'Explicaciones didácticas, análisis de doctrina base y resúmenes de conceptos.',
    icon: <GraduationCap className="w-6 h-6" />
  },
  {
    id: UserRole.ASISTENTE,
    label: 'Asistente Jurídico',
    desc: 'Apoyo operativo en trámites administrativos y gestión de expedientes.',
    icon: <BookOpen className="w-6 h-6" />
  },
  {
    id: UserRole.ACADEMICO,
    label: 'Perfil Académico',
    desc: 'Investigación jurídica profunda, derecho comparado y análisis de fuentes.',
    icon: <University className="w-6 h-6" />
  },
  {
    id: UserRole.GOBIERNO,
    label: 'Función Pública',
    desc: 'Asesoría en derecho administrativo y cumplimiento de políticas públicas.',
    icon: <Briefcase className="w-6 h-6" />
  },
  {
    id: UserRole.PODER_JUDICIAL,
    label: 'Poder Judicial',
    desc: 'Criterios de juzgamiento, jurisprudencia y estructura de resoluciones.',
    icon: <Landmark className="w-6 h-6" />
  },
  {
    id: UserRole.COBRANZA,
    label: 'Cobranza',
    desc: 'Buenas prácticas de cobranza y negociación para cobradores.',
    icon: <Receipt className="w-6 h-6" />
  },
  {
    id: UserRole.FISCALIA,
    label: 'Fiscalía',
    desc: 'Apoyo en procesos penales, análisis de casos y estrategias fiscales.',
    icon: <Scale className="w-6 h-6" />
  },
];

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onRoleSelect }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start py-12 px-6 bg-black">
      {/* 1. Neural Orb Icon (Copiado de tu Landing para consistencia) */}
      <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400 to-blue-600 rounded-full animate-pulse blur-md opacity-50"></div>
          <div className="absolute inset-1 bg-black rounded-full z-10"></div>
          <div className="absolute inset-0 flex items-center justify-center z-20">
              <BrainCircuit className="w-10 h-10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
          </div>
          <div className="absolute -inset-2 border border-white/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
      </div>

      <div className="max-w-4xl w-full space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-bold text-white tracking-tight">Bienvenido a JUXA AI</h2>
          <p className="text-slate-400 text-lg">Selecciona tu perfil para personalizar la experiencia jurídica</p>
        </div>

        {/* 2. Grid de Roles con diseño mejorado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => onRoleSelect(role.id)}
              className="flex items-center p-5 rounded-2xl bg-[#0f0f11] border border-white/5 hover:border-emerald-500/50 hover:bg-[#151517] transition-all group text-left shadow-xl"
            >
              <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 mr-5 shadow-inner">
                {role.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {role.label}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mt-1 line-clamp-2">
                  {role.desc}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};