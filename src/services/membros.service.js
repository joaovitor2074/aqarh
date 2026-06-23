import { api } from '../utils/api'

export const membrosService = {
  buscarTodos: (filtros = {}) => {
    const params = new URLSearchParams(filtros)
    const queryString = params.toString()
    const url = `/membros${queryString ? `?${queryString}` : ''}`
    return api.get(url)
  },
  
  buscarPorId: (id) => {
    return api.get(`/membros/${id}`)
  },
  
  criar: (dados) => {
    return api.post('/membros', dados)
  },
  
  atualizar: (id, dados) => {
    return api.put(`/membros/${id}`, dados)
  },
  
  deletar: (id) => {
    return api.delete(`/membros/${id}`)
  },
  
  buscarEstatisticas: () => {
    return api.get('/membros/quantidade')
  }
}
