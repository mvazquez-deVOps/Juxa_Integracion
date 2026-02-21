// services/api.ts
/// <reference types="vite/client" />

// Normalizamos la URL base eliminando barras finales si existen
const RAW_BASE = import.meta.env.VITE_API_BASE_URL || "https://back-legaladvice-284685729356.us-central1.run.app";
const API_BASE = `${RAW_BASE.replace(/\/+$/, "")}/api`;

/** * Utilidades para el Token de Sesión 
 **/
function saveToken(token: string) {
  localStorage.setItem("juxa_token", token); // Usamos el nombre juxa_token para consistencia con AuthView
}

function getToken(): string | null {
  return localStorage.getItem("juxa_token");
}

/**
 * Helper para headers de autenticación
 **/
const getAuthHeader = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

export const ApiService = {
  auth: {
    /** LOGIN TRADICIONAL **/
    login: async (credentials: { email: string; password: string }) => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) throw new Error(`Login failed: ${response.status}`);
      const data = await response.json();
      if (data.token || data.accessToken) saveToken(data.token || data.accessToken);
      return data;
    },

    /** LOGIN CON GOOGLE **/
    googleLogin: async (googleToken: string) => {
      const response = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: googleToken }),
      });

      if (!response.ok) throw new Error("Error en la autenticación con Google");
      const data = await response.json();
      if (data.token || data.accessToken) saveToken(data.token || data.accessToken);
      return data;
    },

    /** REGISTRO DE USUARIO **/
    register: async (userData: any) => {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error("Error en el registro");
      return await response.json();
    },

    /** OBTENER PERFIL (Requerido por la lógica de background en AuthView) **/
    getUserProfile: async (userId: string) => {
      const response = await fetch(`${API_BASE}/auth/profile/${userId}`, {
        method: "GET",
        headers: getAuthHeader(),
      });
      if (!response.ok) return null;
      return await response.json();
    }
  },

  denuncias: {
    enviar: async (data: any) => {
      const token = localStorage.getItem("juxa_token");
      
      try {
        const response = await fetch(`${API_BASE}/denuncias/enviar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Si el usuario está logueado, enviamos el token
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Error al procesar la denuncia en el servidor");
        }

        return await response.json();
      } catch (error) {
        console.error("Error en ApiService.denuncias.enviar:", error);
        throw error;
      }
    },
  },
};

/** Servicio de Chat (Mantenemos tu lógica de archivos) **/
    export const chatService = {
      async sendMessage(content: string, file?: File, userData?: any, historyPayload?: any[]) {
        const token = getToken();
        const formData = new FormData();
        formData.append("userData", JSON.stringify(userData || {name: "Invitado", subcategory: "General" }));
        formData.append("history", JSON.stringify(historyPayload || []));
        formData.append("message", content);
        // 3. Si hay un archivo (PDF/Word), lo adjuntamos
        if (file) {
          formData.append("file", file);
        }

        try {
          const response = await fetch(`${API_BASE}/ai/chat`, {
            method: "POST",
            headers: {
              // IMPORTANTE: No pongas 'Content-Type', el navegador lo hace solo para FormData
              ...(token && token !== "null" ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
          });
           if (response.status === 429) {
            throw new Error("LIMIT_REACHED");
        }

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

    
          if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error:", response.status, errorText);
            throw new Error(`Error del servidor: ${response.status}`);
          }

          const data = await response.json();

          // 4. Retorno estructurado para que App.tsx no se rompa
          return {
            text: data.text || "Lo siento, no pude procesar la respuesta legal.",
            suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
            suggestedPrompts: Array.isArray(data.suggestedPrompts) ? data.suggestedPrompts : [], 
            downloadPdf: data.downloadPdf || false
          };

        } catch (error) {
          console.error("Error en el servicio de chat:", error);
          throw error;
        }
      },
      // GENERADOR DE PROMPTS
      async getSuggestedPrompts(content: string, historyPayload: any[], userData: any) {
        const token = localStorage.getItem("juxa_token");
        try {
          const response = await fetch(`${API_BASE}/ai/suggested-prompts`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { "Authorization": `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              message: content,
              history: historyPayload,
              userData: userData
            }),
          });

          if (!response.ok) return [];
          return await response.json(); // Se espera que devuelva string[]
        } catch (error) {
          console.error("Error al obtener prompts sugeridos:", error);
          return [];
        }
      },
    };