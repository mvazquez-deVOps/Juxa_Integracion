import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { DocumentPreview } from './components/DocumentPreview';
import { AppsGrid } from './components/AppsGrid';
import { ChatInterface } from './components/ChatInterface';
import { ArgumentBuilderPanel } from './components/ArgumentBuilderPanel';
import { DocumentAnalysisPanel } from './components/DocumentAnalysisPanel';
import { SentenceGeneratorPanel } from './components/SentenceGeneratorPanel';
import { generateSentence, digitizeDocument } from './services/geminiService';
import { SentenceResponse, GenerationState, UserRole, UsageMetadata, AppMode, LegalMatter } from './types';
import { Cpu, MessageSquare, FileText, Wand2, ArrowRight, LayoutTemplate, Grid, Command, PenTool, FilePlus, Building2, Sparkles, GripVertical, Upload, Bot, Zap, FolderOpen, Briefcase, BrainCircuit, Fingerprint, Layers, ChevronRight, DollarSign } from 'lucide-react';
import { Landing } from './components/Landing';
import { ChatArea } from './components/ChatArea';
import { ChatInput } from './components/ChatInput';
import { RoleSelection } from './components/RoleSelection';
import { AuthView } from './components/AuthView';
import { Message } from './types';

// === PRICING ENGINE CONSTANTS ===
// Base Google Cost per 1K Tokens (Approximate Blended)
const PRICE_FLASH_INPUT = 0.0001;
const PRICE_FLASH_OUTPUT = 0.0004;
const PRICE_PRO_INPUT = 0.0025;
const PRICE_PRO_OUTPUT = 0.0100;

// MARKUP MULTIPLIER (6x Profit Margin)
const JUXA_MARKUP = 6;

function App() {
    // === ESTADOS DE AUTENTICACIÓN (NUEVOS) ===
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [chatMessages, setChatMessages] = useState<Message[]>([]);

    // === ESTADOS ORIGINALES DE TU APP ===
    const [appMode, setAppMode] = useState<AppMode>(AppMode.LANDING);
    const [state, setState] = useState<GenerationState & { loadingMessage?: string }>({
        isLoading: false,
        error: null,
        result: null,
    });

    const [currentFiles, setCurrentFiles] = useState<File[]>([]);
    const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
    const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.POSTULANTE);

    // TRACKING
    const [totalTokens, setTotalTokens] = useState<number>(0);
    const [totalCost, setTotalCost] = useState<number>(0);

    const [selectedRole, setSelectedRole] = useState<string | null>(null);



    const [initialActiveTab, setInitialActiveTab] = useState<'project' | 'analytics' | 'semantic' | 'ratio' | 'visualization' | undefined>(undefined);
    const [isSplitView, setIsSplitView] = useState(false);
    const [commandInput, setCommandInput] = useState('');

    // Ref for hidden file input in Blank Mode
    const blankFileInputRef = useRef<HTMLInputElement>(null);

    // --- RESIZABLE SIDEBAR LOGIC ---
    const [sidebarWidth, setSidebarWidth] = useState(400); // Initial width
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const handleStartOriginalFlow = () => {
        setAppMode(AppMode.ROLES);
    };

    const handleRoleSelection = (role: string) => {
        setSelectedRole(role as any);
        setAppMode(AppMode.CHAT);
        if (chatMessages.length === 0) {
    setChatMessages([{
      id: '1',
      role: 'assistant',
      content: `Hola, he configurado tu perfil como ${role}. ¿En qué puedo ayudarte hoy?`,
      timestamp: new Date()
    }]);
  }
    };

    const startResizing = (e: React.MouseEvent) => {
        setIsResizing(true);
        e.preventDefault();
    };

    const stopResizing = () => {
        setIsResizing(false);
    };

    const resize = (e: MouseEvent) => {
        if (isResizing) {
            const newWidth = e.clientX;
            if (newWidth > 250 && newWidth < 800) { // Min and Max width constraints
                setSidebarWidth(newWidth);
            }
        }
    };

    // Efecto para escuchar el mouse en toda la ventana
    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing]);

    // === EFECTOS ===

    // 1. Efecto de Autenticación
    useEffect(() => {
        const savedUser = localStorage.getItem('juxa_user_data');
        const token = localStorage.getItem('juxa_token');

        if (savedUser && token) {
            try {
                setUser(JSON.parse(savedUser));
                setIsAuthenticated(true);
            } catch (e) {
                localStorage.clear();
            }
        }
        setIsCheckingSession(false);
    }, []);

    // === FUNCIONES DE LOGICA DE AUTENTICACIÓN ===
    const handleAuthNavigate = (view: string, profile?: any, userData?: any) => {
        if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
            setAppMode(AppMode.LANDING);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        setIsAuthenticated(false);
        setUser(null);
        setAppMode(AppMode.LANDING);
    };

    // === FUNCIONES ORIGINALES DE TU APP ===
    const updateTokens = (metadata: UsageMetadata | undefined) => {
        if (metadata) {
            const realTokens = metadata.totalTokenCount || 0;
            setTotalTokens(prev => prev + realTokens);
            const model = metadata.model || 'gemini-3-flash-preview';
            const isPro = model.includes('pro');
            const pInput = isPro ? PRICE_PRO_INPUT : PRICE_FLASH_INPUT;
            const pOutput = isPro ? PRICE_PRO_OUTPUT : PRICE_FLASH_OUTPUT;
            const inputCost = (metadata.promptTokenCount / 1000) * pInput;
            const outputCost = (metadata.candidatesTokenCount / 1000) * pOutput;
            const baseCost = inputCost + outputCost;
            const juxaPrice = baseCost * JUXA_MARKUP;
            setTotalCost(prev => prev + juxaPrice);
        }
    };

    const handleGenerate = async (notes: string, documentType: string, files: File[]) => {
        setState(prev => ({ ...prev, isLoading: true, error: null, loadingMessage: "Analizando expediente..." }));

        try {
            const response: SentenceResponse = await generateSentence({
                judgeNotes: notes,
                caseFiles: files,
                role: currentRole,
                documentType: documentType
            });

            if (response.usageMetadata) {
                updateTokens(response.usageMetadata);
            }

            setState({
                isLoading: false,
                error: null,
                result: response,
            });

            setIsSplitView(false);
        } catch (error: any) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.message || "Ocurrió un error inesperado.",
            }));
        }
    };

    // --- LOGICA DE COMANDOS INTELIGENTES ---
    const handleCommandSubmit = () => {
        const cmd = commandInput.toLowerCase();
        if (cmd.includes('chat')) { setAppMode(AppMode.CHAT); return; }
        if (cmd.includes('apps')) { setAppMode(AppMode.APPS); return; }
        if (cmd.includes('generar')) { setAppMode(AppMode.GENERATOR); return; }
        startCanvasMode(true, commandInput);
    };

    const startCanvasMode = (withAssistant: boolean, initialTopic: string = "") => {
        let cleanTopic = initialTopic;
        if (cleanTopic.toLowerCase().includes("abrir") || cleanTopic.toLowerCase().includes("lienzo")) {
            cleanTopic = "";
        }

        const initialText = cleanTopic
            ? `||| BORRADOR INICIAL: ${cleanTopic.toUpperCase()}\n\n...`
            : "||| NUEVO DOCUMENTO\n\nComienza a redactar tu proyecto jurídico...";

        setState({
            isLoading: false,
            error: null,
            result: {
                text: initialText,
                matterDetected: LegalMatter.UNKNOWN,
                ratioDecidendi: "",
            }
        });

        setInitialActiveTab(withAssistant ? 'analytics' : 'project');
        setIsSplitView(withAssistant);
        setAppMode(AppMode.EDITOR);
    };

    const handleBlankFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            // 1. CAMBIO VISUAL INMEDIATO
            setAppMode(AppMode.EDITOR);
            setState({
                isLoading: true,
                error: null,
                result: null,
                loadingMessage: `Procesando ${file.name}...`
            });

            try {
                // 2. Digitize (Ahora instantáneo para DOCX/TXT)
                const { text, usageMetadata } = await digitizeDocument(file);
                updateTokens(usageMetadata);

                // 3. Setup state
                setCurrentFiles([file]);
                setActiveFileIndex(0);

                setState({
                    isLoading: false,
                    error: null,
                    result: {
                        text: text,
                        matterDetected: LegalMatter.UNKNOWN,
                        ratioDecidendi: ""
                    }
                });

                // 4. Configure View
                setIsSplitView(true);
                setInitialActiveTab('project');

            } catch (error: any) {
                console.error("Error upload", error);
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: "No se pudo cargar el archivo: " + error.message
                }));
            } finally {
                if (blankFileInputRef.current) blankFileInputRef.current.value = '';
            }
        }
    };

    const startGeneratorMode = () => {
        setIsSplitView(false);
        setAppMode(AppMode.GENERATOR);
    };

    const startEnterpriseMode = () => {
        alert("🔒 JUXA ENTERPRISE\n\nEste módulo está reservado para implementaciones corporativas con conexión a API de Tribunal Virtual y gestión de usuarios.\n\nContacte a ventas@juxa.ai");
    };

    // HANDLER FOR STANDALONE APPS (CONSTRUCTOR/ANALYSIS) -> EDITOR PIPELINE
    const handleElevateFromStandalone = (fullDocument: string, files: File[]) => {
        // 1. Set result data
        setState({
            isLoading: false,
            error: null,
            result: {
                text: fullDocument,
                matterDetected: LegalMatter.UNKNOWN,
                ratioDecidendi: "",
                source: 'AI'
            }
        });

        // 2. Pass files if any
        if (files.length > 0) {
            setCurrentFiles(files);
            setActiveFileIndex(0);
        }

        // 3. Switch to Editor in SPLIT MODE with STRATEGIST ACTIVE
        setAppMode(AppMode.EDITOR);

        // CRITICAL: We want Strategist to be open instantly to "continue" the thought process
        setInitialActiveTab('analytics');
        setIsSplitView(true);
    };

    // === PROTECCIÓN DE RUTAS (GUARDS) ===
    // Esto asegura que el login aparezca primero

    if (isCheckingSession) {
        return <div className="h-screen bg-[#050505] flex items-center justify-center"></div>;
    }

    if (!isAuthenticated) {
        return <AuthView onNavigate={handleAuthNavigate} />;
    }

    // === COMPONENTES INTERNOS ORIGINALES ===

    const LandingPage = ({ onNavigate, onStartGeneral }: { onNavigate: (mode: AppMode) => void, onStartGeneral: () => void }) => (
        <div className="flex-1 flex flex-col items-center justify-start p-8 relative overflow-y-auto scrollbar-hide">
            {/* Background Ambient */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative z-10 max-w-6xl w-full flex flex-col items-center space-y-12 animate-fade-in-up pb-20">

                {/* Header Title */}
                <div className="text-center space-y-3 mt-8">
                    <h1 className="text-7xl md:text-8xl font-black tracking-tighter drop-shadow-2xl">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">JUXA</span>
                    </h1>
                    <p className="text-sm md:text-base text-slate-500 font-medium tracking-[0.5em] uppercase">
                        Sistema Operativo Legal
                    </p>
                </div>

                {/* SECCIÓN 1: JUXA AI (ENGAGEMENT VISUAL) */}
                <div
                    onClick={() => setAppMode(AppMode.CHAT)}
                    className="w-full max-w-xl group cursor-pointer relative transform transition-all hover:scale-[1.02]"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 via-blue-500/30 to-purple-500/30 rounded-[2rem] blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative bg-[#0a0a0c] border border-white/10 p-10 rounded-[2rem] shadow-2xl flex flex-col items-center text-center overflow-hidden">

                        {/* Neural Orb Icon */}
                        <div className="relative w-24 h-24 mb-8">
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400 to-blue-600 rounded-full animate-pulse-slow blur-md opacity-50"></div>
                            <div className="absolute inset-1 bg-black rounded-full z-10"></div>
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <BrainCircuit className="w-12 h-12 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                            </div>
                            {/* Orbit Ring */}
                            <div className="absolute -inset-2 border border-white/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">JUXA AI</h2>
                        <p className="text-slate-400 leading-relaxed text-sm max-w-sm mx-auto">
                            Inteligencia Artificial Generativa especializada en razonamiento jurídico complejo.
                        </p>

                        <div className="mt-8">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Evita que se dispare dos veces
                                    onStartGeneral();
                                }}
                                className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full font-black text-white hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 pointer-events-auto"
                            >
                                INICIAR
                            </button>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN 2: DOCK DE ESCRITURA (UNIFICADO) */}
                <div className="w-full max-w-5xl">
                    <div className="relative bg-[#0f0f11]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-2 md:p-3 shadow-2xl">
                        {/* Floating Label */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#050505] px-4 py-0.5 rounded-full border border-white/10 text-[10px] font-bold text-slate-500 uppercase tracking-widest z-20">
                            Suite de Escritura
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">

                            {/* EDITOR UNIVERSAL - RENAMED TO EDITOR */}
                            <div className="group relative bg-[#151517] hover:bg-[#1a1a1d] rounded-2xl p-6 transition-all cursor-default border border-transparent hover:border-white/5 overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <FileText className="w-24 h-24 text-slate-500 -rotate-12" />
                                </div>
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center mb-4 text-slate-200 group-hover:text-white group-hover:bg-slate-700 transition-colors">
                                        <PenTool className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1">Editor</h3>
                                    <p className="text-xs text-slate-500 mb-6">Iniciar desde una plantilla.</p>
                                    <div className="mt-auto flex gap-2">
                                        <button onClick={() => blankFileInputRef.current?.click()} className="w-full bg-blue-500/10 hover:bg-blue-500/20 py-2 rounded-lg text-[10px] font-bold text-blue-400 transition-colors border border-blue-500/20 flex items-center justify-center"><Upload className="w-3 h-3 mr-1" /> SUBIR</button>
                                    </div>
                                    <input type="file" ref={blankFileInputRef} accept=".pdf,.doc,.docx,.txt,.rtf,.md" className="hidden" onChange={handleBlankFileSelect} />
                                </div>
                            </div>

                            {/* CO-PILOT */}
                            <div onClick={() => startCanvasMode(true)} className="group relative bg-[#151517] hover:bg-[#1a1a1d] rounded-2xl p-6 transition-all cursor-pointer border border-transparent hover:border-blue-500/20">
                                <div className="absolute top-4 right-4 bg-blue-500/20 text-blue-300 text-[9px] font-bold px-2 py-0.5 rounded border border-blue-500/30 uppercase">Split View</div>
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="w-10 h-10 rounded-lg bg-blue-900/20 flex items-center justify-center mb-4 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <LayoutTemplate className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1">Co-Pilot</h3>
                                    <p className="text-xs text-slate-500 mb-4">Asistencia estratégica en tiempo real.</p>
                                    <div className="mt-auto flex items-center text-blue-500 text-xs font-bold group-hover:text-blue-300 transition-colors">
                                        ABRIR <ChevronRight className="w-3 h-3 ml-1" />
                                    </div>
                                </div>
                            </div>

                            {/* GENERADOR */}
                            <div onClick={startGeneratorMode} className="group relative bg-[#151517] hover:bg-[#1a1a1d] rounded-2xl p-6 transition-all cursor-pointer border border-transparent hover:border-purple-500/20">
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="w-10 h-10 rounded-lg bg-purple-900/20 flex items-center justify-center mb-4 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                        <Wand2 className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1">Generador</h3>
                                    <p className="text-xs text-slate-500 mb-4">Creación automática basada en expedientes.</p>
                                    <div className="mt-auto flex items-center text-purple-500 text-xs font-bold group-hover:text-purple-300 transition-colors">
                                        ACCEDER <ChevronRight className="w-3 h-3 ml-1" />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* SECCIÓN 3: APPS (ICONOS PREMIUM) - Solo Apps, sin Empresa */}
                <div className="w-full max-w-3xl flex justify-center">
                    {/* APPS GRID */}
                    <div
                        onClick={() => setAppMode(AppMode.APPS)}
                        className="relative overflow-hidden bg-[#0f0f11] border border-white/10 p-5 rounded-2xl hover:border-white/30 transition-all cursor-pointer group w-full md:w-1/2"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity opacity-50 group-hover:opacity-100"></div>
                        <div className="flex items-center space-x-5 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                                <Grid className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-base">Apps & Herramientas</h3>
                                <p className="text-xs text-slate-400 mt-1">Calculadoras, Buscadores y Utilidades.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-[#050505] text-white">
            {/* 1. HEADER - Protegido contra el crash de 'null' */}
            <Header
                currentRole={(selectedRole || "Invitado") as any}
                onRoleChange={setSelectedRole}
                onGoHome={() => setAppMode(AppMode.LANDING)}
                showHomeButton={appMode !== AppMode.LANDING}
            />

            <main className="flex-1 flex overflow-hidden relative"
                onMouseMove={(e: any) => isResizing && resize(e)}
                onMouseUp={stopResizing}
            >
                {/* --- FLUJO PRINCIPAL --- */}
                {appMode === AppMode.LANDING && (
                    <LandingPage
                        onNavigate={() => setAppMode(AppMode.ROLES)}
                        onStartGeneral={() => setAppMode(AppMode.ROLES)}
                    />
                )}

                {appMode === AppMode.ROLES && (
                    <div className="flex-1 h-full overflow-y-auto bg-black animate-fade-in">
                        <RoleSelection onRoleSelect={handleRoleSelection} />
                    </div>
                )}

                {appMode === AppMode.CHAT && (
                    <div className="flex-1 h-full bg-[#050505]">
                        <ChatArea
                            selectedRole={selectedRole}
                            onTokenUpdate={updateTokens}
                            messages={chatMessages}
                            setMessages={setChatMessages}
                        />
                    </div>
                )}

                {appMode === AppMode.GENERATOR && (
                    <>
                        <div
                            ref={sidebarRef}
                            className="h-full z-10 relative flex-shrink-0 border-r border-white/5"
                            style={{ width: sidebarWidth }}
                        >
                            <InputSection
                                onGenerate={handleGenerate}
                                onFileSelect={setCurrentFiles}
                                isLoading={state.isLoading}
                                currentRole={selectedRole || "Invitado" as any}
                                activeFileIndex={activeFileIndex}
                                onActiveFileChange={setActiveFileIndex}
                            />
                            <div onMouseDown={startResizing} className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-blue-500/50 z-50 flex items-center justify-center group">
                                <div className="h-8 w-1 bg-slate-700 rounded group-hover:bg-blue-400 transition-colors"></div>
                            </div>
                        </div>
                        <div className="flex-1 h-full min-w-0">
                            <DocumentPreview
                                data={state.result}
                                isLoading={state.isLoading}
                                loadingMessage={state.loadingMessage}
                                uploadedFiles={currentFiles}
                                onTokenUpdate={updateTokens}
                                activeFileIndex={activeFileIndex}
                                onActiveFileChange={setActiveFileIndex}
                                currentRole={selectedRole || "Invitado" as any}
                            />
                        </div>
                    </>
                )}

                {/* E. MODO EDITOR (Pantalla completa de edición) */}
                {appMode === AppMode.EDITOR && (
                    <div className="flex-1 h-full relative print:h-auto print:overflow-visible">
                        <DocumentPreview
                            data={state.result}
                            isLoading={state.isLoading}
                            loadingMessage={state.loadingMessage}
                            uploadedFiles={currentFiles}
                            onTokenUpdate={updateTokens}
                            activeFileIndex={activeFileIndex}
                            onActiveFileChange={setActiveFileIndex}
                            currentRole={selectedRole || "Invitado" as any}
                            initialActiveTab={initialActiveTab}
                            forceSplitView={isSplitView}
                        />
                    </div>
                )}

                {/* F. TUS HERRAMIENTAS STANDALONE (Argument Builder, etc.) */}
                {appMode === AppMode.ARGUMENT_BUILDER && (
                    <div className="flex-1 h-full relative overflow-y-auto">
                        <ArgumentBuilderPanel
                            mode="standalone"
                            onTokenUpdate={updateTokens}
                            onElevate={handleElevateFromStandalone}
                            role={selectedRole || "Invitado" as any}
                        />
                    </div>
                )}

                {/* G. GRID DE APPS */}
                {appMode === AppMode.APPS && (
                    <div className="flex-1 h-full">
                        <AppsGrid
                            onNavigate={(mode) => setAppMode(mode)}
                            onAction={(cost) => setTotalCost(prev => prev + (cost * 0.0001 * JUXA_MARKUP))}
                        />
                    </div>
                )}
            </main>

            {/* FOOTER - Tu footer completo */}
            <div className="bg-[#050505] text-slate-600 text-[10px] p-2 flex justify-between items-center px-4 border-t border-white/5 uppercase tracking-widest font-bold print:hidden">
                <div className="flex items-center gap-4">
                    <span className="cursor-pointer hover:text-white transition-colors" onClick={() => setAppMode(AppMode.LANDING)}>
                        JUXA • 2026 • MODO: {selectedRole || 'SIN ROL'} • {user?.name || ''}
                    </span>
                    <button onClick={handleLogout} className="text-red-500/80 hover:text-red-400 font-bold transition-colors">
                        Cerrar Sesión
                    </button>
                </div>
                <div className="flex items-center space-x-6">
                    <span className="flex items-center text-slate-500">
                        TOKENS: {totalTokens.toLocaleString()}
                    </span>
                    <span className="flex items-center text-emerald-600">
                        COSTO: ${totalCost.toFixed(4)} USD
                    </span>
                </div>
            </div>
        </div>
    );
};

export default App;