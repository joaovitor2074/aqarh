const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    
    console.log('📤 Enviando requisição para:', `${API_URL}${endpoint}`);
    console.log('🔑 Token disponível:', token ? 'Sim' : 'Não');
    
    const isFormData = options.body instanceof FormData;
    
    const headers = {
        ...(!isFormData && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    console.log('📋 Headers:', headers);

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        console.log('📥 Resposta status:', response.status);

        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            throw new Error('Sessão expirada. Faça login novamente.');
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro na resposta:', errorText);
            
            try {
                const error = JSON.parse(errorText);
                throw new Error(error.message || error.error || `Erro ${response.status}`);
            } catch {
                throw new Error(`Erro ${response.status}: ${errorText || response.statusText}`);
            }
        }

        if (response.status === 204) {
            return null;
        }

        return response.json();
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
        throw error;
    }
}

// Helper para métodos comuns - AGORA ADICIONANDO /api AUTOMATICAMENTE
export const api = {
    get: (endpoint, options = {}) => {
        // Adiciona /api se não começar com http
        const normalizedEndpoint = endpoint.startsWith('http') ? endpoint : `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
        return apiRequest(normalizedEndpoint, { method: 'GET', ...options });
    },
    
    post: (endpoint, data, options = {}) => {
        const normalizedEndpoint = endpoint.startsWith('http') ? endpoint : `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
        return apiRequest(normalizedEndpoint, { 
            method: 'POST', 
            body: data instanceof FormData ? data : JSON.stringify(data),
            ...options 
        });
    },
    
    put: (endpoint, data, options = {}) => {
        const normalizedEndpoint = endpoint.startsWith('http') ? endpoint : `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
        return apiRequest(normalizedEndpoint, { 
            method: 'PUT', 
            body: data instanceof FormData ? data : JSON.stringify(data),
            ...options 
        });
    },
    
    patch: (endpoint, data, options = {}) => {
        const normalizedEndpoint = endpoint.startsWith('http') ? endpoint : `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
        return apiRequest(normalizedEndpoint, { 
            method: 'PATCH', 
            body: data instanceof FormData ? data : JSON.stringify(data),
            ...options 
        });
    },
    
    delete: (endpoint, options = {}) => {
        const normalizedEndpoint = endpoint.startsWith('http') ? endpoint : `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
        return apiRequest(normalizedEndpoint, { method: 'DELETE', ...options });
    },
};