const RAW_BASE = import.meta.env.VITE_API_BASE_URL || "https://back-legaladvice-284685729356.us-central1.run.app";
const API_BASE = `${RAW_BASE.replace(/\/+$/, "")}/api`;

export const ApiService = {
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      // Agregamos BASE_URL al inicio de la ruta
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      // Buena práctica: Revisar si el back devolvió un error (ej. 401 Contraseña incorrecta)
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Credenciales inválidas');
      }

      return response.json();
    },

    register: async (userData: { name: string; email: string; password: string; phone: string }) => {
      // Agregamos API_BASE al inicio de la ruta
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al registrar el usuario');
      }

      return response.json();
    },
  },
};