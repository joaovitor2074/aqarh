/**
 * =====================================================
 * CONFIGURAÇÃO BASE DA API
 * =====================================================
 * URL base do backend
 * - Usa variável de ambiente (Vite)
 * - Fallback para localhost em desenvolvimento
 */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * =====================================================
 * FUNÇÃO PRINCIPAL DE REQUISIÇÃO
 * =====================================================
 * Centraliza:
 * - Token JWT
 * - Headers
 * - Tratamento de erros
 * - Redirecionamento em caso de 401
 */
export async function apiRequest(endpoint, options = {}) {
  // Token armazenado localmente após login
  const token = localStorage.getItem("token");

  // Detecta se o body é FormData (uploads)
  const isFormData = options.body instanceof FormData;

  /**
   * =====================================================
   * HEADERS PADRÃO
   * =====================================================
   * - Content-Type só para JSON
   * - Authorization apenas se houver token
   */
  const headers = {
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    /**
     * =====================================================
     * EXECUÇÃO DA REQUISIÇÃO
     * =====================================================
     */
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    /**
     * =====================================================
     * TRATAMENTO DE TOKEN EXPIRADO
     * =====================================================
     */
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    /**
     * =====================================================
     * TRATAMENTO DE ERROS HTTP
     * =====================================================
     */
    if (!response.ok) {
      const errorText = await response.text();

      try {
        const error = JSON.parse(errorText);
        throw new Error(
          error.message || error.error || `Erro ${response.status}`
        );
      } catch {
        throw new Error(
          `Erro ${response.status}: ${errorText || response.statusText}`
        );
      }
    }

    /**
     * =====================================================
     * RESPOSTA SEM CONTEÚDO
     * =====================================================
     */
    if (response.status === 204) {
      return null;
    }

    /**
     * =====================================================
     * RESPOSTA JSON PADRÃO
     * =====================================================
     */
    return response.json();
  } catch (error) {
    console.error("❌ Erro na requisição:", error);
    throw error;
  }
}

/**
 * =====================================================
 * HELPER DE MÉTODOS HTTP
 * =====================================================
 * - Adiciona /api automaticamente
 * - Padroniza métodos (GET, POST, PUT, PATCH, DELETE)
 */
export const api = {
  get: (endpoint, options = {}) => {
    const normalizedEndpoint = endpoint.startsWith("http")
      ? endpoint
      : `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    return apiRequest(normalizedEndpoint, {
      method: "GET",
      ...options,
    });
  },

  post: (endpoint, data, options = {}) => {
    const normalizedEndpoint = endpoint.startsWith("http")
      ? endpoint
      : `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    return apiRequest(normalizedEndpoint, {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...options,
    });
  },

  put: (endpoint, data, options = {}) => {
    const normalizedEndpoint = endpoint.startsWith("http")
      ? endpoint
      : `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    return apiRequest(normalizedEndpoint, {
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...options,
    });
  },

  patch: (endpoint, data, options = {}) => {
    const normalizedEndpoint = endpoint.startsWith("http")
      ? endpoint
      : `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    return apiRequest(normalizedEndpoint, {
      method: "PATCH",
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...options,
    });
  },

  delete: (endpoint, options = {}) => {
    const normalizedEndpoint = endpoint.startsWith("http")
      ? endpoint
      : `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    return apiRequest(normalizedEndpoint, {
      method: "DELETE",
      ...options,
    });
  },
};
