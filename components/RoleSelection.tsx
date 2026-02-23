import React from 'react';
import { 
  Gavel, GraduationCap, BookOpen, University, 
  Briefcase, Landmark, Receipt, Scale, ChevronRight 
} from 'lucide-react';
import { UserRole } from '../types';

interface RoleSelectionProps {
  onRoleSelect: (role: string) => void;
}

const ROLES = [
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
    <div className="min-h-full w-full flex flex-col items-center justify-center p-6 bg-[#050505]">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white tracking-tight">Selecciona tu Perfil</h2>
          <p className="text-slate-400">JUXA adaptará su lenguaje y herramientas a tu especialidad.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => onRoleSelect(role.id)}
              className="flex items-start p-4 rounded-xl bg-[#0f0f11] border border-white/5 hover:border-blue-500/50 hover:bg-[#151517] transition-all group text-left"
            >
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors mr-4">
                {role.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{role.label}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">{role.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-white self-center ml-2" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};