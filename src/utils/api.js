/**
 * =====================================================
 * CONFIGURAÇÃO BASE DA API
 * =====================================================
 * URL base do backend
 * - Usa variável de ambiente (Vite)
 * - Fallback para localhost em desenvolvimento
 */
import { clearSession, getStoredToken } from "./auth";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.NEXT_PUBLIC_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:3001";

export const API_URL = String(API_BASE_URL).replace(/\/+$/, "");
let redirectingToLogin = false;

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

async function readResponseBody(response) {
  if (response.status === 204) return null;

  const responseText = await response.text();
  if (!responseText) return null;

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
}

function getErrorMessage(body, status) {
  if (typeof body === "string" && body.trim()) return body;

  return body?.message || body?.error || `Erro ${status}`;
}

function isLoginRequest(requestUrl) {
  try {
    return new URL(requestUrl).pathname === "/api/login";
  } catch {
    return false;
  }
}

function redirectToLogin() {
  clearSession();

  if (
    typeof window === "undefined" ||
    window.location.pathname === "/login" ||
    redirectingToLogin
  ) {
    return;
  }

  redirectingToLogin = true;
  window.location.replace("/login?session=expired");
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
  const token = getStoredToken();

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
    const responseBody = await readResponseBody(response);

    /**
     * =====================================================
     * TRATAMENTO DE TOKEN EXPIRADO
     * =====================================================
     */
    if (response.status === 401) {
      const message = getErrorMessage(responseBody, response.status);

      if (!isLoginRequest(requestUrl)) {
        redirectToLogin();
        throw new Error("Sua sessao expirou. Entre novamente.");
      }

      throw new Error(message);
    }

    /**
     * =====================================================
     * TRATAMENTO DE ERROS HTTP
     * =====================================================
     */
    if (!response.ok) {
      throw new Error(getErrorMessage(responseBody, response.status));
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
    return responseBody;
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
