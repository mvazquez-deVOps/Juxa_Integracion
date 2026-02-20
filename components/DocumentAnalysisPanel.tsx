
import React, { useState } from 'react';
import { FileSearch, Upload, X, Zap, CheckCircle, Sparkles, MessageSquare, Send, Bot, User, FileText, Settings, ShieldAlert, Target, List, ArrowRight, RotateCcw } from 'lucide-react';
import { analyzeLegalDocument, chatWithSentence } from '../services/geminiService';
import { UsageMetadata, UserRole, ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';

interface DocumentAnalysisPanelProps {
    onTokenUpdate?: (metadata: UsageMetadata) => void;
    onClose?: () => void;
    onElevate?: (fullDocument: string, files: File[]) => void; // Add elevation capability
    role: UserRole;
}

export const DocumentAnalysisPanel: React.FC<DocumentAnalysisPanelProps> = ({ 
    onTokenUpdate,
    onClose,
    onElevate,
    role
}) => {
    const [files, setFiles] = useState<File[]>([]);
    const [focus, setFocus] = useState('Auditoría Integral (Hechos + Derecho)');
    const [depth, setDepth] = useState('Exhaustivo (Detallado)');
    const [outputFormat, setOutputFormat] = useState('Reporte Estructurado');
    
    const [analysisResult, setAnalysisResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Chat State
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
            e.target.value = '';
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleAnalyze = async () => {
        if (files.length === 0) return;
        setIsLoading(true);
        setAnalysisResult('');
        setChatMessages([]); 
        
        // Construct a more complex instruction based on UI
        const complexFocus = `${focus}. Profundidad: ${depth}. Formato de Salida: ${outputFormat}.`;

        try {
            const { analysis, usageMetadata } = await analyzeLegalDocument(files, complexFocus, role);
            setAnalysisResult(analysis);
            if (usageMetadata && onTokenUpdate) onTokenUpdate(usageMetadata);
        } catch (e) {
            console.error(e);
            setAnalysisResult("Error al analizar los documentos. Por favor verifica que sean legibles (PDF/Word).");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChatSend = async () => {
        if (!chatInput.trim() || !analysisResult) return;
        
        const userMsg: ChatMessage = { role: 'user', text: chatInput };
        setChatMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsChatLoading(true);

        try {
            // Context is the analysis result
            const { chatResponse } = await chatWithSentence(analysisResult, chatMessages, userMsg.text, 'chat');
            setChatMessages(prev => [...prev, { role: 'model', text: chatResponse }]);
        } catch (e) {
            setChatMessages(prev => [...prev, { role: 'model', text: "Error al procesar la consulta." }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleElevateToProject = () => {
        if (onElevate && analysisResult) {
            // Add a header to context
            const fullDoc = `||| REPORTE DE ANÁLISIS JURÍDICO (JUXA)\n\n${analysisResult}`;
            onElevate(fullDoc, files);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#050505]">
            <div className="w-full max-w-6xl mx-auto h-full flex flex-col md:flex-row gap-6 p-6 md:p-12 animate-fade-in">
                
                {/* LEFT COLUMN: CONFIGURATION (EXHAUSTIVE) */}
                <div className="flex flex-col space-y-4 w-full md:w-1/3 h-full overflow-y-auto scrollbar-hide">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
                            <FileSearch className="w-8 h-8 mr-3 text-cyan-500" />
                            JUXA ANALYTICS
                        </h2>
                        <p className="text-slate-400 text-sm">Auditoría forense y extracción de inteligencia.</p>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Expediente Fuente</label>
                         <div className="relative group border border-dashed border-slate-700 bg-[#0f0f11] rounded-xl p-6 hover:bg-white/5 transition-all cursor-pointer text-center flex flex-col items-center justify-center">
                            <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" accept=".pdf,.doc,.docx,.txt" />
                            <Upload className="w-6 h-6 text-slate-500 mb-2 group-hover:text-cyan-400 transition-colors" />
                            <div className="text-xs font-bold text-slate-300">Cargar Documentos</div>
                         </div>
                         
                         {/* File List */}
                         {files.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {files.map((f, i) => (
                                    <div key={i} className="bg-slate-800 text-[10px] px-2 py-1 rounded flex items-center border border-white/10 max-w-full">
                                        <span className="truncate text-slate-300 max-w-[150px]">{f.name}</span>
                                        <button onClick={() => removeFile(i)} className="ml-2 text-slate-500 hover:text-white"><X className="w-3 h-3"/></button>
                                    </div>
                                ))}
                            </div>
                         )}
                    </div>

                    {/* CONFIGURATION PANEL */}
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/10 pb-2">
                            <Settings className="w-3 h-3 mr-2" /> Matriz de Análisis
                        </div>
                        
                        {/* FOCUS */}
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Foco Estratégico</label>
                            <div className="relative">
                                <select 
                                    value={focus}
                                    onChange={(e) => setFocus(e.target.value)}
                                    className="w-full bg-[#151517] border border-slate-700 text-white text-xs rounded-lg p-3 outline-none appearance-none"
                                >
                                    <option>Auditoría Integral (Hechos + Derecho)</option>
                                    <option>Detección de Debilidades y Contradicciones</option>
                                    <option>Extracción de Entidades (Actor, Demandado, Fechas)</option>
                                    <option>Línea de Tiempo Fáctica (Cronología)</option>
                                    <option>Generación de Estrategia de Litigio (Teoría del Caso)</option>
                                    <option>Resumen Ejecutivo para Cliente</option>
                                </select>
                                <Target className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                            </div>
                        </div>

                        {/* DEPTH */}
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Profundidad</label>
                            <div className="relative">
                                <select 
                                    value={depth}
                                    onChange={(e) => setDepth(e.target.value)}
                                    className="w-full bg-[#151517] border border-slate-700 text-white text-xs rounded-lg p-3 outline-none appearance-none"
                                >
                                    <option>Exhaustivo (Detallado)</option>
                                    <option>Ejecutivo (Resumido)</option>
                                    <option>Técnico / Doctrinal</option>
                                    <option>Crítico / Agresivo</option>
                                </select>
                                <ShieldAlert className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                            </div>
                        </div>

                        {/* OUTPUT FORMAT */}
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Formato de Salida</label>
                            <div className="relative">
                                <select 
                                    value={outputFormat}
                                    onChange={(e) => setOutputFormat(e.target.value)}
                                    className="w-full bg-[#151517] border border-slate-700 text-white text-xs rounded-lg p-3 outline-none appearance-none"
                                >
                                    <option>Reporte Estructurado</option>
                                    <option>Lista de Puntos Clave (Bullet Points)</option>
                                    <option>Memorándum Interno</option>
                                    <option>Tabla de Hechos y Pruebas</option>
                                </select>
                                <List className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleAnalyze}
                        disabled={isLoading || files.length === 0}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
                    >
                        {isLoading ? (
                            <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full"></div>
                        ) : (
                            <>
                                <Zap className="w-5 h-5 mr-2" />
                                EJECUTAR ANÁLISIS
                            </>
                        )}
                    </button>
                    {onClose && (
                        <button onClick={onClose} className="w-full py-2 text-xs text-slate-500 hover:text-white transition-colors">
                            Cancelar / Volver
                        </button>
                    )}
                </div>

                {/* RIGHT COLUMN: RESULT & CHAT */}
                <div className="flex flex-col w-full md:w-2/3 bg-[#0f0f11] rounded-2xl border border-white/5 overflow-hidden shadow-2xl h-full">
                    <div className="p-4 border-b border-white/10 bg-[#151517] flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-400 uppercase flex items-center">
                            Resultados
                        </label>
                        {analysisResult && (
                            <div className="flex items-center space-x-3">
                                <span className="text-emerald-500 flex items-center text-[10px] font-bold px-2 py-1 bg-emerald-500/10 rounded-full">
                                    <CheckCircle className="w-3 h-3 mr-1"/> Completado
                                </span>
                                {onElevate && (
                                    <button 
                                        onClick={handleElevateToProject}
                                        className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg font-bold flex items-center transition-colors"
                                    >
                                        LLEVAR A PROYECTO <ArrowRight className="w-3 h-3 ml-1" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* ANALYSIS CONTENT */}
                    <div className="flex-1 bg-[#1a1a1d] p-8 text-sm leading-relaxed font-serif text-slate-200 overflow-y-auto relative scrollbar-hide">
                        {analysisResult ? (
                            <ReactMarkdown 
                                components={{
                                    h1: ({node, ...props}) => <h1 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2 uppercase tracking-wide" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-base font-bold text-cyan-400 mt-6 mb-3 flex items-center" {...props} />,
                                    strong: ({node, ...props}) => <strong className="text-white font-bold bg-white/5 px-1 rounded" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc ml-5 mb-4 space-y-1 text-slate-300" {...props} />,
                                    li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                    table: ({node, ...props}) => <table className="w-full text-xs border-collapse my-4" {...props} />,
                                    th: ({node, ...props}) => <th className="border border-white/10 bg-white/5 p-2 text-left font-bold text-cyan-400" {...props} />,
                                    td: ({node, ...props}) => <td className="border border-white/10 p-2" {...props} />,
                                }}
                            >
                                {analysisResult}
                            </ReactMarkdown>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-600 opacity-50">
                                <FileSearch className="w-16 h-16 mb-4" />
                                <p className="text-sm font-medium">Configura el análisis y carga documentos.</p>
                            </div>
                        )}
                    </div>

                    {/* CHAT INTERFACE (INTEGRATED AT BOTTOM) */}
                    {analysisResult && (
                        <div className="h-1/3 min-h-[200px] border-t border-white/10 bg-[#0a0a0a] flex flex-col">
                            <div className="px-4 py-2 bg-[#151517] border-b border-white/5 flex items-center justify-between">
                                <span className="text-xs font-bold text-blue-400 flex items-center"><MessageSquare className="w-3 h-3 mr-2" /> Chat con el Documento</span>
                                <span className="text-[9px] text-slate-500 uppercase tracking-wider">JUXA STRATEGIST LITE</span>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                                {chatMessages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-xl p-3 text-xs ${
                                            msg.role === 'user' 
                                            ? 'bg-blue-600 text-white rounded-br-none' 
                                            : 'bg-[#1e1e21] text-slate-300 border border-white/10 rounded-bl-none'
                                        }`}>
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                        </div>
                                    </div>
                                ))}
                                {isChatLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-[#1e1e21] p-3 rounded-xl rounded-bl-none border border-white/10">
                                            <div className="flex space-x-1"><div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-75"></div></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-3 border-t border-white/10 bg-[#151517]">
                                <div className="flex items-center space-x-2">
                                    <input 
                                        type="text" 
                                        value={chatInput} 
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                                        placeholder="Pregunta sobre detalles, riesgos o estrategias..."
                                        className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                                    />
                                    <button 
                                        onClick={handleChatSend}
                                        disabled={!chatInput || isChatLoading}
                                        className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg disabled:opacity-50"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
