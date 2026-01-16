// src/services/comunicados.service.js
import { api } from '../utils/api';

export const comunicadosService = {
    // Buscar comunicados com filtros
    buscarTodos: (filtros = {}) => {
        const params = new URLSearchParams();
        
        if (filtros.status && filtros.status !== 'todos') {
            params.append('status', filtros.status);
        }
        
        if (filtros.tipo && filtros.tipo !== 'todos') {
            params.append('tipo', filtros.tipo);
        }
        
        const queryString = params.toString();
        const url = `/api/comunicados${queryString ? `?${queryString}` : ''}`;
        
        return api.get(url);
    },
    
    // Criar comunicado
    criar: (dados) => {
        if (dados.imagem instanceof File) {
            const formData = new FormData();
            formData.append('titulo', dados.titulo);
            formData.append('descricao', dados.descricao);
            formData.append('tipo', dados.tipo);
            formData.append('imagem', dados.imagem);
            
            return api.post('/api/comunicados', formData);
        }
        
        return api.post('/api/comunicados', dados);
    },
    
    // Atualizar comunicado
    atualizar: (id, dados) => {
        if (dados.novaImagem instanceof File) {
            const formData = new FormData();
            formData.append('titulo', dados.titulo);
            formData.append('descricao', dados.descricao);
            formData.append('tipo', dados.tipo);
            formData.append('imagem', dados.novaImagem);
            
            return api.put(`/api/comunicados/${id}`, formData);
        }
        
        const { novaImagem, ...dadosSemImagem } = dados;
        return api.put(`/api/comunicados/${id}`, dadosSemImagem);
    },
    
    // Ações de status
    ativar: (id) => api.post(`/api/comunicados/${id}/ativar`),
    arquivar: (id) => api.post(`/api/comunicados/${id}/arquivar`),
    reativar: (id) => api.post(`/api/comunicados/${id}/reativar`),
    
    // Deletar comunicado
    deletar: (id) => api.delete(`/api/comunicados/${id}`),
    
    // Estatísticas - NOME CORRETO
    buscarEstatisticas: () => api.get('/api/comunicados/quantidade'),
    
    // Buscar comunicados ativos (público)
    buscarAtivos: () => api.get('/api/comunicados?status=ativo')
};