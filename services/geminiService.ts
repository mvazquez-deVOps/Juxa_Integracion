
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SYSTEM_INSTRUCTIONS_BY_ROLE, MAGISTRADO_AI_PROMPT } from "../constants";
import { SentenceRequest, SentenceResponse, LegalMatter, ChatMessage, UserRole, SemanticAnalysisResponse, UsageMetadata } from "../types";

declare var mammoth: any;

// Helper to map Gemini usage metadata to our strict UsageMetadata type
const mapUsageMetadata = (usageMetadata: any, modelUsed: string): UsageMetadata | undefined => {
  if (!usageMetadata) return undefined;
  return {
    promptTokenCount: usageMetadata.promptTokenCount || 0,
    candidatesTokenCount: usageMetadata.candidatesTokenCount || 0,
    totalTokenCount: usageMetadata.totalTokenCount || 0,
    model: modelUsed // Inject model for pricing logic
  };
};

// Helper to convert File to Base64 (for PDFs and Images)
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Helper to extract text from Word Docs (Client-side)
// NOTE: Mammoth only supports .docx (XML based). It does NOT support binary .doc files.
const extractTextFromDocx = async (file: File): Promise<string> => {
    if (typeof mammoth === 'undefined') {
        throw new Error("El módulo de lectura de Word no está cargado.");
    }
    const arrayBuffer = await file.arrayBuffer();
    try {
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    } catch (e: any) {
        console.error("Error extracting DOCX text", e);
        if (e.message && e.message.includes("end of central directory")) {
             throw new Error("El archivo no es un .docx válido (posiblemente sea un .doc antiguo o esté dañado). Por favor conviértalo a .docx o PDF.");
        }
        throw new Error(`No se pudo leer el archivo Word: ${file.name}`);
    }
};

const processFilesForGemini = async (files: File[]): Promise<any[]> => {
    const parts: any[] = [];
    
    for (const file of files) {
        const fileName = file.name.toLowerCase();
        const isDocx = fileName.endsWith('.docx');
        const isDoc = fileName.endsWith('.doc');
        const isTxt = fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.rtf') || fileName.endsWith('.json') || fileName.endsWith('.xml');

        // 1. Handle .docx (Extract Text)
        if (isDocx) {
             try {
                 const textContent = await extractTextFromDocx(file);
                 parts.push({
                     text: `\n[CONTENIDO DEL ARCHIVO ADJUNTO: ${file.name}]\n${textContent}\n[FIN DEL ARCHIVO ${file.name}]\n`
                 });
             } catch (e) {
                 console.warn(`Skipping file ${file.name} due to extraction error:`, e);
             }
        } 
        // 2. Handle Text Files
        else if (isTxt) {
             try {
                 const textContent = await file.text();
                 parts.push({
                     text: `\n[CONTENIDO DEL ARCHIVO ADJUNTO: ${file.name}]\n${textContent}\n[FIN DEL ARCHIVO ${file.name}]\n`
                 });
             } catch (e) {
                 console.warn(`Skipping text file ${file.name}`);
             }
        }
        // 3. Handle .doc (Legacy Binary)
        else if (isDoc) {
             console.warn(`Skipping .doc file ${file.name} (binary format not supported in browser). Convert to .docx or PDF.`);
             parts.push({
                 text: `\n[NOTA: El archivo ${file.name} es formato .doc antiguo y no pudo ser leído. Se requiere .docx o PDF.]\n`
             });
        }
        // 4. Default to PDF/Image handling (Inline Data)
        else {
             try {
                 const base64 = await fileToBase64(file);
                 // Determine mime type strictly for API
                 let mimeType = file.type;
                 if (!mimeType) {
                     if (fileName.endsWith('.pdf')) mimeType = 'application/pdf';
                     else if (fileName.endsWith('.png')) mimeType = 'image/png';
                     else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) mimeType = 'image/jpeg';
                 }

                 // Only add if we have a valid mime type supported by Gemini (PDF, Image)
                 if (mimeType && (mimeType.includes('pdf') || mimeType.includes('image'))) {
                     parts.push({
                         inlineData: {
                             mimeType: mimeType,
                             data: base64
                         }
                     });
                 } else {
                     console.warn(`Unsupported file type for inline data: ${file.name} (${mimeType})`);
                 }
             } catch (e) {
                 console.warn(`Skipping file ${file.name} due to read error.`);
             }
        }
    }
    return parts;
};

export const generateSentence = async (request: SentenceRequest): Promise<SentenceResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = 'gemini-3-pro-preview';
  
  // Select the correct persona based on role, OR use the specific Magistrado AI prompt
  let selectedInstruction = SYSTEM_INSTRUCTIONS_BY_ROLE[request.role] || SYSTEM_INSTRUCTIONS_BY_ROLE[UserRole.JUZGADOR];
  
  if (request.documentType === "MAGISTRADO AI: Sentencia Universal") {
      selectedInstruction = MAGISTRADO_AI_PROMPT;
  }

  const currentDate = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

  // Specific Logic for "Desahogo de Vista" template
  let specificTemplateGuidance = "";
  if (request.documentType === "Desahogo de Vista" && request.role === UserRole.POSTULANTE) {
    specificTemplateGuidance = `
    ESTRUCTURA OBLIGATORIA PARA EL ESCRITO "DESAHOGO DE VISTA":
    - Argumenta en prosa fluida.
    - PUNTOS PETITORIOS: "PRIMERO.-", "SEGUNDO.-".
    - CIERRE CENTRADO: Usa "|||" antes de "Protesto lo Necesario", Fecha y Nombre.
    `;
  }

  // Handle Adaptive Mode
  let documentTypeInstruction = `TIPO DE DOCUMENTO A GENERAR: ${request.documentType.toUpperCase()}`;
  if (request.documentType.includes("Adaptativo")) {
      documentTypeInstruction = `
      MODO ADAPTATIVO ACTIVADO.
      TU TAREA ES:
      1. Analizar integralmente los archivos adjuntos (PDFs y DOCs).
      2. Determinar cuál es el escrito o resolución procesalmente oportuna.
      3. Generar ese documento automáticamente.
      `;
  }

  const parts: any[] = [
      { text: `
    ${documentTypeInstruction}
    
    INSTRUCCIONES ESPECÍFICAS DEL USUARIO:
    ${request.judgeNotes}

    ${specificTemplateGuidance ? `\nIMPORTANTE - SIGUE ESTA ESTRUCTURA DE REFERENCIA:\n${specificTemplateGuidance}` : ''}
    
    REGLAS DE FORMATO (CRÍTICAS E INVIOLABLES):
    1. FORMATO FINAL LISTO PARA IMPRIMIR: El output 'document_content' debe ser el texto íntegro.
    2. RUBRO / ENCABEZADO (IMPORTANTE):
       - Usa Markdown Header 1 (#) línea por línea para: Actor, VS, Demandado, Juicio y Expediente (Esto los alineará a la derecha).
       - Usa Markdown Header 2 (##) para la Autoridad / Juez (Esto lo centrará).
    3. SIN ASUNTOS NI OFICIOS: A menos que seas Autoridad, NO pongas "Asunto:" ni "Oficio No.".
    4. NUMERACIÓN Y LISTAS:
       - HECHOS / ANTECEDENTES: Usa numeración arábiga (1, 2, 3) si es necesario.
       - PUNTOS PETITORIOS / RESOLUTIVOS: USA EXCLUSIVAMENTE "PRIMERO.-", "SEGUNDO.-".
       - ARGUMENTOS: Escribe en PROSA CONTINUA.
    5. CENTRADO DE FIRMAS Y FECHAS (IMPORTANTE):
       - Para centrar el texto de cierre ("Protesto lo Necesario", Lugar y Fecha, Nombre y Firma), DEBES escribir el prefijo "|||" al inicio de la línea.
       - Ejemplo: 
         ||| PROTESTO LO NECESARIO
         ||| [Lugar], a la fecha de su presentación
         ||| LIC. JUAN PÉREZ
    6. FECHA:
       ${request.role === UserRole.POSTULANTE 
           ? '- Usa la frase "a la fecha de su presentación" (con prefijo |||).' 
           : `- Usa la fecha del día de hoy: ${currentDate} (con prefijo |||).`}
      `}
  ];

  if (request.caseFiles && request.caseFiles.length > 0) { 
    try {
      const fileParts = await processFilesForGemini(request.caseFiles);
      parts.push(...fileParts);
    } catch (e: any) {
      console.error("Error reading files:", e);
      throw new Error(`Error al leer los archivos: ${e.message}`);
    }
  }

  try {
    // Structured Output Definition
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        document_content: {
          type: Type.STRING,
          description: "El texto completo y formateado del documento legal (demanda, sentencia, oficio, etc.). Usa Markdown.",
        },
        ratio_decidendi: {
          type: Type.STRING,
          description: "La 'Ratio Decidendi' EXHAUSTIVA. No des una simple explicación. FUNDAMENTA Y MOTIVA detalladamente por qué se eligió esta vía. Cita los principios procesales aplicados, los riesgos que se evitaron y la lógica jurídica profunda detrás de la redacción. Debe servir como una defensa estratégica del documento ante un superior.",
        },
        document_title: {
          type: Type.STRING,
          description: "EL NOMBRE EXACTO DEL DOCUMENTO GENERADO EN MAYÚSCULAS. Sé muy específico acorde al contexto procesal. Ejemplos: 'DEMANDA EJECUTIVA MERCANTIL', 'AUTO DE VINCULACIÓN A PROCESO', 'CONTESTACIÓN DE DEMANDA CIVIL', 'SENTENCIA INTERLOCUTORIA DE GASTOS Y COSTAS'.",
        },
        legal_matter: {
          type: Type.STRING,
          description: "La materia del juicio (CIVIL, PENAL, MERCANTIL, FAMILIAR, LABORAL, ADMINISTRATIVO, CONSTITUCIONAL).",
          enum: ["CIVIL", "PENAL", "MERCANTIL", "FAMILIAR", "LABORAL", "ADMINISTRATIVO", "CONSTITUCIONAL", "INDEFINIDO"]
        }
      },
      required: ["document_content", "ratio_decidendi", "document_title", "legal_matter"]
    };

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: parts },
      config: {
        systemInstruction: selectedInstruction,
        temperature: 0.2, // Reduced temperature for MAGISTRADO AI precision
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: schema
      },
    });

    const jsonText = response.text || "{}";
    let parsedResponse;
    try {
        parsedResponse = JSON.parse(jsonText);
    } catch (e) {
        console.error("JSON Parsing failed", e);
        return {
             text: response.text || "Error en generación",
             matterDetected: LegalMatter.UNKNOWN,
             ratioDecidendi: "",
             documentTitle: "DOCUMENTO GENERADO",
             source: 'AI'
        };
    }

    return {
      text: parsedResponse.document_content,
      ratioDecidendi: parsedResponse.ratio_decidendi,
      documentTitle: parsedResponse.document_title || "DOCUMENTO LEGAL",
      matterDetected: parsedResponse.legal_matter || LegalMatter.UNKNOWN,
      usageMetadata: mapUsageMetadata(response.usageMetadata, modelName),
      source: 'AI'
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("429")) {
        throw new Error("⚠️ Cuota excedida. Por favor espera un momento o contacta al administrador del plan.");
    }
    if (error.message?.includes("400")) {
       throw new Error("Error de solicitud. Verifique el tamaño de los archivos.");
    }
    throw new Error(error.message || "Error al generar el documento.");
  }
};

export const digitizeDocument = async (file: File): Promise<{text: string, usageMetadata?: any, documentTitle: string, source: 'USER'}> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
    const modelName = 'gemini-3-flash-preview';

    const fileName = file.name.toLowerCase();
    const isDocx = fileName.endsWith('.docx');
    const isDoc = fileName.endsWith('.doc');
    const isTxt = fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.rtf') || fileName.endsWith('.json') || fileName.endsWith('.xml');
    
    const syntheticTitle = file.name.toUpperCase().replace(/\.(PDF|DOCX|TXT|DOC)/, '');

    // CASO 1: WORD .DOCX (Lectura Directa Instantánea)
    if (isDocx) {
        try {
            const textContent = await extractTextFromDocx(file);
            return {
                text: textContent,
                usageMetadata: undefined,
                documentTitle: syntheticTitle,
                source: 'USER'
            };
        } catch (e: any) {
             throw new Error(`Error al leer .docx: ${e.message}`);
        }
    } 
    
    // CASO 2: TEXTO PLANO / MARKDOWN / RTF (Lectura Directa Instantánea)
    if (isTxt) {
        try {
            const textContent = await file.text();
            return {
                text: textContent,
                usageMetadata: undefined,
                documentTitle: syntheticTitle,
                source: 'USER'
            };
        } catch (e: any) {
            throw new Error(`Error al leer archivo de texto: ${e.message}`);
        }
    }

    // CASO 3: WORD .DOC ANTIGUO (No Soportado Directamente)
    if (isDoc) {
        throw new Error("El formato .doc (Word 97-2003) no soporta lectura web directa. Por favor guarda como .docx o .txt");
    }

    // CASO 4: PDF / IMAGEN (Requiere IA para OCR - Aquí si hay espera)
    let parts: any[] = [];
    let prompt = "";
    
    try {
        const base64 = await fileToBase64(file);
        prompt = `
        TU TAREA: Transcribir este documento EXACTAMENTE a Markdown.
        
        REGLAS ESTRICTAS (ZERO-SHOT):
        1. OUTPUT SOLO EL TEXTO DEL DOCUMENTO. 
        2. PROHIBIDO escribir "Aquí está el texto", "Claro", o cualquier comentario.
        3. Si hay encabezados, usa #. Si hay negritas, usa **.
        4. NO inventes texto.
        `;
        parts = [
            { text: prompt },
            { inlineData: { mimeType: file.type || 'application/pdf', data: base64 } }
        ];
    } catch (e: any) {
        throw new Error(`Error al leer archivo: ${e.message}`);
    }

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: [{
                role: 'user',
                parts: parts
            }],
            config: { 
                temperature: 0.1,
                maxOutputTokens: 8192
            }
        });

        // Limpieza final por si el modelo desobedece levemente
        let finalText = response.text || "No se pudo extraer texto.";
        finalText = finalText.replace(/^Aquí (tienes|está).+:/i, '').trim();
        finalText = finalText.replace(/```markdown/g, '').replace(/```/g, '').trim();

        return {
            text: finalText,
            usageMetadata: mapUsageMetadata(response.usageMetadata, modelName),
            documentTitle: syntheticTitle,
            source: 'USER'
        };
    } catch (e) {
        console.error("Digitization error", e);
        throw new Error("Error al procesar el documento con IA.");
    }
};

export const generateRatioDecidendi = async (documentText: string, source: 'USER' | 'AI' = 'AI'): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
    const modelName = 'gemini-3-flash-preview';

    // LÓGICA DIFERENCIADA SEGÚN LA FUENTE (USER VS JUXA)
    let prompt = "";
    
    if (source === 'USER') {
        prompt = `
        ACTÚA COMO UN AUDITOR JURÍDICO EXPERTO (O CONTRAPARTE).
        Analiza el siguiente documento PROPORCIONADO POR EL USUARIO y genera un reporte de 'Análisis de Riesgos y Debilidades'.
        DOCUMENTO: "${documentText.substring(0, 30000)}"
        `;
    } else {
        prompt = `
        Analiza el siguiente documento legal GENERADO POR JUXA y genera una 'Ratio Decidendi' o 'Justificación Estratégica' robusta.
        DOCUMENTO: "${documentText.substring(0, 30000)}"
        `;
    }

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { temperature: 0.4 }
        });
        return response.text || "No se pudo generar el análisis.";
    } catch (e) {
        return "Error al generar análisis.";
    }
};

export const performDeepDocumentAnalysis = async (documentText: string, mode: string, customInstruction?: string): Promise<{analysis: string, usageMetadata?: any}> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
    const modelName = 'gemini-3-pro-preview'; // PRO for deep reasoning

    let prompt = "";

    switch(mode) {
        case 'inconsistencias':
            prompt = `
            ACTÚA COMO UN ABOGADO CONTRARIO EXPERTO Y MALICIOSO.
            TU OBJETIVO: Destruir el siguiente documento encontrando cada contradicción, falacia lógica, error de fecha o debilidad probatoria.
            FORMATO: Lista de "Inconsistencias Fatales" y "Debilidades Estratégicas".
            REQUISITO: Justifica por qué cada punto debilita el caso.
            DOCUMENTO: "${documentText.substring(0, 30000)}"
            `;
            break;
        case 'teoria_caso':
            prompt = `
            ACTÚA COMO UN ESTRATEGA LEGAL SENIOR.
            TU OBJETIVO: Extraer la "Teoría del Caso" (Fáctica, Jurídica y Probatoria) del siguiente documento.
            SALIDA:
            1. Proposición Fáctica (Historia).
            2. Proposición Jurídica (Derecho).
            3. Proposición Probatoria (Evidencia).
            4. Análisis de Fortaleza (0-100) con justificación.
            DOCUMENTO: "${documentText.substring(0, 30000)}"
            `;
            break;
        case 'autoridad':
            prompt = `
            ACTÚA COMO JUEZ O AUTORIDAD RESOLUTORA.
            TU OBJETIVO: Simular cómo acordarías o resolverías respecto a este documento si te fuera presentado hoy.
            REGLA DE ORO: Todo debe estar FUNDADO y MOTIVADO.
            SALIDA:
            1. Auto/Resolución Probable (Admite, Previene o Desecha).
            2. Razonamiento Jurídico del Juez (Fundamentación exhaustiva).
            3. Probabilidad de Éxito del promovente.
            DOCUMENTO: "${documentText.substring(0, 30000)}"
            `;
            break;
        case 'custom':
            prompt = `
            ANÁLISIS JURÍDICO PERSONALIZADO.
            INSTRUCCIÓN ESPECÍFICA: "${customInstruction}"
            
            REQUISITO: Sé exhaustivo, crítico y fundamenta tu respuesta legalmente.
            DOCUMENTO: "${documentText.substring(0, 30000)}"
            `;
            break;
        default:
            prompt = `Analiza este documento legal: "${documentText.substring(0, 10000)}"`;
    }

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { temperature: 0.2 }
        });
        return {
            analysis: response.text || "Análisis no disponible.",
            usageMetadata: mapUsageMetadata(response.usageMetadata, modelName)
        };
    } catch (e) {
        throw new Error("Error en análisis profundo.");
    }
};

export const magicEditSentence = async (fullText: string, selectedText: string, instruction: string): Promise<{newText: string, usageMetadata?: any}> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    
    const ai = new GoogleGenAI({ apiKey });
    const modelName = 'gemini-3-flash-preview';

    const prompt = `
    ACTÚA COMO UN EDITOR JURÍDICO EXPERTO.
    CONTEXTO DEL DOCUMENTO COMPLETO: "..." (Se omite por brevedad, asume contexto jurídico)
    TEXTO SELECCIONADO POR EL USUARIO PARA MODIFICAR: "${selectedText}"
    INSTRUCCIÓN DEL USUARIO: "${instruction}"
    TAREA: Reescribe ÚNICAMENTE el texto seleccionado cumpliendo la instrucción.
    `;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { temperature: 0.4 }
        });

        return {
            newText: response.text || selectedText,
            usageMetadata: mapUsageMetadata(response.usageMetadata, modelName)
        };
    } catch (error) {
        console.error("Magic Edit Error", error);
        throw new Error("No se pudo editar el texto.");
    }
};

export const refineArgument = async (currentArgument: string, instruction: string): Promise<{argument: string, usageMetadata?: any}> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
    const modelName = 'gemini-3-flash-preview';

    const prompt = `
    ACTÚA COMO UN ABOGADO EXPERTO EN REDACCIÓN JURÍDICA.
    ARGUMENTO ACTUAL: "${currentArgument}"
    INSTRUCCIÓN DE REFINAMIENTO DEL USUARIO: "${instruction}"
    TAREA: Reescribe el argumento completo aplicando la instrucción del usuario.
    `;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { temperature: 0.4 }
        });

        return {
            argument: response.text || currentArgument,
            usageMetadata: mapUsageMetadata(response.usageMetadata, modelName)
        };
    } catch (error) {
        console.error("Refine Argument Error", error);
        throw new Error("Error al refinar el argumento.");
    }
};

export const generateLegalArgument = async (
    concept: string, 
    strategy: string, 
    branch: string, 
    outputStyle: string,
    tone: string,
    files?: File[]
): Promise<{argument: string, usageMetadata?: any}> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
    const modelName = 'gemini-3-flash-preview';

    // ... prompts setup ...
    const prompt = `
    ACTÚA COMO UN JURISTA EXPERTO DE ALTO NIVEL.
    TAREA: Redactar un ARGUMENTO JURÍDICO a partir de un hecho coloquial.
    DATOS: "${concept}", Rama: ${branch}, Estrategia: ${strategy}, Tono: ${tone}. Estilo: ${outputStyle}.
    `;

    const parts: any[] = [{ text: prompt }];

    if (files && files.length > 0) {
        try {
            const fileParts = await processFilesForGemini(files);
            parts.push(...fileParts);
        } catch (e) {
            console.error("Error attaching argument files:", e);
        }
    }

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: parts }],
            config: { temperature: 0.3, maxOutputTokens: 2048 }
        });

        return {
            argument: response.text || "No se pudo generar el argumento.",
            usageMetadata: mapUsageMetadata(response.usageMetadata, modelName)
        };
    } catch (e) {
        console.error("Argument generation error", e);
        throw new Error("Error al generar argumento.");
    }
};

export const analyzeLegislation = async (documentText: string): Promise<SemanticAnalysisResponse> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
    const modelName = 'gemini-3-flash-preview'; 
    
    const prompt = `
    ACTÚA COMO UN MOTOR DE EXTRACCIÓN Y ANÁLISIS SEMÁNTICO LEGAL.
    
    TAREA:
    1. Identifica qué artículos y leyes se citan o se aplican implícitamente en el texto.
    2. Extrae el fragmento del texto donde se usa.
    3. GENERA UN "RAZONAMIENTO DE APLICABILIDAD": Explica semánticamente por qué esa ley aplica a ese hecho concreto en el documento.
    
    DOCUMENTO: "${documentText.substring(0, 30000)}" 
    
    OUTPUT JSON REQUERIDO: { "citations": [{ "law": "...", "article": "...", "quote": "Fragmento del documento...", "relevance": "Explicación semántica profunda de por qué aplica..." }] }
    `;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    citations: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          law: { type: Type.STRING },
                          article: { type: Type.STRING },
                          quote: { type: Type.STRING },
                          relevance: { type: Type.STRING }
                        }
                      }
                    }
                  }
                }
            }
        });

        const jsonText = response.text || "{}";
        const parsed = JSON.parse(jsonText);
        
        return {
            citations: parsed.citations || [],
            usageMetadata: mapUsageMetadata(response.usageMetadata, modelName)
        };

    } catch (error) {
        console.error("Semantic Analysis Error", error);
        return { citations: [] };
    }
};

export const chatWithSentence = async (currentSentence: string, history: ChatMessage[], newMessage: string, mode: 'chat' | 'analysis', files?: File[]): Promise<{chatResponse: string, documentUpdate?: string}> => {
   const apiKey = process.env.API_KEY;
   if (!apiKey) throw new Error("API Key missing");
   const ai = new GoogleGenAI({ apiKey });
   const modelName = 'gemini-3-flash-preview'; // Chat usually uses Flash for speed

   // ... prompt construction ...
   let systemInstruction = "Eres JUXA ADVISOR...";
   let userPrompt = `Historial: ${JSON.stringify(history.slice(-3))}\n\nUsuario: ${newMessage}`;

   const parts: any[] = [{ text: userPrompt }];
   if (files && files.length > 0) {
       try {
           const fileParts = await processFilesForGemini(files);
           parts.push(...fileParts);
       } catch (e) { console.error("Error attaching chat files:", e); }
   }

   const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: parts }],
      config: { systemInstruction }
   });

   const fullText = response.text || "No se pudo generar respuesta.";
   const startTag = ":::DOC_UPDATE_START:::";
   const endTag = ":::DOC_UPDATE_END:::";
   
   if (fullText.includes(startTag) && fullText.includes(endTag)) {
       const parts = fullText.split(startTag);
       const docParts = parts[1].split(endTag);
       return {
           chatResponse: (parts[0] + (docParts[1] || "")).trim() || "Documento actualizado.",
           documentUpdate: docParts[0].trim()
       };
   }

   return { chatResponse: fullText };
};

export const chatGeneral = async (history: ChatMessage[], newMessage: string, role: UserRole): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
    const modelName = 'gemini-3-flash-preview';

    const baseInstruction = SYSTEM_INSTRUCTIONS_BY_ROLE[role] || "Eres un asistente legal experto.";
    const systemInstruction = `${baseInstruction} \n Estás operando en el modo "JUXA AI" (Chat).`;

    const chatHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    try {
        const chat = ai.chats.create({
            model: modelName,
            config: { systemInstruction },
            history: chatHistory
        });

        const result = await chat.sendMessage({ message: newMessage });
        return result.text;
    } catch (e) {
        console.error("Chat Error", e);
        return "Lo siento, hubo un error al procesar tu consulta.";
    }
};

export const analyzeLegalDocument = async (files: File[], focus: string, role: UserRole): Promise<{analysis: string, usageMetadata?: any}> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
    const modelName = 'gemini-3-pro-preview'; // PRO for deep analysis

    const prompt = `ACTÚA COMO JUXA ANALYTICS. TAREA: Analizar documentos con enfoque: "${focus}".`;
    const parts: any[] = [{ text: prompt }];

    try {
        const fileParts = await processFilesForGemini(files);
        parts.push(...fileParts);
    } catch (e) { throw new Error("Error al leer los archivos."); }

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: parts }],
            config: { temperature: 0.2, maxOutputTokens: 8192 }
        });

        return {
            analysis: response.text || "No se pudo generar el análisis.",
            usageMetadata: mapUsageMetadata(response.usageMetadata, modelName)
        };
    } catch (e) {
        throw new Error("Error al analizar el documento.");
    }
};

// ... generateArgumentGraph can remain mostly same, just update model tracking if used.
export const generateArgumentGraph = async (documentText: string, role: UserRole): Promise<{nodes: any[], edges: any[]}> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
    const modelName = 'gemini-3-flash-preview';

    const prompt = `Analiza este texto y genera el JSON para ReactFlow (nodes y edges): \n\n ${documentText.substring(0, 20000)}`;

    try {
        const response = await ai.models.generateContent({
             model: modelName,
             contents: [{ role: 'user', parts: [{ text: prompt }] }],
             config: { responseMimeType: "application/json" }
        });
        
        const json = JSON.parse(response.text || "{\"nodes\": [], \"edges\": []}");
        return { nodes: json.nodes, edges: json.edges };
    } catch (e) {
        return { nodes: [], edges: [] };
    }
};
