import { api } from '../utils/api';

export const comunicadosService = {
    // Buscar comunicados com filtros
    buscarTodos: async (filtros = {}) => {
        const params = new URLSearchParams();
        
        if (filtros.status && filtros.status !== 'todos') {
            params.append('status', filtros.status);
        }
        
        if (filtros.tipo && filtros.tipo !== 'todos') {
            params.append('tipo', filtros.tipo);
        }
        
        const queryString = params.toString();
        const url = `/comunicados${queryString ? `?${queryString}` : ''}`;
        
        const data = await api.get(url);
        return data;
    },
    
    // Criar comunicado
    criar: async (dados) => {
        const formData = new FormData();
        formData.append('titulo', dados.titulo || '');
        formData.append('descricao', dados.descricao || '');
        formData.append('tipo', dados.tipo || 'estudante');
        
        if (dados.imagem instanceof File) {
            formData.append('imagem', dados.imagem);
        }
        
        const data = await api.post('/comunicados', formData);
        return data;
    },
    
    // Atualizar comunicado
    atualizar: async (id, dados) => {
        console.log("🔄 Atualizando comunicado:", { id, dados });
        
        // Se tiver nova imagem, usa FormData
        if (dados.novaImagem instanceof File) {
            const formData = new FormData();
            formData.append('titulo', dados.titulo || '');
            formData.append('descricao', dados.descricao || '');
            formData.append('tipo', dados.tipo || 'estudante');
            formData.append('imagem', dados.novaImagem);
            
            console.log("📤 Enviando FormData com imagem");
            const data = await api.put(`/comunicados/${id}`, formData);
            return data;
        }
        
        // Se não tiver nova imagem, envia como JSON normal
        const dadosParaEnviar = {
            titulo: dados.titulo || '',
            descricao: dados.descricao || '',
            tipo: dados.tipo || 'estudante'
        };
        
        // Se o frontend indicou para usar imagem default
        if (dados.usarImagemDefault) {
            dadosParaEnviar.usarImagemDefault = true;
        }
        
        console.log("📤 Enviando JSON:", dadosParaEnviar);
        const data = await api.put(`/comunicados/${id}`, dadosParaEnviar);
        return data;
    },
    
    // Ações de status
    ativar: async (id) => {
        const data = await api.post(`/comunicados/${id}/ativar`);
        return data;
    },
    
    arquivar: async (id) => {
        const data = await api.post(`/comunicados/${id}/arquivar`);
        return data;
    },
    
    reativar: async (id) => {
        const data = await api.post(`/comunicados/${id}/reativar`);
        return data;
    },
    
    // Deletar comunicado
    deletar: async (id) => {
        const data = await api.delete(`/comunicados/${id}`);
        return data;
    },
    
    // Estatísticas
    buscarEstatisticas: async () => {
        const data = await api.get('/comunicados/quantidade');
        return data;
    },
    
    // Buscar comunicados ativos (público) - CORRIGIDO
    buscarAtivos: async () => {
        try {
            console.log('🔍 Iniciando busca de comunicados ativos...')
            const url = '/comunicados?status=ativo'
            console.log('📡 Fazendo requisição para:', url)
            
            const data = await api.get(url)
            console.log('✅ Dados recebidos:', data)
            console.log('📦 Comunicados recebidos:', data.comunicados)
            console.log('📊 Total:', data.total)
            
            return data
        } catch (error) {
            console.error('❌ Erro ao buscar comunicados ativos:', error)
            throw error
        }
    }
};