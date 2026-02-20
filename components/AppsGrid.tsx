
import React from 'react';
import { Lightbulb, FileSearch, ArrowRight, Zap, Grid, Gavel } from 'lucide-react';
import { AppMode } from '../types';

interface AppsGridProps {
    onNavigate: (mode: AppMode) => void;
    onAction?: (tokenCost: number) => void;
}

interface JuxaApp {
    id: string;
    title: string;
    description: string;
    icon: any;
    gradient: string;
    costEstimate: number;
    action: () => void;
    isComingSoon?: boolean;
}

export const AppsGrid: React.FC<AppsGridProps> = ({ onNavigate, onAction }) => {
    
    const REGISTERED_APPS: JuxaApp[] = [
        {
            id: 'sentence-builder',
            title: "MAGISTRADO AI",
            description: "Generador de Sentencias Definitivas de Alta Precisión. Estructura judicial exhaustiva, control de convencionalidad y análisis de usura.",
            icon: Gavel,
            gradient: "from-slate-700 to-slate-900",
            costEstimate: 500,
            action: () => onNavigate(AppMode.SENTENCE_BUILDER)
        },
        {
            id: 'argument-builder',
            title: "JUXA CONSTRUCTOR",
            description: "Ingeniería de redacción jurídica. Genera agravios, conceptos de violación y argumentos lógicos con formato de autoridad o postulante.",
            icon: Lightbulb,
            gradient: "from-purple-500 to-indigo-600",
            costEstimate: 150,
            action: () => onNavigate(AppMode.ARGUMENT_BUILDER)
        },
        {
            id: 'document-analysis',
            title: "JUXA ANALYTICS",
            description: "Auditoría forense de expedientes. Extrae hechos, detecta debilidades, mapea entidades y genera estrategias de litigio.",
            icon: FileSearch,
            gradient: "from-cyan-500 to-blue-600",
            costEstimate: 300,
            action: () => onNavigate(AppMode.DOCUMENT_ANALYSIS)
        }
    ];

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-[#050505] relative scrollbar-hide">
            <div className="max-w-5xl mx-auto pt-10">
                <div className="flex items-end justify-between mb-10 border-b border-white/10 pb-6">
                    <div>
                        <h2 className="text-4xl font-bold text-white mb-2 tracking-tight flex items-center">
                            <Grid className="w-8 h-8 mr-3 text-emerald-500" />
                            Suite de Herramientas
                        </h2>
                        <p className="text-slate-400">Módulos especializados de alto rendimiento.</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {REGISTERED_APPS.map((app) => (
                        <div 
                            key={app.id} 
                            onClick={app.action}
                            className={`group relative bg-[#0f0f11] border border-white/10 p-1 rounded-3xl transition-all cursor-pointer flex flex-col hover:-translate-y-2 hover:shadow-2xl overflow-hidden ${app.isComingSoon ? 'opacity-70 grayscale-[0.5] hover:grayscale-0' : ''}`}
                        >
                            <div className="bg-[#151517] h-full rounded-[1.3rem] p-8 flex flex-col relative z-10 overflow-hidden">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${app.gradient} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                                        <app.icon className="w-8 h-8 text-white" />
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-colors">
                                    {app.title}
                                </h3>
                                
                                <p className="text-sm text-slate-400 mb-8 leading-relaxed flex-1">
                                    {app.description}
                                </p>

                                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                     <div className="flex items-center text-xs text-slate-600 font-mono">
                                         <Zap className="w-3 h-3 mr-1 text-yellow-600" /> 
                                         {app.costEstimate} TOKENS
                                     </div>
                                     <div className={`flex items-center text-xs font-bold transition-colors text-white bg-white/5 px-4 py-2 rounded-lg border border-white/5 group-hover:bg-white/10`}>
                                         INICIAR <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                                     </div>
                                </div>
                            </div>
                            <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl`}></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
