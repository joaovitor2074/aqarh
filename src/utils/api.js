/**
 * =====================================================
 * CONFIGURAÇÃO BASE DA API
 * =====================================================
 * URL base do backend
 * - Usa variável de ambiente (Vite)
 * - Fallback para localhost em desenvolvimento
 */
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.NEXT_PUBLIC_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:3001";

export const API_URL = String(API_BASE_URL).replace(/\/+$/, "");

function isAbsoluteUrl(endpoint = "") {
  return /^https?:\/\//i.test(endpoint);
}

function withLeadingSlash(endpoint = "") {
  return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
}

function normalizeApiEndpoint(endpoint = "") {
  if (isAbsoluteUrl(endpoint)) return endpoint;

  const path = withLeadingSlash(endpoint);

  if (
    path === "/api" ||
    path.startsWith("/api/") ||
    path === "/adminjv" ||
    path.startsWith("/adminjv/")
  ) {
    return path;
  }

  return `/api${path}`;
}

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
    const requestUrl = isAbsoluteUrl(endpoint)
      ? endpoint
      : `${API_URL}${withLeadingSlash(endpoint)}`;

    const response = await fetch(requestUrl, {
      ...options,
      headers,
    });

    /**
     * =====================================================
     * TRATAMENTO DE TOKEN EXPIRADO
     * =====================================================
     */
    const IS_DEV = import.meta.env.DEV;

    if (response.status === 401) {

      if (!IS_DEV) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }

      throw new Error("Erro 401");
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
    const responseText = await response.text();
    if (!responseText) return null;

    try {
      return JSON.parse(responseText);
    } catch {
      return responseText;
    }
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
    const normalizedEndpoint = normalizeApiEndpoint(endpoint);

    return apiRequest(normalizedEndpoint, {
      method: "GET",
      ...options,
    });
  },

  post: (endpoint, data, options = {}) => {
    const normalizedEndpoint = normalizeApiEndpoint(endpoint);

    return apiRequest(normalizedEndpoint, {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...options,
    });
  },

  put: (endpoint, data, options = {}) => {
    const normalizedEndpoint = normalizeApiEndpoint(endpoint);

    return apiRequest(normalizedEndpoint, {
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...options,
    });
  },

  patch: (endpoint, data, options = {}) => {
    const normalizedEndpoint = normalizeApiEndpoint(endpoint);

    return apiRequest(normalizedEndpoint, {
      method: "PATCH",
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...options,
    });
  },

  delete: (endpoint, options = {}) => {
    const normalizedEndpoint = normalizeApiEndpoint(endpoint);

    return apiRequest(normalizedEndpoint, {
      method: "DELETE",
      ...options,
    });
  },
};
