export interface SentenceRequest {
  caseFiles?: File[];
  judgeNotes: string;
  role: UserRole;
  documentType: string;
}

export interface UsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
  model?: string; // Field added for cost calculation
}

export interface SentenceResponse {
  text: string;
  ratioDecidendi?: string; // Nuevo campo para el sustento lógico-jurídico
  documentTitle?: string; // Nuevo: Nombre sintético del documento (ej. "DEMANDA EJECUTIVA")
  matterDetected: string;
  usageMetadata?: UsageMetadata;
  source?: 'USER' | 'AI'; // Identifica si el contenido es original del usuario o generado por JUXA
}

export enum LegalMatter {
  PENAL = 'PENAL',
  CIVIL = 'CIVIL',
  MERCANTIL = 'MERCANTIL',
  FAMILIAR = 'FAMILIAR',
  LABORAL = 'LABORAL',
  ADMINISTRATIVO = 'ADMINISTRATIVO',
  CONSTITUCIONAL = 'CONSTITUCIONAL',
  UNKNOWN = 'INDEFINIDO'
}

export enum UserRole {
  JUZGADOR = 'JUZGADOR',
  FISCALIA = 'FISCALÍA',
  POSTULANTE = 'POSTULANTE',
  AUTORIDAD = 'AUTORIDAD'
}

export enum AppMode {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',   
  REGISTER = 'REGISTER',
  GENERATOR = 'GENERATOR', // Modo clásico con sidebar y archivos
  EDITOR = 'EDITOR',       // Modo pantalla completa (Split View / Canva / Blanco)
  CHAT = 'CHAT',           // Nuevo: Chat tradicional
  APPS = 'APPS',            // Nuevo: Grid de aplicaciones
  ENTERPRISE = 'ENTERPRISE', // Nuevo: Modo Empresa (Simulado)
  ARGUMENT_BUILDER = 'ARGUMENT_BUILDER', // Constructor de Argumentos Standalone
  DOCUMENT_ANALYSIS = 'DOCUMENT_ANALYSIS', // Nuevo: Análisis de Documentos Standalone
  SENTENCE_BUILDER = 'SENTENCE_BUILDER' // Nuevo: Magistrado AI Standalone
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  result: SentenceResponse | null;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface LegislativeCitation {
  law: string;
  article: string;
  quote?: string; // Texto exacto de la ley (simulación de DB)
  relevance: string;
}

export interface SemanticAnalysisResponse {
  citations: LegislativeCitation[];
  usageMetadata?: UsageMetadata;
}

export type UserType = 'PERSONAL' | 'BUSINESS';

export interface UserData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  userType?: UserType;
  personType?: UserType;
}