
import React, { useState } from 'react';
import { Gavel, Upload, X, Zap, CheckCircle, FileText, Settings, AlignCenter, ArrowRight } from 'lucide-react';
import { generateSentence } from '../services/geminiService';
import { UsageMetadata, UserRole } from '../types';
import ReactMarkdown from 'react-markdown';

interface SentenceGeneratorPanelProps {
    onTokenUpdate?: (metadata: UsageMetadata) => void;
    onClose?: () => void;
    onElevate?: (fullDocument: string, files: File[]) => void;
}

export const SentenceGeneratorPanel: React.FC<SentenceGeneratorPanelProps> = ({ 
    onTokenUpdate,
    onClose,
    onElevate
}) => {
    const [files, setFiles] = useState<File[]>([]);
    const [notes, setNotes] = useState('');
    const [courtType, setCourtType] = useState('Cuantía Menor / Paz');
    const [jurisdiction, setJurisdiction] = useState('Ciudad de México (TSJCDMX)');
    
    const [generatedSentence, setGeneratedSentence] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
            e.target.value = '';
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleGenerate = async () => {
        if (!notes.trim() && files.length === 0) return;
        setIsLoading(true);
        setGeneratedSentence('');
        
        // Enrich context with UI selections
        const contextNotes = `
        CONTEXTO JURISDICCIONAL: ${jurisdiction}. 
        TIPO DE JUZGADO: ${courtType}.
        
        INSTRUCCIONES DEL JUZGADOR:
        ${notes}
        `;

        try {
            const { text, usageMetadata } = await generateSentence({
                judgeNotes: contextNotes,
                caseFiles: files,
                role: UserRole.JUZGADOR,
                documentType: "MAGISTRADO AI: Sentencia Universal"
            });
            setGeneratedSentence(text);
            if (usageMetadata && onTokenUpdate) onTokenUpdate(usageMetadata);
        } catch (e) {
            console.error(e);
            setGeneratedSentence("Error al generar la sentencia. Por favor verifica los documentos.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleElevateToEditor = () => {
        if (onElevate && generatedSentence) {
            onElevate(generatedSentence, files);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#050505]">
            <div className="w-full max-w-7xl mx-auto h-full flex flex-col md:flex-row gap-6 p-6 md:p-12 animate-fade-in">
                
                {/* LEFT COLUMN: CONFIGURATION */}
                <div className="flex flex-col space-y-5 w-full md:w-1/3 h-full overflow-y-auto scrollbar-hide">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
                            <Gavel className="w-8 h-8 mr-3 text-slate-200" />
                            MAGISTRADO AI
                        </h2>
                        <p className="text-slate-400 text-sm">Generador de Sentencias Definitivas Exhaustivas.</p>
                    </div>

                    <div className="p-4 bg-[#0f0f11] rounded-xl border border-white/5 space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Jurisdicción</label>
                            <select 
                                value={jurisdiction}
                                onChange={(e) => setJurisdiction(e.target.value)}
                                className="w-full bg-[#151517] border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none"
                            >
                                <option>Ciudad de México (TSJCDMX)</option>
                                <option>Federal (PJF)</option>
                                <option>Estado de México</option>
                                <option>Nuevo León</option>
                                <option>Jalisco</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Tipo de Juzgado</label>
                            <select 
                                value={courtType}
                                onChange={(e) => setCourtType(e.target.value)}
                                className="w-full bg-[#151517] border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none"
                            >
                                <option>Cuantía Menor / Paz</option>
                                <option>Primera Instancia Civil</option>
                                <option>Primera Instancia Mercantil</option>
                                <option>Oralidad Mercantil</option>
                                <option>Familiar</option>
                            </select>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Expediente Digital</label>
                         <div className="relative group border border-dashed border-slate-700 bg-[#0f0f11] rounded-xl p-8 hover:bg-white/5 transition-all cursor-pointer text-center flex flex-col items-center justify-center">
                            <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" accept=".pdf,.doc,.docx,.txt" />
                            <Upload className="w-8 h-8 text-slate-500 mb-3 group-hover:text-white transition-colors" />
                            <div className="text-xs font-bold text-slate-300">Subir Autos / Expediente</div>
                            <div className="text-[10px] text-slate-500 mt-1">PDF, Word (Máx 50MB)</div>
                         </div>
                         
                         {/* File List */}
                         {files.length > 0 && (
                            <div className="flex flex-col gap-2 mt-2">
                                {files.map((f, i) => (
                                    <div key={i} className="bg-slate-800/50 text-xs px-3 py-2 rounded flex items-center justify-between border border-white/10">
                                        <div className="flex items-center">
                                            <FileText className="w-3 h-3 mr-2 text-slate-400" />
                                            <span className="truncate text-slate-300 max-w-[200px]">{f.name}</span>
                                        </div>
                                        <button onClick={() => removeFile(i)} className="text-slate-500 hover:text-white"><X className="w-3 h-3"/></button>
                                    </div>
                                ))}
                            </div>
                         )}
                    </div>

                    <div className="space-y-2 flex-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Instrucciones del Juzgador (Sentido del Fallo)</label>
                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ej. Se declara procedente la vía ejecutiva mercantil. Se condena al pago de suerte principal. Se reducen intereses moratorios por usura al 34% anual con base en jurisprudencia..."
                            className="w-full h-full min-h-[150px] bg-[#151517] border border-slate-700 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-slate-500 outline-none resize-none placeholder:text-slate-600 font-serif"
                        />
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={isLoading || (files.length === 0 && !notes)}
                        className="w-full bg-slate-100 hover:bg-white text-black font-bold py-4 rounded-xl shadow-lg shadow-white/10 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-auto uppercase tracking-wider text-xs"
                    >
                        {isLoading ? (
                            <div className="animate-spin w-5 h-5 border-2 border-slate-400 border-t-black rounded-full"></div>
                        ) : (
                            <>
                                <Gavel className="w-5 h-5 mr-2" />
                                DICTAR SENTENCIA
                            </>
                        )}
                    </button>
                    {onClose && (
                        <button onClick={onClose} className="w-full py-2 text-xs text-slate-500 hover:text-white transition-colors">
                            Volver al Menú
                        </button>
                    )}
                </div>

                {/* RIGHT COLUMN: PREVIEW */}
                <div className="flex flex-col w-full md:w-2/3 bg-white rounded-2xl overflow-hidden shadow-2xl h-full relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-slate-700 to-slate-900"></div>
                    
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center text-slate-800">
                        <div className="flex items-center space-x-2">
                            <AlignCenter className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold uppercase tracking-widest">Vista Preliminar</span>
                        </div>
                        {generatedSentence && (
                            <div className="flex items-center space-x-3">
                                <span className="text-emerald-600 flex items-center text-[10px] font-bold px-2 py-1 bg-emerald-100 rounded-full border border-emerald-200">
                                    <CheckCircle className="w-3 h-3 mr-1"/> PROYECTO LISTO
                                </span>
                                {onElevate && (
                                    <button 
                                        onClick={handleElevateToEditor}
                                        className="text-[10px] bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg font-bold flex items-center transition-colors shadow-lg"
                                    >
                                        ABRIR EN EDITOR <ArrowRight className="w-3 h-3 ml-2" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* PAPER VIEW */}
                    <div className="flex-1 bg-white p-12 md:p-16 text-black overflow-y-auto font-serif text-justify leading-loose shadow-inner relative">
                        {generatedSentence ? (
                            <ReactMarkdown 
                                components={{
                                    h1: ({node, ...props}) => <h1 className="text-right font-bold uppercase text-sm mb-2" {...props} />, // Header derecho
                                    h2: ({node, ...props}) => <h2 className="text-center font-bold uppercase text-sm mt-8 mb-6" {...props} />, // Header centrado
                                    p: ({node, children, ...props}) => {
                                        const text = String(children);
                                        if (text.includes("V I S T O S") || text.includes("R E S U L T A N D O") || text.includes("C O N S I D E R A N D O S") || text.includes("R E S U E L V E")) {
                                            return <p className="text-center font-bold tracking-[0.2em] my-8 uppercase" {...props}>{children}</p>;
                                        }
                                        if (text.startsWith('|||')) {
                                            return <p className="text-center font-bold uppercase mt-8 mb-2" {...props}>{text.replace('|||', '')}</p>;
                                        }
                                        return <p className="mb-6 indent-12" {...props}>{children}</p>;
                                    },
                                    strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-none mb-4 space-y-4" {...props} />, // Listas sin bullet para estilo legal
                                    li: ({node, ...props}) => <li className="pl-0 text-justify" {...props} />,
                                }}
                            >
                                {generatedSentence}
                            </ReactMarkdown>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-300 opacity-50 space-y-4">
                                <div className="w-24 h-32 border-2 border-dashed border-slate-300 rounded flex items-center justify-center">
                                    <Gavel className="w-8 h-8" />
                                </div>
                                <p className="text-sm font-sans font-bold tracking-widest uppercase">Esperando Instrucciones</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
