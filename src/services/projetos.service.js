import { api } from "../utils/api";

function buildQuery(filtros = {}) {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "todos") {
      params.append(key, value);
    }
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}

function buildFormData(dados = {}) {
  const formData = new FormData();

  formData.append("titulo", dados.titulo || "");
  formData.append("descricao", dados.descricao || "");
  formData.append("status", dados.status || "Planejado");
  formData.append("ano", dados.ano || "");
  formData.append("area", dados.area || "");
  formData.append("linha_pesquisa_id", dados.linha_pesquisa_id || "");
  formData.append("coordenador_id", dados.coordenador_id || "");
  formData.append("orcamento", dados.orcamento || "");
  formData.append("mostrar_orcamento_publico", dados.mostrar_orcamento_publico ? "1" : "0");
  formData.append("link_externo", dados.link_externo || "");
  formData.append("resultados", dados.resultados || "");
  formData.append("ativo", dados.ativo ? "1" : "0");
  formData.append("estudante_ids", JSON.stringify(dados.estudante_ids || []));
  formData.append("parceiros", JSON.stringify(dados.parceiros || []));

  if (typeof File !== "undefined" && dados.imagem instanceof File) {
    formData.append("imagem", dados.imagem);
  }

  return formData;
}

export const projetosService = {
  buscarPublicos: async (filtros = {}) => {
    return api.get(`/projetos${buildQuery(filtros)}`);
  },

  buscarAdmin: async (filtros = {}) => {
    return api.get(`/projetos/admin${buildQuery(filtros)}`);
  },

  buscarEstatisticas: async () => {
    return api.get("/projetos/quantidade");
  },

  criar: async (dados) => {
    return api.post("/projetos", buildFormData(dados));
  },

  atualizar: async (id, dados) => {
    return api.put(`/projetos/${id}`, buildFormData(dados));
  },

  alterarVisibilidade: async (id, ativo) => {
    return api.patch(`/projetos/${id}/visibilidade`, { ativo });
  },

  deletar: async (id) => {
    return api.delete(`/projetos/${id}`);
  },
};
