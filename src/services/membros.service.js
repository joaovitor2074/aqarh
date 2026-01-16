import { api } from '../utils/api'

export const membrosService = {
  buscarTodos: (filtros = {}) => {
    const params = new URLSearchParams(filtros)
    const queryString = params.toString()
    const url = `/api/membros${queryString ? `?${queryString}` : ''}`
    return api.get(url)
  },
  
  buscarPorId: (id) => {
    return api.get(`/api/membros/${id}`)
  },
  
  criar: (dados) => {
    return api.post('/api/membros', dados)
  },
  
  atualizar: (id, dados) => {
    return api.put(`/api/membros/${id}`, dados)
  },
  
  deletar: (id) => {
    return api.delete(`/api/membros/${id}`)
  },
  
  buscarEstatisticas: () => {
    return api.get('/api/membros/quantidade')
  }
}