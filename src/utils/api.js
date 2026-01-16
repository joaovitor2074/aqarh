const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    
    // Determinar se precisa do Content-Type JSON
    const isFormData = options.body instanceof FormData;
    
    const headers = {
        // Só adiciona Content-Type JSON se não for FormData
        ...(!isFormData && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        // Tenta obter a mensagem de erro do servidor
        try {
            const error = await response.json();
            throw new Error(error.message || error.error || `Erro ${response.status}: ${response.statusText}`);
        } catch {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
    }

    // Algumas respostas podem não ter corpo (204 No Content)
    if (response.status === 204) {
        return null;
    }

    return response.json();
}

// Helper para métodos comuns
export const api = {
    get: (endpoint, options = {}) => apiRequest(endpoint, { method: 'GET', ...options }),
    
    post: (endpoint, data, options = {}) => 
        apiRequest(endpoint, { 
            method: 'POST', 
            body: data instanceof FormData ? data : JSON.stringify(data),
            ...options 
        }),
    
    put: (endpoint, data, options = {}) => 
        apiRequest(endpoint, { 
            method: 'PUT', 
            body: data instanceof FormData ? data : JSON.stringify(data),
            ...options 
        }),
    
    patch: (endpoint, data, options = {}) => 
        apiRequest(endpoint, { 
            method: 'PATCH', 
            body: data instanceof FormData ? data : JSON.stringify(data),
            ...options 
        }),
    
    delete: (endpoint, options = {}) => 
        apiRequest(endpoint, { method: 'DELETE', ...options }),
};

// Helper específico para endpoints sem /api (legado)
export const apiLegacy = {
    get: (endpoint, options = {}) => apiRequest(`/api${endpoint}`, { method: 'GET', ...options }),
    post: (endpoint, data, options = {}) => 
        apiRequest(`/api${endpoint}`, { 
            method: 'POST', 
            body: data instanceof FormData ? data : JSON.stringify(data),
            ...options 
        }),
    // ... outros métodos se necessário
};