// authInterceptor.js - versão corrigida
import { api } from './api';

export function setupInterceptor() {
    // Não precisamos modificar a api aqui, pois já tratamos o 401 no apiRequest
    console.log('✅ Interceptor configurado');
}

// Inicializar o interceptor
setupInterceptor();