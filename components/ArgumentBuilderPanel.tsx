
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, MessageSquare, Copy, Zap, PenTool, CheckCircle, Lightbulb, FileText, Upload, ChevronDown, FileCheck, X, FilePlus, Settings2,  Target, Volume2, BookOpen, Hammer, Send, RotateCcw } from 'lucide-react';
import { generateLegalArgument, refineArgument } from '../services/geminiService';
import { UsageMetadata, UserRole } from '../types';

interface ArgumentBuilderPanelProps {
    mode: 'standalone' | 'embedded';
    initialText?: string;
    onInsert?: (text: string) => void;
    onDebate?: (argument: string) => void;
    onElevate?: (fullDocument: string, files: File[]) => void;
    onTokenUpdate?: (metadata: UsageMetadata) => void;
    onClose?: () => void;
    role?: UserRole;
}

export const ArgumentBuilderPanel: React.FC<ArgumentBuilderPanelProps> = ({ 
    mode, 
    initialText, 
    onInsert, 
    onDebate, 
    onElevate,
    onTokenUpdate,
    onClose,
    role = UserRole.POSTULANTE
}) => {
    const [concept, setConcept] = useState(initialText || '');
    // Defaults updated
    const [strategy, setStrategy] = useState('Auto (Inteligente)'); 
    const [branch, setBranch] = useState('Civil / Mercantil');
    const [outputStyle, setOutputStyle] = useState('Escrito / Argumento General');
    const [tone, setTone] = useState('Jurídico Estándar');

    const [generatedArgument, setGeneratedArgument] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [refinementInput, setRefinementInput] = useState('');

    const [tokenCost, setTokenCost] = useState(0);
    const [argumentFiles, setArgumentFiles] = useState<File[]>([]);
    
    // Logic for "Elevate to Project" options
    const isAuthority = role === UserRole.JUZGADOR || role === UserRole.AUTORIDAD;
    const projectOptions = isAuthority 
        ? ["Auto de Trámite", "Sentencia Interlocutoria", "Oficio / Acuerdo", "Certificación"]
        : ["Escrito de Trámite", "Desahogo de Vista", "Recurso / Apelación", "Incidente"];
    
    const [targetDocType, setTargetDocType] = useState(projectOptions[0]);

    // Update concept if initialText changes (e.g. selection in parent)
    useEffect(() => {
        if (initialText) setConcept(initialText);
    }, [initialText]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setArgumentFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
            e.target.value = '';
        }
    };

    const removeFile = (index: number) => {
        setArgumentFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleGenerate = async () => {
        if (!concept.trim()) return;
        setIsLoading(true);
        try {
            const { argument, usageMetadata } = await generateLegalArgument(
                concept, 
                strategy, 
                branch, 
                outputStyle,
                tone,
                argumentFiles
            );
            setGeneratedArgument(argument);
            if (usageMetadata) {
                const estimated = (usageMetadata.totalTokenCount || 0);
                setTokenCost(prev => prev + estimated);
                if (onTokenUpdate) onTokenUpdate(usageMetadata);
            }
        } catch (e) {
            console.error(e);
            setGeneratedArgument("Error al generar el argumento. Inténtalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefine = async () => {
        if (!refinementInput.trim() || !generatedArgument) return;
        setIsRefining(true);
        try {
            const { argument, usageMetadata } = await refineArgument(generatedArgument, refinementInput);
            setGeneratedArgument(argument);
            setRefinementInput('');
            if (usageMetadata) {
                const estimated = (usageMetadata.totalTokenCount || 0);
                setTokenCost(prev => prev + estimated);
                if (onTokenUpdate) onTokenUpdate(usageMetadata);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsRefining(false);
        }
    };

    // SMART WRAPPING: Wrap the generated argument into a full document structure locally
    const handleElevateToProject = () => {
        if (!generatedArgument || !onElevate) return;

        let wrappedDocument = "";
        const currentDate = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

        if (isAuthority) {
            // TEMPLATE AUTORIDAD
            wrappedDocument = `
# JUZGADO DE [LUGAR O MATERIA]
## EXPEDIENTE: [NUMERO]

${currentDate}

VISTOS para resolver los autos del expediente al rubro citado, respecto a:
${concept.substring(0, 100)}...

CONSIDERANDO

ÚNICO.- ${generatedArgument}

Por lo expuesto y fundado, se

RESUELVE

PRIMERO.- Se declara PROCEDENTE lo solicitado en atención al razonamiento vertido.
SEGUNDO.- Notifíquese legalmente a las partes.

||| [NOMBRE DEL JUEZ / SECRETARIO]
||| JUEZ DE PRIMERA INSTANCIA
            `;
        } else {
            // TEMPLATE POSTULANTE
            wrappedDocument = `
# ACTOR: [NOMBRE DEL ACTOR]
# VS
# DEMANDADO: [NOMBRE DEL DEMANDADO]
# JUICIO: [TIPO DE JUICIO]
# EXPEDIENTE: [NUMERO]

## C. JUEZ DE LO [MATERIA]

**[NOMBRE DEL PROMOVENTE]**, con la personalidad debidamente reconocida en autos del expediente citado al rubro, ante Usted con el debido respeto comparezco y expongo:

Que por medio del presente escrito y con fundamento en lo dispuesto por la ley, vengo a desahogar la vista o realizar la manifestación siguiente:

HECHOS Y RAZONAMIENTOS

ÚNICO.- ${generatedArgument}

Por lo anteriormente expuesto y fundado, a Usted C. Juez, atentamente pido se sirva:

PUNTOS PETITORIOS

PRIMERO.- Tenerme por presentado en tiempo y forma el presente escrito.
SEGUNDO.- Acordar de conformidad lo solicitado por ser procedente en derecho.

||| PROTESTO LO NECESARIO
||| [Lugar], a la fecha de su presentación
||| [NOMBRE DEL ABOGADO]
            `;
        }
        
        // Clean up whitespace
        wrappedDocument = wrappedDocument.trim();
        
        onElevate(wrappedDocument, argumentFiles);
    };

    const containerClasses = mode === 'standalone' 
        ? "w-full max-w-5xl mx-auto h-full flex flex-col md:flex-row gap-6 p-6 md:p-12 animate-fade-in"
        : "w-full h-full flex flex-col bg-[#0f0f11] shadow-2xl animate-fade-in";

    return (
        <div className={mode === 'standalone' ? "bg-[#050505] min-h-screen" : "h-full flex flex-col"}>
            <div className={containerClasses}>
                
                {/* Header (Integrated) */}
                {mode === 'embedded' && (
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#151517]">
                        <h3 className="font-bold text-white flex items-center text-sm">
                            <Hammer className="w-4 h-4 mr-2 text-purple-500" />
                            JUXA CONSTRUCTOR
                        </h3>
                        {onClose && (
                            <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
                        )}
                    </div>
                )}

                {/* LEFT COLUMN: INPUT */}
                <div className={`flex flex-col space-y-4 ${mode === 'standalone' ? 'w-full md:w-1/3' : 'p-4 flex-1 overflow-y-auto'}`}>
                    {mode === 'standalone' && (
                        <div className="mb-4">
                            <h2 className="text-3xl font-bold text-white mb-2">JUXA CONSTRUCTOR</h2>
                            <p className="text-slate-400 text-sm">Ingeniería de argumentos jurídicos formales.</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Concepto o Hecho</label>
                        <textarea 
                            value={concept}
                            onChange={(e) => setConcept(e.target.value)}
                            placeholder="Ej. 'No me pagaron la renta y el contrato venció hace dos meses...'"
                            className="w-full h-32 bg-[#151517] border border-slate-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none placeholder:text-slate-600"
                        />
                    </div>
                    
                    {/* File Upload Mini */}
                    <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Evidencia / Contexto (Opcional)</label>
                         <div className="flex gap-2 mb-2 flex-wrap">
                            {argumentFiles.map((f, i) => (
                                <div key={i} className="bg-slate-800 text-xs px-2 py-1 rounded flex items-center border border-white/10 max-w-full">
                                    <span className="truncate max-w-[100px] text-slate-300">{f.name}</span>
                                    <button onClick={() => removeFile(i)} className="ml-2 text-slate-500 hover:text-white"><X className="w-3 h-3"/></button>
                                </div>
                            ))}
                         </div>
                         <div className="relative group border border-dashed border-slate-700 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer text-center">
                            <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                            <div className="flex items-center justify-center text-xs text-slate-400">
                                <FilePlus className="w-4 h-4 mr-2" /> Agregar Archivos de Soporte
                            </div>
                         </div>
                    </div>

                    {/* CONFIGURATION GRID */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            <Settings2 className="w-3 h-3 mr-2" /> Configuración Avanzada
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* ESTILO DE SALIDA */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Estilo de Salida</label>
                                <div className="relative">
                                    <select 
                                        value={outputStyle}
                                        onChange={(e) => setOutputStyle(e.target.value)}
                                        className="w-full bg-[#151517] border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none appearance-none"
                                    >
                                        <option>Escrito / Argumento General</option>
                                        <option>Agravio (Apelación / Recurso)</option>
                                        <option>Concepto de Violación (Amparo)</option>
                                        <option>Concepto de Impugnación (Administrativo)</option>
                                        <option>Resolución / Consideración (Autoridad)</option>
                                    </select>
                                    <BookOpen className="absolute right-3 top-2.5 w-3 h-3 text-slate-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* ESTRATEGIA */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Estrategia</label>
                                <div className="relative">
                                    <select 
                                        value={strategy}
                                        onChange={(e) => setStrategy(e.target.value)}
                                        className="w-full bg-[#151517] border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none appearance-none"
                                    >
                                        <option>Auto (Inteligente)</option>
                                        <option>Ofensiva (Contundente)</option>
                                        <option>Defensiva (Protectora)</option>
                                        <option>Negociadora (Conciliadora)</option>
                                        <option>Interpretativa (Doctrinal)</option>
                                    </select>
                                    <Target className="absolute right-3 top-2.5 w-3 h-3 text-slate-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* TONO / OPTIMIZACION */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Tono / Optimización</label>
                                <div className="relative">
                                    <select 
                                        value={tone}
                                        onChange={(e) => setTone(e.target.value)}
                                        className="w-full bg-[#151517] border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none appearance-none"
                                    >
                                        <option>Jurídico Estándar</option>
                                        <option>Agresivo / Contundente</option>
                                        <option>Solemne / Institucional</option>
                                        <option>Conciliador / Suave</option>
                                        <option>Académico / Doctrinal</option>
                                        <option>Narrativo / Persuasivo</option>
                                        <option>Técnico / Procesalista</option>
                                    </select>
                                    <Volume2 className="absolute right-3 top-2.5 w-3 h-3 text-slate-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* RAMA */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Rama</label>
                                <select 
                                    value={branch}
                                    onChange={(e) => setBranch(e.target.value)}
                                    className="w-full bg-[#151517] border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none"
                                >
                                    <option>Civil / Mercantil</option>
                                    <option>Penal (Acusatorio)</option>
                                    <option>Laboral</option>
                                    <option>Administrativo</option>
                                    <option>Constitucional / Amparo</option>
                                    <option>Familiar</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={isLoading || !concept}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {isLoading ? (
                            <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full"></div>
                        ) : (
                            <>
                                <Zap className="w-4 h-4 mr-2" />
                                GENERAR ARGUMENTO
                            </>
                        )}
                    </button>
                    {tokenCost > 0 && (
                        <p className="text-[10px] text-center text-slate-500 mt-2">
                            Costo estimado: <span className="text-purple-400 font-bold">~{tokenCost * 4} Tokens</span>
                        </p>
                    )}
                </div>

                {/* RIGHT COLUMN: OUTPUT */}
                <div className={`flex flex-col ${mode === 'standalone' ? 'w-full md:w-2/3 bg-[#0f0f11] rounded-2xl border border-white/5 p-6' : 'p-4 border-t border-white/10 bg-black/20 flex-1'}`}>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center justify-between">
                        <span>Resultado Jurídico</span>
                        {generatedArgument && (
                            <span className="text-emerald-500 flex items-center text-[10px]"><CheckCircle className="w-3 h-3 mr-1"/> Generado</span>
                        )}
                    </label>
                    
                    <div className="flex-1 bg-[#1a1a1d] rounded-xl border border-white/10 border-l-4 border-l-emerald-600/50 p-6 text-sm leading-relaxed font-serif text-slate-200 overflow-y-auto min-h-[300px] shadow-2xl relative flex flex-col">
                        <div className="flex-1 whitespace-pre-wrap">
                            {generatedArgument ? generatedArgument : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-600 opacity-50">
                                    <Sparkles className="w-8 h-8 mb-2" />
                                    <p className="text-xs">El argumento generado aparecerá aquí.</p>
                                </div>
                            )}
                        </div>
                        
                        {/* REFINEMENT CHAT INPUT (INSIDE RESULT) */}
                        {generatedArgument && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <div className="relative flex items-center">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                        {isRefining ? <div className="animate-spin w-4 h-4 border-2 border-slate-500/30 border-t-slate-500 rounded-full"/> : <RotateCcw className="w-4 h-4" />}
                                    </div>
                                    <input 
                                        type="text" 
                                        value={refinementInput} 
                                        onChange={(e) => setRefinementInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                                        disabled={isRefining}
                                        placeholder="Refinar con IA (ej. 'Hazlo más agresivo', 'Cita al Art. 16')..."
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-10 pr-10 text-xs text-white focus:border-purple-500 outline-none placeholder:text-slate-600"
                                    />
                                    <button 
                                        onClick={handleRefine}
                                        disabled={isRefining || !refinementInput}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white disabled:opacity-30"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {generatedArgument && (
                        <div className="mt-4 space-y-3">
                            <div className={`grid ${mode === 'standalone' ? 'grid-cols-2' : 'grid-cols-2'} gap-3`}>
                                {onInsert && (
                                    <button 
                                        onClick={() => onInsert(generatedArgument)}
                                        className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 py-2 rounded-lg text-xs font-bold flex items-center justify-center transition-colors"
                                    >
                                        <PenTool className="w-3 h-3 mr-2" />
                                        {mode === 'standalone' ? 'Copiar Texto' : 'Insertar en Cursor'}
                                    </button>
                                )}
                                
                                {onDebate && (
                                    <button 
                                        onClick={() => onDebate(generatedArgument)}
                                        className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 py-2 rounded-lg text-xs font-bold flex items-center justify-center transition-colors"
                                    >
                                        <MessageSquare className="w-3 h-3 mr-2" />
                                        Debatir (Co-Pilot)
                                    </button>
                                )}
                            </div>

                            {/* ELEVATION BUTTON (Primary Action) */}
                            {onElevate && (
                                <div className="pt-3 border-t border-white/10 flex gap-2">
                                     <div className="relative flex-1">
                                        <select 
                                            value={targetDocType}
                                            onChange={(e) => setTargetDocType(e.target.value)}
                                            className="w-full bg-[#151517] border border-slate-700 text-white text-xs rounded-l-lg p-2.5 outline-none appearance-none h-full"
                                        >
                                            {projectOptions.map(opt => <option key={opt}>{opt}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
                                     </div>
                                     <button 
                                        onClick={handleElevateToProject}
                                        className={`flex-[2] py-2.5 rounded-r-lg text-xs font-bold flex items-center justify-center transition-all text-white shadow-lg ${isAuthority ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                                     >
                                        <FileText className="w-4 h-4 mr-2" />
                                        {isAuthority ? 'GENERAR RESOLUCIÓN' : 'CREAR ESCRITO / PROMOCIÓN'}
                                     </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
