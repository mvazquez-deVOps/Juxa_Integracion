
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Scale, FileText, Gavel, HelpCircle, CheckCircle, AlertTriangle, Fingerprint, Flag } from 'lucide-react';

const NodeIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'hecho': return <Fingerprint className="w-4 h-4 text-blue-400" />;
        case 'hecho_probado': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
        case 'prueba': return <FileText className="w-4 h-4 text-amber-400" />;
        case 'derecho': return <Scale className="w-4 h-4 text-purple-400" />;
        case 'norma': return <Scale className="w-4 h-4 text-purple-400" />;
        case 'pretension': return <Flag className="w-4 h-4 text-red-400" />;
        case 'resolutivo': return <Gavel className="w-4 h-4 text-white" />;
        case 'valoracion': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
        default: return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
};

const getNodeStyles = (type: string) => {
    const base = "backdrop-blur-md border shadow-lg transition-all duration-300";
    switch (type) {
        case 'hecho': return `${base} bg-blue-900/40 border-blue-500/50 hover:shadow-blue-500/20`;
        case 'hecho_probado': return `${base} bg-emerald-900/40 border-emerald-500/50 hover:shadow-emerald-500/20`;
        case 'prueba': return `${base} bg-amber-900/20 border-amber-500/50 hover:shadow-amber-500/20 rounded-sm`; // Cuadrado
        case 'derecho': 
        case 'norma': return `${base} bg-purple-900/40 border-purple-500/50 hover:shadow-purple-500/20 rotate-0`;
        case 'pretension': return `${base} bg-red-900/40 border-red-500/50 hover:shadow-red-500/20`;
        case 'resolutivo': return `${base} bg-slate-800 border-white/50 hover:shadow-white/20`;
        default: return `${base} bg-slate-800/80 border-slate-600`;
    }
};

export const JuxaNode = memo(({ data, selected }: NodeProps) => {
    const { label, type, details } = data;
    
    return (
        <div className={`px-4 py-3 min-w-[180px] max-w-[250px] rounded-xl relative group ${getNodeStyles(type)} ${selected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#050505]' : ''}`}>
            {/* Input Handle */}
            <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-2 !h-2" />
            
            <div className="flex items-start space-x-3">
                <div className={`mt-1 p-1.5 rounded-lg bg-black/30 border border-white/5 shadow-inner`}>
                    <NodeIcon type={type} />
                </div>
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-0.5">{type?.replace('_', ' ')}</div>
                    <div className="text-sm font-semibold text-white leading-tight">{label}</div>
                    {details && (
                        <div className="text-[10px] text-slate-400 mt-2 border-t border-white/10 pt-1 hidden group-hover:block animate-fade-in">
                            {details}
                        </div>
                    )}
                </div>
            </div>

            {/* Output Handle */}
            <Handle type="source" position={Position.Right} className="!bg-slate-400 !w-2 !h-2" />
        </div>
    );
});
