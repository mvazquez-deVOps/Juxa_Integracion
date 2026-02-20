
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, ChevronLeft, ChevronRight, FileDown, Edit3, Eye, SplitSquareHorizontal, MessageSquare, AlertTriangle, Send, X, FileText, Sparkles, Wand2, ExternalLink, Scale, BookOpen, RefreshCw, Maximize2, Minimize2, Briefcase, BrainCircuit, Info, ShieldCheck, PenTool, Printer, Network, Radar, Paperclip, Download, Lightbulb, Hammer, ChevronDown, Bold, Italic, AlignLeft, AlignCenter, AlignJustify, List, Type, Undo, Redo, FileUp, Plus, Calendar, PenLine, Save, MoreHorizontal, FilePlus, MousePointerClick, Scissors, Clipboard, ArrowRightCircle, Search, FileSearch, ShieldAlert } from 'lucide-react';
import { SentenceResponse, LegalMatter, ChatMessage, UsageMetadata, LegislativeCitation, UserRole } from '../types';
import { chatWithSentence, magicEditSentence, analyzeLegislation, generateRatioDecidendi, generateArgumentGraph, digitizeDocument, performDeepDocumentAnalysis } from '../services/geminiService';

declare var html2pdf: any;

interface DocumentPreviewProps {
  data: SentenceResponse | null;
  isLoading: boolean;
  loadingMessage?: string;
  uploadedFiles: File[];
  onTokenUpdate?: (metadata: UsageMetadata) => void;
  activeFileIndex?: number;
  onActiveFileChange?: (index: number) => void;
  currentRole?: UserRole;
  initialActiveTab?: 'project' | 'analytics' | 'semantic' | 'ratio' | 'visualization' | 'analysis';
  forceSplitView?: boolean;
}

const CHARS_PER_PAGE = 3000;
const MIN_CHARS_FOR_SMART_ANALYSIS = 300; // Threshold for smart triggering to save tokens

const LOADING_PHRASES = [
  "Buscando jurisprudencia que no se contradiga a sí misma...",
  "Calculando intereses moratorios con ábaco...",
  "Intentando descifrar la letra del Secretario de Acuerdos...",
  "Convenciendo al Juez de que lea todo el expediente...",
  "Redactando con más latinismos que Cicerón...",
  "Esperando a que el sistema no se caiga (otra vez)...",
  "Buscando al testigo estrella que se fue de vacaciones...",
  "Argumentando la excepción de 'no tengo dinero'...",
  "Haciendo control difuso de convencionalidad...",
  "Contando los días para que caduque la instancia...",
  "Tratando de entender la reforma judicial..."
];

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ 
    data, 
    isLoading, 
    loadingMessage,
    uploadedFiles, 
    onTokenUpdate,
    activeFileIndex = 0,
    onActiveFileChange,
    currentRole = UserRole.POSTULANTE,
    initialActiveTab = 'analytics', 
    forceSplitView = false
}) => {
  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editableText, setEditableText] = useState('');
  const [showPlainTextView, setShowPlainTextView] = useState(false);
  
  // States for View Modes
  const [activeTab, setActiveTab] = useState<'project' | 'analytics' | 'semantic' | 'ratio' | 'visualization' | 'analysis'>('analytics');
  
  // States for Ratio & Legislation
  const [ratioContent, setRatioContent] = useState('');
  const [isRatioLoading, setIsRatioLoading] = useState(false);
  
  const [semanticData, setSemanticData] = useState<LegislativeCitation[]>([]);
  const [isSemanticLoading, setIsSemanticLoading] = useState(false);

  // States for Deep Analysis
  const [analysisContent, setAnalysisContent] = useState('');
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [customAnalysisPrompt, setCustomAnalysisPrompt] = useState('');

  // Magic Edit State
  const [selection, setSelection] = useState<{start: number, end: number, text: string} | null>(null);
  const [showMagicInput, setShowMagicInput] = useState(false);
  const [magicInstruction, setMagicInstruction] = useState('');
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{x: number, y: number} | null>(null);
  
  // Hidden file input ref for "Open" menu option
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Ref for Chat file input
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  // Menu States
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Loading State
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingPhrase, setLoadingPhrase] = useState(LOADING_PHRASES[0]);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatFiles, setChatFiles] = useState<File[]>([]); 
  const [activeChatMode, setActiveChatMode] = useState<'consultation' | 'construction'>('consultation');

  // History State for Undo/Redo (Simple implementation)
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const isSplitMode = true; 

  // --- AUTO-FEED LOGIC ---
  useEffect(() => {
    if (data?.text) {
      updateTextWithHistory(data.text);
      setRatioContent(data.ratioDecidendi || '');
      setSemanticData([]);
      setIsEditing(true);
    }
  }, [data]);

  // --- HISTORY MANAGEMENT ---
  const updateTextWithHistory = (newText: string) => {
      setEditableText(newText);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newText);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
      if (historyIndex > 0) {
          setHistoryIndex(prev => prev - 1);
          setEditableText(history[historyIndex - 1]);
      }
  };

  const handleRedo = () => {
      if (historyIndex < history.length - 1) {
          setHistoryIndex(prev => prev + 1);
          setEditableText(history[historyIndex + 1]);
      }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setEditableText(e.target.value);
      // Debounce history update could be added here for performance
  };

  const saveSnapshot = () => {
      // Autosave simulation: ensure state is synced
      updateTextWithHistory(editableText);
  };

  // --- LAZY LOADING EFFECTS (SMART TRIGGER) ---
  useEffect(() => {
      const cleanText = editableText.trim();
      // Only trigger if text is substantial enough
      if (activeTab === 'ratio' && !ratioContent && !isRatioLoading && cleanText.length > MIN_CHARS_FOR_SMART_ANALYSIS) {
          handleRatioGeneration();
      }
  }, [activeTab, ratioContent, editableText]);

  useEffect(() => {
      const cleanText = editableText.trim();
      // Only trigger if text is substantial enough
      if (activeTab === 'semantic' && semanticData.length === 0 && !isSemanticLoading && cleanText.length > MIN_CHARS_FOR_SMART_ANALYSIS) {
          handleSemanticAnalysis();
      }
  }, [activeTab, semanticData, editableText]);

  useEffect(() => {
      if (initialActiveTab && initialActiveTab !== 'project') {
          setActiveTab(initialActiveTab);
      }
  }, [initialActiveTab]);

  useEffect(() => {
      if (isLoading) {
          setLoadingProgress(0);
          setLoadingPhrase(loadingMessage || LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]);
          const progressInterval = setInterval(() => {
              setLoadingProgress(prev => {
                  if (prev >= 95) return 95; 
                  const increment = Math.random() * 5; 
                  return Math.min(prev + increment, 95);
              });
          }, 300);
          return () => clearInterval(progressInterval);
      } else {
          setLoadingProgress(100);
      }
  }, [isLoading, loadingMessage]);

  useEffect(() => {
    if (editableText) {
      const splitTextIntoPages = (text: string) => {
        const paragraphs = text.split('\n');
        const newPages: string[] = [];
        let currentAccumulator = '';
        paragraphs.forEach((para) => {
          if ((currentAccumulator.length + para.length > CHARS_PER_PAGE) && currentAccumulator.length > 0) {
            newPages.push(currentAccumulator);
            currentAccumulator = para + '\n';
          } else {
            currentAccumulator += para + '\n';
          }
        });
        if (currentAccumulator.length > 0) newPages.push(currentAccumulator);
        return newPages;
      };
      const textPages = splitTextIntoPages(editableText);
      setPages(textPages);
      setCurrentPage(prev => Math.min(prev, Math.max(0, textPages.length))); 
    } else {
      setPages([]);
    }
  }, [editableText]);

  // --- API HANDLERS ---
  const handleOpenFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          setActiveMenu(null); // Close menu
          try {
              const { text } = await digitizeDocument(file);
              updateTextWithHistory(text);
          } catch (error: any) {
              alert("Error al abrir archivo: " + error.message);
          } finally {
              if (fileInputRef.current) fileInputRef.current.value = '';
          }
      }
  };

  const handleSemanticAnalysis = async () => {
      if (!editableText || editableText.trim().length < MIN_CHARS_FOR_SMART_ANALYSIS) return;
      setIsSemanticLoading(true);
      try {
          const { citations, usageMetadata } = await analyzeLegislation(editableText);
          setSemanticData(citations);
          if (usageMetadata && onTokenUpdate) onTokenUpdate(usageMetadata);
      } catch (e) {
          console.error("Analysis failed", e);
      } finally {
          setIsSemanticLoading(false);
      }
  };

  const handleDeepAnalysis = async (mode: string, customInstruction?: string) => {
      // OPTIMIZACIÓN 1: Verificar longitud mínima para evitar gasto de tokens en docs vacíos
      if (!editableText || editableText.trim().length < MIN_CHARS_FOR_SMART_ANALYSIS) {
          setAnalysisContent("⚠️ Documento insuficiente. Se requiere más contexto (mínimo 300 caracteres) para ejecutar el análisis forense y no generar alucinaciones.");
          return;
      }
      
      // OPTIMIZACIÓN 2: Si es personalizado, verificar que haya instrucción
      if (mode === 'custom' && (!customInstruction || !customInstruction.trim())) {
          // No hacer nada si no hay prompt, ahorra la llamada
          return;
      }

      setIsAnalysisLoading(true);
      setAnalysisContent(''); 
      try {
          const { analysis, usageMetadata } = await performDeepDocumentAnalysis(editableText, mode, customInstruction);
          setAnalysisContent(analysis);
          if (usageMetadata && onTokenUpdate) onTokenUpdate(usageMetadata);
      } catch (e) {
          console.error("Deep analysis failed", e);
          setAnalysisContent("Error al realizar el análisis.");
      } finally {
          setIsAnalysisLoading(false);
      }
  };

  const handleRatioGeneration = async () => {
      if (!editableText || editableText.trim().length < MIN_CHARS_FOR_SMART_ANALYSIS) return;
      setIsRatioLoading(true);
      try {
          const ratio = await generateRatioDecidendi(editableText, data?.source);
          setRatioContent(ratio);
      } catch (e) {
          console.error("Error generating ratio", e);
      } finally {
          setIsRatioLoading(false);
      }
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
     const target = e.target as HTMLTextAreaElement;
     if (target.selectionStart !== target.selectionEnd) {
         setSelection({
             start: target.selectionStart,
             end: target.selectionEnd,
             text: target.value.substring(target.selectionStart, target.selectionEnd)
         });
     } else {
         setSelection(null);
         setShowMagicInput(false);
     }
  };

  // --- CONTEXT MENU HANDLER ---
  const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
      const handleClick = () => setContextMenu(null);
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
  }, []);

  const executeMagicEdit = async (customInstruction?: string) => {
      const instr = customInstruction || magicInstruction;
      if (!selection || !instr) return;

      setIsMagicLoading(true);
      setContextMenu(null); // Close menu if open
      try {
          const { newText, usageMetadata } = await magicEditSentence(editableText, selection.text, instr);
          const updatedFullText = 
              editableText.substring(0, selection.start) + 
              newText + 
              editableText.substring(selection.end);
          updateTextWithHistory(updatedFullText);
          setShowMagicInput(false);
          setMagicInstruction('');
          setSelection(null);
          if (usageMetadata && onTokenUpdate) onTokenUpdate(usageMetadata);
      } catch (error) {
          console.error("Magic edit failed", error);
      } finally {
          setIsMagicLoading(false);
      }
  };

  // --- EDITOR FORMATTING TOOLS ---
  const insertFormatting = (prefix: string, suffix: string) => {
      if (!textareaRef.current) return;
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = textareaRef.current.value;
      const before = text.substring(0, start);
      const selected = text.substring(start, end);
      const after = text.substring(end);
      
      const newText = before + prefix + selected + suffix + after;
      updateTextWithHistory(newText);
      
      setTimeout(() => {
          if (textareaRef.current) {
              textareaRef.current.focus();
              textareaRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
          }
      }, 0);
  };

  const insertTextAtCursor = (textToInsert: string) => {
      if (!textareaRef.current) {
          updateTextWithHistory(editableText + textToInsert);
          return;
      }
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = textareaRef.current.value;
      const before = text.substring(0, start);
      const after = text.substring(end);
      updateTextWithHistory(before + textToInsert + after);
  };

  const handleCopy = () => {
    if (editableText) {
      navigator.clipboard.writeText(editableText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePaste = async () => {
    try {
        const text = await navigator.clipboard.readText();
        if (!textareaRef.current) {
            insertTextAtCursor(text);
            setContextMenu(null);
            return;
        }
        
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const currentText = textareaRef.current.value;
        
        const newText = currentText.substring(0, start) + text + currentText.substring(end);
        updateTextWithHistory(newText);
        
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const newCursorPos = start + text.length;
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
        
        setContextMenu(null);
    } catch (err) {
        console.error('Failed to paste from clipboard: ', err);
        alert("Permiso de portapapeles denegado o no disponible.");
    }
  };

  const handleChatFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const newFiles = Array.from(e.target.files || []);
          setChatFiles(prev => [...prev, ...newFiles]);
          e.target.value = ''; 
      }
  };

  const removeChatFile = (index: number) => {
      setChatFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (mode: 'chat' | 'analysis', customMessage?: string) => {
    const finalMessage = customMessage || chatInput;
    if ((mode === 'chat' && !finalMessage.trim() && chatFiles.length === 0) || !editableText) return;
    
    setIsChatLoading(true);
    
    let userMsg = mode === 'chat' ? finalMessage : (customMessage || "Realizar análisis de contradicciones y puntos débiles.");
    
    if (activeChatMode === 'construction' && mode === 'chat') {
        userMsg = `MODO CONSTRUCCIÓN: El usuario solicita una edición o redacción. 
        INSTRUCCIÓN: "${userMsg}".
        
        REGLA OBLIGATORIA:
        1. Genera el texto solicitado.
        2. ENVUÉLVELO EN ETIQUETAS :::DOC_UPDATE_START::: y :::DOC_UPDATE_END::: para que se inserte en el editor.
        3. NO solo converses, EJECUTA la redacción.`;
    }

    const userDisplayMsg = chatFiles.length > 0 ? `${userMsg} \n\n[Adjuntos: ${chatFiles.map(f => f.name).join(', ')}]` : userMsg;

    if (mode === 'chat' && !customMessage) {
        setChatMessages(prev => [...prev, { role: 'user', text: activeChatMode === 'construction' ? `🏗️ ${finalMessage}` : finalMessage }]);
        setChatInput('');
    } else {
        setChatMessages(prev => [...prev, { role: 'user', text: userDisplayMsg }]);
    }

    try {
        const { chatResponse, documentUpdate } = await chatWithSentence(editableText, chatMessages, userMsg, mode, chatFiles);
        setChatMessages(prev => [...prev, { role: 'model', text: chatResponse }]);
        if (documentUpdate) {
            updateTextWithHistory(documentUpdate);
        }
        setChatFiles([]); 
    } catch (e) {
        setChatMessages(prev => [...prev, { role: 'model', text: "Error al conectar con JUXA Intelligence." }]);
    } finally {
        setIsChatLoading(false);
    }
  };

  // --- EXPORT LOGIC ---
  const handlePrintPdf = () => {
     if (!editableText) return;
     const originalTitle = document.title;
     document.title = `Sentencia_${data?.matterDetected || 'JUXA'}`;
     window.print();
     document.title = originalTitle;
     setActiveMenu(null);
  };

  const handleDownloadPdfFile = () => {
    if (typeof html2pdf === 'undefined') {
        alert("El módulo de descarga está cargando. Intente de nuevo en unos segundos.");
        return;
    }
    const element = document.createElement('div');
    element.innerHTML = document.getElementById('document-content')?.innerHTML || '';
    const cleanElement = element.cloneNode(true) as HTMLElement;
    cleanElement.style.padding = '40px';
    cleanElement.style.fontFamily = 'Times New Roman, serif';
    cleanElement.style.fontSize = '12pt';
    cleanElement.style.textAlign = 'justify';
    cleanElement.style.lineHeight = '1.5';
    cleanElement.style.color = 'black';
    cleanElement.style.background = 'white';

    const opt = {
      margin:       1,
      filename:     `Documento_JUXA.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(cleanElement).save();
    setActiveMenu(null);
  };

  const handleDownloadWord = () => {
    if (!editableText) return;
    let htmlContent = editableText
      .replace(/^\|\|\| (.*$)/gim, '<p style="text-align: center; font-weight: bold; margin-top: 10px;">$1</p>')
      .replace(/^# (.*$)/gim, '<p style="font-size: 14pt; text-align: right; font-weight: bold; text-transform: uppercase; margin-bottom: 2px;">$1</p>') 
      .replace(/^## (.*$)/gim, '<p style="font-size: 13pt; text-align: center; font-weight: bold; margin-top: 20px;">$1</p>')
      .replace(/^### (.*$)/gim, '<p style="font-size: 12pt; text-align: left; font-weight: bold; margin-top: 15px;">$1</p>')
      .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
      .replace(/\*(.*)\*/gim, '<i>$1</i>')
      .replace(/^\s*-\s+(.*)/gim, '<li style="margin-left: 40px;">$1</li>')
      .replace(/\n\n/gim, '</p><p style="text-align: justify; font-family: \'Times New Roman\', serif; font-size: 12pt; line-height: 1.5; text-indent: 40px;">')
      .replace(/\n/gim, '<br />');

    if (!htmlContent.startsWith('<p')) {
        htmlContent = '<p style="text-align: justify; font-family: \'Times New Roman\', serif; font-size: 12pt; line-height: 1.5; text-indent: 40px;">' + htmlContent + '</p>';
    }

    const fullHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8"><title>Documento</title>
        <style>body { font-family: 'Times New Roman', serif; font-size: 12pt; } p { text-align: justify; line-height: 1.5; text-indent: 40px; margin-bottom: 10px; }</style>
      </head><body>${htmlContent}</body></html>
    `;

    const blob = new Blob(['\ufeff', fullHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Documento_JUXA.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActiveMenu(null);
  };

  const DisclaimerPage = () => (
      <div className="flex flex-col items-center justify-center h-full min-h-[800px] border-4 border-double border-slate-200 p-12 bg-slate-50 relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
          <ShieldCheck className="w-20 h-20 text-slate-300 mb-6" />
          <h1 className="text-xl font-bold text-slate-700 mb-2 text-center uppercase tracking-widest">Aviso de Responsabilidad Profesional</h1>
          <h2 className="text-xs font-bold text-slate-400 mb-10 text-center tracking-[0.2em] uppercase">Cumplimiento Normativo (IA Responsable)</h2>
          
          <div className="max-w-xl text-justify space-y-6 text-slate-600 font-serif text-sm leading-relaxed">
              <p>
                  <strong>NATURALEZA INSTRUMENTAL:</strong> El presente documento ha sido generado mediante sistemas de Inteligencia Artificial Generativa operados por JUXA Legal Tech. Su propósito es servir exclusivamente como <strong>BORRADOR PRELIMINAR</strong> y herramienta de apoyo para la eficiencia procesal.
              </p>
              <p>
                  <strong>LIMITACIÓN DE RESPONSABILIDAD:</strong> De conformidad con la normativa internacional y las mejores prácticas éticas, este contenido <strong>NO constituye asesoramiento legal automático, sentencia firme ni resolución vinculante</strong> por sí mismo. La IA puede generar información inexacta ("alucinaciones") o interpretaciones no actualizadas.
              </p>
              <p className="border-l-4 border-blue-500 pl-4 py-2 bg-slate-100 italic">
                  <strong>OBLIGACIÓN DE SUPERVISIÓN:</strong> Es <strong>RESPONSABILIDAD ABSOLUTA, INDELEGABLE Y EXCLUSIVA</strong> del profesional jurídico (abogado, juez, secretario o autoridad) realizar la revisión exhaustiva, verificación fáctica, fundamentación jurídica y corrección del texto antes de su firma, presentación o uso en cualquier instancia judicial o administrativa.
              </p>
          </div>
          
          <div className="mt-16 pt-6 border-t border-slate-300 w-full max-w-md text-center">
               <p className="text-[10px] text-slate-400 uppercase font-sans tracking-wider">JUXA Legal Tech • 2026 • Tecnología Asistiva</p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
      </div>
  );

  const totalPages = pages.length > 0 ? pages.length + 1 : 0; 

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-transparent text-slate-400 space-y-8 p-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-900/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center w-full max-w-md">
            <div className="mb-8 relative">
                <div className="w-24 h-24 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl">⚖️</div>
            </div>
            <p className="text-lg font-medium text-white text-center h-16 transition-all duration-500 ease-in-out flex items-center justify-center">
                {loadingPhrase}
            </p>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-6 overflow-hidden relative">
                <div className="bg-gradient-to-r from-emerald-500 to-blue-600 h-full rounded-full transition-all duration-300 ease-out" style={{ width: `${loadingProgress}%` }}></div>
            </div>
            <div className="text-xs text-slate-500 mt-2 font-mono">PROCESANDO EXPEDIENTE... {Math.round(loadingProgress)}%</div>
        </div>
      </div>
    );
  }

  // --- MENU RENDERER ---
  const renderMenu = () => (
      <div className="flex items-center space-x-1 ml-4 relative">
          {/* ARCHIVO */}
          <div className="relative">
              <button 
                  onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium hover:bg-white/10 transition-colors ${activeMenu === 'file' ? 'bg-white/10 text-white' : 'text-slate-300'}`}
              >
                  Archivo
              </button>
              {activeMenu === 'file' && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-[#1a1a1d] border border-white/10 rounded-lg shadow-2xl z-50 py-1 flex flex-col animate-fade-in">
                      <button onClick={() => { updateTextWithHistory(""); setActiveMenu(null); }} className="text-left px-4 py-2 hover:bg-white/5 text-xs text-slate-200 flex items-center"><FilePlus className="w-3.5 h-3.5 mr-2 text-slate-400" /> Nuevo</button>
                      <button onClick={() => { fileInputRef.current?.click(); setActiveMenu(null); }} className="text-left px-4 py-2 hover:bg-white/5 text-xs text-slate-200 flex items-center"><FileUp className="w-3.5 h-3.5 mr-2 text-slate-400" /> Abrir (Word/Doc)</button>
                      <div className="h-px bg-white/10 my-1"></div>
                      <button onClick={() => { setShowPlainTextView(true); setActiveMenu(null); }} className="text-left px-4 py-2 hover:bg-white/5 text-xs text-slate-200 flex items-center"><Eye className="w-3.5 h-3.5 mr-2 text-purple-400" /> Ver Texto Plano</button>
                      <div className="h-px bg-white/10 my-1"></div>
                      <button onClick={handleDownloadWord} className="text-left px-4 py-2 hover:bg-white/5 text-xs text-slate-200 flex items-center"><FileDown className="w-3.5 h-3.5 mr-2 text-blue-400" /> Descargar .docx</button>
                      <button onClick={handleDownloadPdfFile} className="text-left px-4 py-2 hover:bg-white/5 text-xs text-slate-200 flex items-center"><FileDown className="w-3.5 h-3.5 mr-2 text-red-400" /> Descargar PDF</button>
                  </div>
              )}
          </div>

          {/* EDITAR */}
          <div className="relative">
              <button 
                  onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium hover:bg-white/10 transition-colors ${activeMenu === 'edit' ? 'bg-white/10 text-white' : 'text-slate-300'}`}
              >
                  Editar
              </button>
              {activeMenu === 'edit' && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-[#1a1a1d] border border-white/10 rounded-lg shadow-2xl z-50 py-1 flex flex-col animate-fade-in">
                      <button onClick={() => { handleUndo(); setActiveMenu(null); }} className="text-left px-4 py-2 hover:bg-white/5 text-xs text-slate-200 flex items-center"><Undo className="w-3.5 h-3.5 mr-2 text-slate-400" /> Deshacer</button>
                      <button onClick={() => { handleRedo(); setActiveMenu(null); }} className="text-left px-4 py-2 hover:bg-white/5 text-xs text-slate-200 flex items-center"><Redo className="w-3.5 h-3.5 mr-2 text-slate-400" /> Rehacer</button>
                      <div className="h-px bg-white/10 my-1"></div>
                      <button onClick={() => { handleCopy(); setActiveMenu(null); }} className="text-left px-4 py-2 hover:bg-white/5 text-xs text-slate-200 flex items-center"><Copy className="w-3.5 h-3.5 mr-2 text-slate-400" /> Copiar</button>
                      <button onClick={async () => { 
                          try { const text = await navigator.clipboard.readText(); insertTextAtCursor(text); } catch(e) {}
                          setActiveMenu(null);
                      }} className="text-left px-4 py-2 hover:bg-white/5 text-xs text-slate-200 flex items-center"><Copy className="w-3.5 h-3.5 mr-2 text-slate-400" /> Pegar</button>
                  </div>
              )}
          </div>
          
           {/* FORMATO */}
           <div className="relative">
              <button 
                  onClick={() => setActiveMenu(activeMenu === 'format' ? null : 'format')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium hover:bg-white/10 transition-colors ${activeMenu === 'format' ? 'bg-white/10 text-white' : 'text-slate-300'}`}
              >
                  Formato
              </button>
              {activeMenu === 'format' && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-[#1a1a1d] border border-white/10 rounded-lg shadow-2xl z-50 py-1 flex flex-col animate-fade-in">
                      <button onClick={() => { insertFormatting("**", "**"); setActiveMenu(null); }} className="text-left px-4 py-2 hover:bg-white/5 text-xs text-slate-200 flex items-center"><Bold className="w-3.5 h-3.5 mr-2 text-slate-400" /> Negrita</button>
                      <button onClick={() => { insertFormatting("*", "*"); setActiveMenu(null); }} className="text-left px-4 py-2 hover:bg-white/5 text-xs text-slate-200 flex items-center"><Italic className="w-3.5 h-3.5 mr-2 text-slate-400" /> Cursiva</button>
                      <div className="h-px bg-white/10 my-1"></div>
                      <button onClick={() => { insertFormatting("\n# ", ""); setActiveMenu(null); }} className="text-left px-4 py-2 hover:bg-white/5 text-xs text-slate-200 flex items-center"><Type className="w-3.5 h-3.5 mr-2 text-slate-400" /> Título 1 (Derecha)</button>
                      <button onClick={() => { insertFormatting("\n## ", ""); setActiveMenu(null); }} className="text-left px-4 py-2 hover:bg-white/5 text-xs text-slate-200 flex items-center"><AlignCenter className="w-3.5 h-3.5 mr-2 text-slate-400" /> Título 2 (Centro)</button>
                      <button onClick={() => { insertFormatting("\n> ", ""); setActiveMenu(null); }} className="text-left px-4 py-2 hover:bg-white/5 text-xs text-slate-200 flex items-center"><AlignJustify className="w-3.5 h-3.5 mr-2 text-slate-400" /> Cita / Bloque</button>
                  </div>
              )}
          </div>
      </div>
  );

  if (!data && !editableText) return null;

  return (
    <div className="flex flex-col h-full bg-transparent relative print:bg-white print:block">
      
      {/* PLAIN TEXT MODAL */}
      {showPlainTextView && (
          <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-8 backdrop-blur-sm animate-fade-in">
              <div className="bg-[#151517] w-full max-w-4xl h-full max-h-[80vh] rounded-2xl border border-white/10 flex flex-col shadow-2xl">
                  <div className="flex justify-between items-center p-4 border-b border-white/10">
                      <h3 className="text-white font-bold flex items-center"><Eye className="w-4 h-4 mr-2"/> Vista de Texto Plano</h3>
                      <button onClick={() => setShowPlainTextView(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto">
                      <textarea 
                        readOnly 
                        value={editableText} 
                        className="w-full h-full bg-[#0a0a0a] text-slate-300 font-mono text-xs p-4 rounded-lg outline-none resize-none"
                      />
                  </div>
                  <div className="p-4 border-t border-white/10 flex justify-end">
                      <button onClick={() => { handleCopy(); setShowPlainTextView(false); }} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold">Copiar Todo</button>
                  </div>
              </div>
          </div>
      )}

      {/* GOOGLE DOCS STYLE HEADER & TOOLBAR */}
      <div className="flex flex-col z-20 sticky top-0 shadow-xl print:hidden">
          
          {/* TOP MENU BAR */}
          <div className="bg-[#0f0f11] border-b border-white/10 px-4 py-2 flex justify-between items-center">
             <div className="flex items-center">
                 {/* HIDDEN FILE INPUT (MOVED HERE FOR RELIABILITY) */}
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleOpenFile} 
                    className="hidden" 
                    accept=".docx,.doc,.txt,.rtf" 
                 />
                 
                 <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                    <FileText className="w-5 h-5 text-white" />
                 </div>
                 <div className="flex flex-col">
                     <div className="flex items-center">
                        <input 
                            className="bg-transparent border-none text-white text-sm font-bold px-2 py-0.5 rounded hover:border hover:border-white/20 outline-none w-64 truncate"
                            defaultValue={data?.documentTitle || "Documento Sin Título"} 
                        />
                     </div>
                     {renderMenu()}
                 </div>
             </div>
             
             {/* TOP RIGHT ACTIONS */}
             <div className="flex items-center space-x-2">
                 {/* Tabs */}
                 <div className="flex items-center bg-slate-900/50 rounded-lg p-0.5 border border-slate-700 mr-4">
                   <button onClick={() => setActiveTab('analytics')} className={`px-3 py-1 text-[10px] font-bold rounded flex items-center transition-all ${activeTab === 'analytics' ? 'bg-blue-900/50 text-blue-400' : 'text-slate-400 hover:text-white'}`}>
                     <Radar className="w-3 h-3 mr-1" /> ADVISOR
                   </button>
                   <button onClick={() => setActiveTab('analysis')} className={`px-3 py-1 text-[10px] font-bold rounded flex items-center transition-all ${activeTab === 'analysis' ? 'bg-cyan-900/50 text-cyan-400' : 'text-slate-400 hover:text-white'}`}>
                     <FileSearch className="w-3 h-3 mr-1" /> ANÁLISIS
                   </button>
                   <button onClick={() => setActiveTab('ratio')} className={`px-3 py-1 text-[10px] font-bold rounded flex items-center transition-all ${activeTab === 'ratio' ? 'bg-amber-900/50 text-amber-400' : 'text-slate-400 hover:text-white'}`}>
                     <BrainCircuit className="w-3 h-3 mr-1" /> SUSTENTO
                   </button>
                   <button onClick={() => setActiveTab('semantic')} className={`px-3 py-1 text-[10px] font-bold rounded flex items-center transition-all ${activeTab === 'semantic' ? 'bg-purple-900/50 text-purple-400' : 'text-slate-400 hover:text-white'}`}>
                     <Scale className="w-3 h-3 mr-1" /> SEMÁNTICO
                   </button>
                </div>

                <button onClick={() => setIsEditing(!isEditing)} className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10 text-slate-400'}`} title={isEditing ? "Modo Edición" : "Modo Lectura"}>
                    {isEditing ? <PenTool className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <div className="flex items-center px-2 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 rounded-full border border-emerald-500/20 py-1">
                    <Check className="w-3 h-3 mr-1" /> Guardado
                </div>
             </div>
          </div>

          {/* SECONDARY TOOLBAR (RICH TEXT ICONS) */}
          {isEditing && (
              <div className="bg-[#151517] border-b border-white/10 px-4 py-2 flex items-center space-x-1 overflow-x-auto scrollbar-hide">
                  <button onClick={() => handleUndo()} className="p-1.5 rounded hover:bg-white/10 text-slate-400" title="Deshacer"><Undo className="w-4 h-4"/></button>
                  <button onClick={() => handleRedo()} className="p-1.5 rounded hover:bg-white/10 text-slate-400 mr-2" title="Rehacer"><Redo className="w-4 h-4"/></button>
                  
                  <div className="w-px h-5 bg-white/10 mx-2"></div>
                  
                  <button onClick={() => insertFormatting("**", "**")} className="p-1.5 rounded hover:bg-white/10 text-slate-300 font-bold" title="Negrita">B</button>
                  <button onClick={() => insertFormatting("*", "*")} className="p-1.5 rounded hover:bg-white/10 text-slate-300 italic font-serif" title="Cursiva">I</button>
                  
                  <div className="w-px h-5 bg-white/10 mx-2"></div>
                  
                  <button onClick={() => insertFormatting("\n# ", "")} className="p-1.5 rounded hover:bg-white/10 text-slate-300 flex items-center" title="Título Derecha"><AlignLeft className="w-4 h-4"/></button>
                  <button onClick={() => insertFormatting("\n## ", "")} className="p-1.5 rounded hover:bg-white/10 text-slate-300 flex items-center" title="Título Centro"><AlignCenter className="w-4 h-4"/></button>
                  <button onClick={() => insertFormatting("\n### ", "")} className="p-1.5 rounded hover:bg-white/10 text-slate-300 flex items-center" title="Título Izquierda"><AlignJustify className="w-4 h-4"/></button>
                  
                  <div className="w-px h-5 bg-white/10 mx-2"></div>

                  <button onClick={() => insertFormatting("\n- ", "")} className="p-1.5 rounded hover:bg-white/10 text-slate-300" title="Lista"><List className="w-4 h-4"/></button>
                  
                  <div className="flex-1"></div>
                  
                  {selection && (
                      <button onClick={() => setShowMagicInput(true)} className="flex items-center px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-xs font-bold animate-pulse hover:bg-purple-500/20">
                          <Sparkles className="w-3 h-3 mr-2" /> Edición Mágica
                      </button>
                  )}
              </div>
          )}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden relative print:overflow-visible print:block print:h-auto">
        
        {/* CONTEXT MENU */}
        {contextMenu && (
            <div 
                className="fixed z-50 bg-[#1a1a1d] border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[220px] flex flex-col animate-fade-in"
                style={{ top: contextMenu.y, left: contextMenu.x }}
                onContextMenu={(e) => e.preventDefault()} // Prevent native menu on custom menu
            >
                {/* ... (Existing Context Menu Content) ... */}
                <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase bg-black/20 border-b border-white/5 flex items-center">
                    <MousePointerClick className="w-3 h-3 mr-2"/> Acciones JUXA
                </div>
                
                {/* CUSTOM PROMPT INPUT */}
                {selection && (
                    <div className="p-2 border-b border-white/5">
                        <div className="flex items-center bg-black/40 rounded-lg border border-white/10 px-2 py-1 focus-within:border-purple-500/50 transition-colors">
                            <Sparkles className="w-3 h-3 text-purple-400 mr-2 flex-shrink-0" />
                            <input 
                                autoFocus
                                type="text" 
                                placeholder="Escribe instrucción y presiona Enter..." 
                                className="bg-transparent border-none text-[10px] text-white w-full outline-none placeholder:text-slate-600 font-sans"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        executeMagicEdit((e.target as HTMLInputElement).value);
                                        setContextMenu(null);
                                    }
                                }}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                )}

                {selection ? (
                    <>
                        <button onClick={() => executeMagicEdit("Formalizar lenguaje técnico jurídico")} className="flex items-center px-4 py-2 hover:bg-blue-600/20 hover:text-blue-400 text-slate-300 text-xs transition-colors text-left"><Briefcase className="w-3.5 h-3.5 mr-2 text-slate-500"/> Formalizar Texto</button>
                        <button onClick={() => executeMagicEdit("Extender el argumento jurídico y fundamentar más")} className="flex items-center px-4 py-2 hover:bg-blue-600/20 hover:text-blue-400 text-slate-300 text-xs transition-colors text-left"><Maximize2 className="w-3.5 h-3.5 mr-2 text-slate-500"/> Extender Argumento</button>
                        <button onClick={() => executeMagicEdit("Resumir y ser más conciso")} className="flex items-center px-4 py-2 hover:bg-blue-600/20 hover:text-blue-400 text-slate-300 text-xs transition-colors text-left"><Minimize2 className="w-3.5 h-3.5 mr-2 text-slate-500"/> Resumir</button>
                        <button onClick={() => executeMagicEdit("Identifica los artículos de ley aplicables y agrégalos al texto citando la fuente.")} className="flex items-center px-4 py-2 hover:bg-purple-600/20 hover:text-purple-400 text-slate-300 text-xs transition-colors text-left"><BookOpen className="w-3.5 h-3.5 mr-2 text-purple-500"/> Fundamentar Jurídicamente</button>
                        
                        <div className="h-px bg-white/10 my-1"></div>
                        
                        <button onClick={() => { handleCopy(); setContextMenu(null); }} className="flex items-center px-4 py-2 hover:bg-white/10 text-slate-300 text-xs transition-colors text-left"><Copy className="w-3.5 h-3.5 mr-2 text-slate-500"/> Copiar</button>
                        <button onClick={handlePaste} className="flex items-center px-4 py-2 hover:bg-white/10 text-slate-300 text-xs transition-colors text-left"><Clipboard className="w-3.5 h-3.5 mr-2 text-slate-500"/> Pegar (Reemplazar)</button>
                    </>
                ) : (
                    <>
                        <button onClick={handlePaste} className="flex items-center px-4 py-2 hover:bg-white/10 text-slate-300 text-xs transition-colors text-left"><Clipboard className="w-3.5 h-3.5 mr-2 text-slate-500"/> Pegar</button>
                        <button onClick={() => { insertTextAtCursor(`\n\n||| ${new Date().toLocaleDateString('es-MX')}\n`); setContextMenu(null); }} className="flex items-center px-4 py-2 hover:bg-white/10 text-slate-300 text-xs transition-colors text-left"><Calendar className="w-3.5 h-3.5 mr-2 text-slate-500"/> Insertar Fecha</button>
                    </>
                )}
            </div>
        )}

        {/* MAGIC EDIT OVERLAY */}
        {showMagicInput && selection && (
             <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg bg-[#151517] border border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.3)] rounded-xl p-4 animate-fade-in-down print:hidden">
                 <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                     <span className="text-xs font-bold text-purple-400 flex items-center tracking-wider"><Wand2 className="w-3 h-3 mr-2"/> JUXA MAGIC EDITOR</span>
                     <button onClick={() => setShowMagicInput(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4"/></button>
                 </div>
                 <div className="bg-black/30 p-3 rounded text-xs text-slate-400 italic mb-4 border-l-2 border-purple-500 truncate">"{selection.text}"</div>
                 <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                     <button onClick={() => executeMagicEdit("Reescribir para mayor claridad")} className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-slate-300 flex items-center whitespace-nowrap transition-colors"><RefreshCw className="w-3 h-3 mr-1" /> Reescribir</button>
                     <button onClick={() => executeMagicEdit("Extender el argumento jurídico y fundamentar más")} className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-slate-300 flex items-center whitespace-nowrap transition-colors"><Maximize2 className="w-3 h-3 mr-1" /> Extender</button>
                     <button onClick={() => executeMagicEdit("Resumir y ser más conciso")} className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-slate-300 flex items-center whitespace-nowrap transition-colors"><Minimize2 className="w-3 h-3 mr-1" /> Resumir</button>
                     <button onClick={() => executeMagicEdit("Formalizar lenguaje técnico jurídico")} className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-slate-300 flex items-center whitespace-nowrap transition-colors"><Briefcase className="w-3 h-3 mr-1" /> Formalizar</button>
                 </div>
                 <div className="flex gap-2">
                     <input type="text" value={magicInstruction} onChange={(e) => setMagicInstruction(e.target.value)} placeholder="O escribe una instrucción personalizada..." className="flex-1 bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 outline-none" autoFocus onKeyDown={(e) => e.key === 'Enter' && executeMagicEdit()} />
                     <button onClick={() => executeMagicEdit()} disabled={isMagicLoading || !magicInstruction} className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg px-4 py-2 flex items-center disabled:opacity-50">{isMagicLoading ? <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></div> : <Send className="w-4 h-4" />}</button>
                 </div>
             </div>
        )}

        {/* CENTER PANEL: DOCUMENT */}
        <div className={`
             flex flex-col overflow-hidden transition-all duration-300 relative 
             ${isSplitMode ? 'flex-1 border-r border-white/10' : 'flex-1'}
             print:block print:overflow-visible print:h-auto print:w-full
        `}>
           <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#0a0a0a] bg-[radial-gradient(#1a1a1d_1px,transparent_1px)] [background-size:16px_16px] print:bg-white print:p-0 print:overflow-visible print:h-auto">
                <div id="document-content" className={`mx-auto bg-white shadow-2xl min-h-[1100px] p-12 md:p-16 relative ring-1 ring-white/10 transition-all duration-500 print:shadow-none print:ring-0 print:w-full print:max-w-none print:h-auto print:p-0 ${isSplitMode ? 'max-w-none' : 'max-w-4xl'}`}>
                     
                     {!isEditing && currentPage < pages.length && (
                         <div className="print:hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/50/Escudo_Nacional_Mexicano_V2.svg" className="w-24 h-24" alt="Escudo" />
                            </div>
                            <div className="absolute top-8 left-12 text-[10px] text-slate-400 font-mono select-none">PÁGINA {currentPage + 1} / {totalPages}</div>
                         </div>
                     )}
                    
                    {isEditing ? (
                       <textarea 
                           ref={textareaRef}
                           value={editableText}
                           onChange={handleTextChange}
                           onSelect={handleSelect}
                           onContextMenu={handleContextMenu}
                           className="w-full h-full bg-transparent text-slate-900 font-serif text-sm md:text-base leading-loose outline-none resize-none placeholder:text-slate-300 min-h-[1000px] selection:bg-blue-100 selection:text-blue-900 print:hidden"
                           spellCheck={false}
                           placeholder="Escribe o edita el documento aquí... Usa el menú Archivo > Abrir para cargar un .docx existente."
                       />
                    ) : (
                       <article className="font-serif text-slate-900 leading-relaxed text-justify print:hidden markdown-content">
                            {currentPage < pages.length ? (
                                <>
                                    <ReactMarkdown 
                                    components={{
                                        h1: ({node, ...props}) => <h1 className="my-1 text-sm font-bold uppercase text-right tracking-wide block w-full leading-snug" {...props} />,
                                        h2: ({node, ...props}) => <h2 className="mt-8 mb-6 text-sm font-bold uppercase text-center block w-full" {...props} />,
                                        p: ({node, children, ...props}) => {
                                        const text = String(children);
                                        if (text.startsWith('|||')) {
                                            return <p className="mb-4 text-center font-bold uppercase" {...props}>{text.replace('|||', '')}</p>;
                                        }
                                        return <p className="mb-4 text-justify indent-8 text-sm md:text-base leading-loose" {...props}>{children}</p>;
                                        },
                                        ul: ({node, ...props}) => <ul className="list-disc ml-8 mb-4" {...props} />,
                                        ol: ({node, ...props}) => <ol className="list-decimal ml-8 mb-4" {...props} />,
                                        li: ({node, ...props}) => <li className="pl-2 mb-2 text-justify" {...props} />,
                                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-300 pl-4 italic my-4" {...props} />,
                                    }}
                                    >
                                        {pages[currentPage] || ""}
                                    </ReactMarkdown>
                                    {currentPage === pages.length - 1 && (
                                        <div className="mt-12 flex flex-col items-center text-center space-y-4">
                                            <div className="text-xs text-slate-400">FIN DEL DOCUMENTO</div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <DisclaimerPage />
                            )}
                        </article>
                    )}

                    {/* VISTA EXCLUSIVA IMPRESIÓN/PDF */}
                    <div className="hidden print:block print:w-full font-serif text-black leading-relaxed text-justify">
                        <ReactMarkdown 
                          components={{
                            h1: ({node, ...props}) => <h1 className="my-1 text-base font-bold uppercase text-right tracking-wide block w-full leading-snug" {...props} />,
                            h2: ({node, ...props}) => <h2 className="mt-8 mb-6 text-base font-bold uppercase text-center block w-full" {...props} />,
                            p: ({node, children, ...props}) => {
                               const text = String(children);
                               if (text.startsWith('|||')) {
                                   return <p className="mb-4 text-center font-bold uppercase" {...props}>{text.replace('|||', '')}</p>;
                               }
                               return <p className="mb-4 text-justify indent-8 text-base leading-loose" {...props}>{children}</p>;
                            },
                            ul: ({node, ...props}) => <ul className="list-disc ml-8 mb-4" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal ml-8 mb-4" {...props} />,
                            li: ({node, ...props}) => <li className="pl-2 mb-2 text-justify" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-300 pl-4 italic my-4" {...props} />,
                          }}
                        >
                            {editableText}
                        </ReactMarkdown>
                        <div className="break-before-page mt-20">
                             <div className="text-center pt-20">
                                <p className="font-bold text-xs uppercase text-slate-400 mb-2">JUXA AI (INTELIGENCIA ARTIFICIAL ESPECIALIZADA EN DERECHO/LEGALTECH)</p>
                                <p className="text-[10px] text-slate-300 italic">Este documento es un proyecto generado por IA y debe ser revisado por un abogado.</p>
                             </div>
                        </div>
                    </div>
                </div>
                
                {!isEditing && totalPages > 1 && (
                    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-slate-900/90 backdrop-blur px-4 py-2 rounded-full border border-white/10 shadow-xl z-30 transition-all hover:scale-105 print:hidden">
                        <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="text-white disabled:opacity-30 hover:text-blue-400 transition-colors"><ChevronLeft className="w-5 h-5"/></button>
                        <span className="text-xs font-mono text-white min-w-[60px] text-center">{currentPage + 1} / {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1} className="text-white disabled:opacity-30 hover:text-blue-400 transition-colors"><ChevronRight className="w-5 h-5"/></button>
                    </div>
                )}
             </div>
        </div>

        {/* RIGHT PANEL: STRATEGIST / ANALYTICS / RATIO (SIDEBAR) */}
        <div className={`
            w-1/2 flex flex-col h-full overflow-hidden
            bg-[#0a0a0a]/95 backdrop-blur-sm print:hidden
        `}>
            {/* RATIO DECIDENDI */}
            {activeTab === 'ratio' && (
                <div className="h-full flex flex-col p-4 md:p-6 overflow-y-auto">
                    <div className="max-w-3xl mx-auto space-y-6 pb-20">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <BrainCircuit className="w-8 h-8 text-amber-500" />
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {data?.source === 'USER' ? 'Auditoría Jurídica' : 'Ratio Decidendi'}
                                    </h2>
                                    <p className="text-sm text-slate-400">
                                        {data?.source === 'USER' 
                                            ? 'Análisis crítico de riesgos y debilidades.' 
                                            : 'Fundamentación lógica y defensa estratégica.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#0f0f11] border border-amber-900/30 rounded-xl p-8 shadow-2xl">
                            {ratioContent || isRatioLoading ? (
                                <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-justify">
                                    {isRatioLoading ? (
                                        <div className="flex flex-col items-center justify-center py-10">
                                            <div className="animate-spin w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full mb-4"></div>
                                            <p className="text-amber-500 animate-pulse">Analizando...</p>
                                        </div>
                                    ) : (
                                        <ReactMarkdown>{ratioContent}</ReactMarkdown>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    {editableText.trim().length < MIN_CHARS_FOR_SMART_ANALYSIS ? (
                                         <>
                                            <FileText className="w-12 h-12 text-slate-700 mb-4" />
                                            <p className="text-sm text-slate-500 mb-2">Documento en etapa inicial.</p>
                                            <p className="text-xs text-slate-600 max-w-xs mx-auto">El análisis de sustento se activará automáticamente al redactar más contenido relevante.</p>
                                         </>
                                    ) : (
                                         <>
                                            <AlertTriangle className="w-12 h-12 text-amber-500/50 mb-4" />
                                            <button onClick={handleRatioGeneration} className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-xl font-bold">Generar Análisis Manual</button>
                                         </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* SEMANTIC ANALYSIS (UPDATED) */}
            {activeTab === 'semantic' && (
                <div className="h-full flex flex-col p-4 md:p-6 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-6 pb-20">
                        <div className="flex items-center space-x-3 mb-6">
                            <Scale className="w-8 h-8 text-purple-500" />
                            <div>
                                <h2 className="text-2xl font-bold text-white">Análisis Semántico Legal</h2>
                                <p className="text-sm text-slate-400">Mapeo de fundamentos y su aplicación fáctica.</p>
                            </div>
                        </div>
                        {isSemanticLoading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-12 h-12 border-4 border-purple-900 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                                <p className="text-purple-400 animate-pulse">Analizando semántica jurídica...</p>
                            </div>
                        ) : semanticData.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {semanticData.map((citation, idx) => (
                                    <div key={idx} className="bg-[#0f0f11] border border-white/10 rounded-xl p-5 hover:border-purple-500/50 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{citation.law}</span>
                                                <span className="text-lg font-bold text-white">{citation.article}</span>
                                            </div>
                                            <BookOpen className="w-4 h-4 text-purple-400" />
                                        </div>
                                        {citation.quote && <div className="bg-black/30 p-3 rounded-lg border-l-2 border-purple-500/50 mb-3"><p className="text-xs text-slate-300 italic font-serif">"{citation.quote}"</p></div>}
                                        <div className="text-xs text-slate-400 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                                            <strong className="text-purple-400 block mb-1">RAZONAMIENTO DE APLICABILIDAD:</strong>
                                            {citation.relevance}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl">
                                {editableText.trim().length < MIN_CHARS_FOR_SMART_ANALYSIS ? (
                                    <>
                                        <Scale className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                                        <p className="text-xs text-slate-500">Escribe más para detectar leyes aplicables.</p>
                                    </>
                                ) : (
                                    <button onClick={handleSemanticAnalysis} className="text-purple-400 hover:text-purple-300 font-bold text-sm">Reintentar Búsqueda Semántica</button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* DEEP ANALYSIS (NEW) */}
            {activeTab === 'analysis' && (
                <div className="h-full flex flex-col p-4 md:p-6 overflow-hidden">
                    <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
                        <div className="flex items-center space-x-3 mb-6">
                            <FileSearch className="w-8 h-8 text-cyan-500" />
                            <div>
                                <h2 className="text-2xl font-bold text-white">Análisis Exhaustivo</h2>
                                <p className="text-sm text-slate-400">Auditoría forense y estrategia procesal.</p>
                            </div>
                        </div>

                        {/* Analysis Controls */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <button onClick={() => handleDeepAnalysis('inconsistencias')} className="bg-[#151517] hover:bg-red-900/20 border border-white/10 hover:border-red-500/50 p-3 rounded-xl text-left transition-all group">
                                <ShieldAlert className="w-5 h-5 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
                                <div className="text-xs font-bold text-white">Inconsistencias</div>
                                <div className="text-[10px] text-slate-500">Detectar fallos de contraparte</div>
                            </button>
                            <button onClick={() => handleDeepAnalysis('teoria_caso')} className="bg-[#151517] hover:bg-blue-900/20 border border-white/10 hover:border-blue-500/50 p-3 rounded-xl text-left transition-all group">
                                <Radar className="w-5 h-5 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                                <div className="text-xs font-bold text-white">Teoría del Caso</div>
                                <div className="text-[10px] text-slate-500">Fortaleza fáctica y probatoria</div>
                            </button>
                            <button onClick={() => handleDeepAnalysis('autoridad')} className="bg-[#151517] hover:bg-amber-900/20 border border-white/10 hover:border-amber-500/50 p-3 rounded-xl text-left transition-all group">
                                <Scale className="w-5 h-5 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
                                <div className="text-xs font-bold text-white">Simulación Juez</div>
                                <div className="text-[10px] text-slate-500">¿Cómo resolvería la autoridad?</div>
                            </button>
                            <button onClick={() => handleDeepAnalysis('custom', customAnalysisPrompt || 'Análisis General')} className="bg-[#151517] hover:bg-purple-900/20 border border-white/10 hover:border-purple-500/50 p-3 rounded-xl text-left transition-all group">
                                <Sparkles className="w-5 h-5 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                                <div className="text-xs font-bold text-white">Personalizado</div>
                                <div className="text-[10px] text-slate-500">Según tu instrucción</div>
                            </button>
                        </div>

                        {/* Custom Input */}
                        <div className="mb-6 relative">
                            <input 
                                type="text" 
                                value={customAnalysisPrompt}
                                onChange={(e) => setCustomAnalysisPrompt(e.target.value)}
                                placeholder="Escribe una instrucción de análisis personalizada..."
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-xs text-white focus:border-cyan-500 outline-none pr-10"
                                onKeyDown={(e) => e.key === 'Enter' && handleDeepAnalysis('custom', customAnalysisPrompt)}
                            />
                            <button onClick={() => handleDeepAnalysis('custom', customAnalysisPrompt)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                                <ArrowRightCircle className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Result Display */}
                        <div className="bg-[#0f0f11] border border-white/10 rounded-xl p-6 min-h-[300px]">
                            {isAnalysisLoading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="w-10 h-10 border-4 border-cyan-900 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
                                    <p className="text-cyan-400 animate-pulse text-xs">Ejecutando análisis forense...</p>
                                </div>
                            ) : analysisContent ? (
                                <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed">
                                    <ReactMarkdown>{analysisContent}</ReactMarkdown>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-600 opacity-50">
                                    <FileSearch className="w-12 h-12 mb-3" />
                                    <p className="text-xs">Selecciona un modo de análisis para comenzar.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* STRATEGIST (CHAT) */}
            {activeTab === 'analytics' && (
                <div className="h-full flex flex-col rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-[#0f0f11] m-4">
                    <div className="p-4 border-b border-white/10 bg-[#151517]">
                        <h3 className="font-bold text-white flex items-center mb-3"><Radar className="w-4 h-4 mr-2 text-blue-500"/> JUXA ADVISOR</h3>
                        
                        {/* MODE TOGGLE */}
                        <div className="bg-black/30 p-1 rounded-lg flex space-x-1">
                            <button 
                                onClick={() => setActiveChatMode('consultation')}
                                className={`flex-1 flex items-center justify-center text-[10px] font-bold py-1.5 rounded transition-colors ${activeChatMode === 'consultation' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                            >
                                <MessageSquare className="w-3 h-3 mr-1.5" /> 
                                CONSULTA
                            </button>
                            <button 
                                onClick={() => setActiveChatMode('construction')}
                                className={`flex-1 flex items-center justify-center text-[10px] font-bold py-1.5 rounded transition-colors ${activeChatMode === 'construction' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Hammer className="w-3 h-3 mr-1.5" /> 
                                CONSTRUCCIÓN
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                    {chatMessages.length === 0 && (
                        <div className="text-center text-slate-500 mt-20 px-6">
                            {activeChatMode === 'consultation' ? (
                                <>
                                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-blue-500/50"/>
                                    <p className="text-sm font-bold text-slate-400">Modo Consulta Activo</p>
                                    <p className="text-xs mt-1">Pregúntame sobre leyes, conceptos o estrategias. No modificaré el documento.</p>
                                </>
                            ) : (
                                <>
                                    <Hammer className="w-8 h-8 mx-auto mb-2 text-purple-500/50"/>
                                    <p className="text-sm font-bold text-slate-400">Modo Construcción Activo</p>
                                    <p className="text-xs mt-1">Pídeme redactar cláusulas, argumentos o secciones completas. Escribiré directamente en el editor.</p>
                                </>
                            )}
                        </div>
                    )}
                    {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none shadow-lg' : 'bg-[#1a1a1d] text-slate-200 border border-white/10 rounded-tl-none shadow-lg'}`}>
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    {isChatLoading && <div className="flex justify-start"><div className="bg-[#1a1a1d] p-4 rounded-2xl border border-white/10"><div className="flex space-x-1"><div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></div></div></div></div>}
                    </div>
                    
                    <div className="p-4 bg-[#151517] border-t border-white/10">
                        {chatFiles.length > 0 && (
                            <div className="flex gap-2 mb-2 overflow-x-auto pb-1 scrollbar-hide">
                                {chatFiles.map((file, idx) => (
                                    <div key={idx} className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded flex items-center border border-white/10">
                                        <span className="truncate max-w-[120px]">{file.name}</span>
                                        <button onClick={() => removeChatFile(idx)} className="ml-2 hover:text-red-400"><X className="w-3 h-3"/></button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex items-end space-x-2">
                                <div className="relative">
                                    <input 
                                        type="file" 
                                        ref={chatFileInputRef}
                                        multiple 
                                        onChange={handleChatFileSelect} 
                                        className="hidden" 
                                    />
                                    <button 
                                        onClick={() => chatFileInputRef.current?.click()}
                                        className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors border border-white/5 mb-1"
                                    >
                                        <Paperclip className="w-4 h-4" />
                                    </button>
                                </div>
                            <textarea 
                                value={chatInput} 
                                onChange={(e) => setChatInput(e.target.value)} 
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage('chat');
                                    }
                                }}
                                placeholder={activeChatMode === 'consultation' ? "Haz una consulta..." : "Instruye una redacción..."}
                                className={`flex-1 bg-[#0a0a0a] border rounded-xl px-4 py-3 text-sm text-white outline-none resize-none h-14 scrollbar-hide leading-relaxed transition-colors ${activeChatMode === 'construction' ? 'border-purple-500/50 focus:border-purple-500' : 'border-white/10 focus:border-blue-500'}`} 
                            />
                            <button 
                                onClick={() => handleSendMessage('chat')} 
                                disabled={isChatLoading || (!chatInput && chatFiles.length === 0)} 
                                className={`p-3 rounded-xl text-white disabled:opacity-50 transition-colors mb-1 ${activeChatMode === 'construction' ? 'bg-purple-600 hover:bg-purple-500' : 'bg-blue-600 hover:bg-blue-500'}`}
                            >
                                {activeChatMode === 'construction' ? <Hammer className="w-4 h-4" /> : <Send className="w-4 h-4" />}
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
