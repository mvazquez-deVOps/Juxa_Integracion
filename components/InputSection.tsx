
import React, { useState, useEffect } from 'react';
import { Upload, FileText, AlertCircle, Wand2, Paperclip, ChevronDown, FileCheck, Gavel, X, Sparkles } from 'lucide-react';
import { UserRole } from '../types';

interface InputSectionProps {
  onGenerate: (notes: string, documentType: string, files: File[]) => void;
  onFileSelect: (files: File[]) => void;
  isLoading: boolean;
  currentRole: UserRole;
  activeFileIndex?: number;
  onActiveFileChange?: (index: number) => void;
}

export const InputSection: React.FC<InputSectionProps> = ({ 
  onGenerate, 
  onFileSelect, 
  isLoading, 
  currentRole,
  activeFileIndex,
  onActiveFileChange 
}) => {
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [docType, setDocType] = useState('');

  // Define document options based on role
  const getDocOptions = (role: UserRole) => {
    const commonOptions = ["Modo Adaptativo (Auto-detectar)", "MAGISTRADO AI: Sentencia Universal"];
    
    switch (role) {
      case UserRole.JUZGADOR:
        return [
          ...commonOptions,
          "Sentencia Definitiva", "Sentencia Interlocutoria", "Auto de Radicación", "Auto de Admisión", 
          "Auto de Desechamiento", "Acuerdo de Trámite", "Certificación"
        ];
      case UserRole.FISCALIA:
        return [
          ...commonOptions,
          "Acuerdo de Inicio", "Determinación de Archivo Temporal", "Escrito de Acusación", 
          "Solicitud de Orden de Aprehensión", "Solicitud de Vinculación a Proceso", "Medidas Cautelares"
        ];
      case UserRole.POSTULANTE:
        return [
          ...commonOptions,
          "Escrito Inicial de Demanda", "Contestación de Demanda", "Ofrecimiento de Pruebas", 
          "Alegatos", "Recurso de Apelación", "Recurso de Revocación", "Amparo Indirecto",
          "Escrito de Trámite", "Desahogo de Vista"
        ];
      case UserRole.AUTORIDAD:
        return [
          ...commonOptions,
          "Oficio de Respuesta", "Resolución Administrativa", "Citatorio", "Acta de Visita", "Multa / Sanción"
        ];
      default:
        return ["Documento Genérico"];
    }
  };

  const options = getDocOptions(currentRole);

  // Set default doctype when role changes
  useEffect(() => {
    setDocType(options[0]);
  }, [currentRole]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles: File[] = Array.from(e.target.files);
      // Validate extensions explicitly
      const validFiles = selectedFiles.filter(f => 
          f.name.endsWith('.pdf') || 
          f.name.endsWith('.doc') || 
          f.name.endsWith('.docx')
      );
      
      if (validFiles.length < selectedFiles.length) {
          alert("Solo se permiten archivos PDF o Word (.doc, .docx).");
      }
      
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onFileSelect(updatedFiles);
      e.target.value = ''; // Reset input to allow re-uploading same file if deleted
      
      // Auto-select the newly added file
      if (onActiveFileChange) {
          onActiveFileChange(updatedFiles.length - 1);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(notes, docType, files);
  };

  const getRoleColor = () => {
     switch(currentRole) {
        case UserRole.FISCALIA: return "text-red-500";
        case UserRole.POSTULANTE: return "text-emerald-500";
        case UserRole.AUTORIDAD: return "text-amber-500";
        default: return "text-blue-500";
     }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] border-r border-white/10">
      <div className="p-6 border-b border-white/10">
        <h2 className={`text-lg font-medium text-white flex items-center`}>
          <FileText className={`w-5 h-5 mr-2 ${getRoleColor()}`} />
          Generador {currentRole === UserRole.POSTULANTE ? 'de Escritos' : currentRole === UserRole.FISCALIA ? 'Ministerial' : 'de Proyectos'}
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Configura los parámetros del documento.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Document Type Selector */}
        <div>
           <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-3">
            Tipo de Documento
          </label>
          <div className="relative">
            <select 
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full bg-[#0f0f11] border border-slate-700 text-white text-sm rounded-xl p-3 appearance-none focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {options.map(opt => (
                <option key={opt} value={opt}>
                    {opt.includes("Adaptativo") ? "✨ " + opt : opt.includes("MAGISTRADO AI") ? "⚖️ " + opt : opt}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
          {docType.includes("Adaptativo") && (
              <p className="text-[10px] text-emerald-400 mt-2 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  La IA analizará el expediente y decidirá qué escrito procede.
              </p>
          )}
          {docType.includes("MAGISTRADO AI") && (
              <p className="text-[10px] text-purple-400 mt-2 flex items-center">
                  <Gavel className="w-3 h-3 mr-1" />
                  Modo Universal: Detecta materia y genera sentencia formal.
              </p>
          )}
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-3">
            {currentRole === UserRole.POSTULANTE ? "Documentos Base / Pruebas" : "Expediente Digital (PDF/Word)"}
          </label>
          <div className="group border border-dashed border-slate-700 bg-white/5 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-all cursor-pointer relative">
            <input 
              type="file" 
              accept=".pdf,.doc,.docx"
              multiple
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <Paperclip className="w-6 h-6 text-slate-400 mb-2 group-hover:text-white" />
            <p className="text-xs text-slate-400">Arrastra archivos o haz clic (PDF, Word)</p>
          </div>

          {/* File List - DELETE BUTTON REMOVED FOR DATA PROTECTION */}
          {files.length > 0 && (
              <div className="mt-4 space-y-2">
                  {files.map((f, index) => (
                      <div 
                        key={index} 
                        onClick={() => onActiveFileChange && onActiveFileChange(index)}
                        className={`flex items-center justify-between border rounded-lg p-3 animate-fade-in cursor-pointer transition-colors
                           ${activeFileIndex === index 
                              ? 'bg-[#151517] border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                              : 'bg-[#0f0f11] border-slate-800 hover:border-slate-600'}`}
                      >
                          <div className="flex items-center space-x-2 overflow-hidden w-full">
                              <FileCheck className={`w-4 h-4 flex-shrink-0 ${activeFileIndex === index ? 'text-blue-400' : 'text-emerald-400'}`} />
                              <span className={`text-xs truncate ${activeFileIndex === index ? 'text-white font-medium' : 'text-slate-300'}`}>{f.name}</span>
                          </div>
                      </div>
                  ))}
              </div>
          )}
        </div>

        {/* Notes Input */}
        <div>
          <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-3">
             {currentRole === UserRole.JUZGADOR ? "Notas del Juzgador / Sentido" : 
              currentRole === UserRole.FISCALIA ? "Hipótesis del Caso / Instrucciones" :
              currentRole === UserRole.POSTULANTE ? "Hechos / Petición Concreta" : "Instrucciones del Acto"}
          </label>
          <div className="relative">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                  currentRole === UserRole.JUZGADOR ? "Ej. Sentencia condenatoria, absolución por falta de pruebas..." :
                  currentRole === UserRole.POSTULANTE ? "Ej. Solicito devolución de garantías, promuevo amparo contra..." :
                  "Describa el contexto..."
              }
              className="w-full h-48 p-4 bg-[#0f0f11] border border-slate-800 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none font-mono placeholder:text-slate-600"
            />
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-white/10 bg-[#0a0a0a]">
        <button
          onClick={handleSubmit}
          disabled={isLoading} 
          className={`w-full py-4 px-4 rounded-xl flex items-center justify-center font-bold text-white transition-all shadow-lg
            ${isLoading 
              ? 'bg-slate-800 cursor-not-allowed text-slate-500' 
              : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/20 active:scale-[0.98]'}`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white mr-3"></div>
              Generando...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              Crear {docType.split(' ')[0]}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
