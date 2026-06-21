import { api } from "../utils/api";
import { getLinhaImage } from "../utils/linhaImages";

const EMPTY_RESEARCHERS = "Nenhum pesquisador relacionado";

export function getPesquisadoresDaLinha(linha = {}) {
  if (Array.isArray(linha.pesquisadores_lista)) {
    return linha.pesquisadores_lista.filter(Boolean);
  }

  if (typeof linha.pesquisadores_lista === "string" && linha.pesquisadores_lista.trim()) {
    return linha.pesquisadores_lista
      .split("||")
      .map((nome) => nome.trim())
      .filter(Boolean);
  }

  if (typeof linha.pesquisadores === "string" && linha.pesquisadores.trim()) {
    if (linha.pesquisadores === EMPTY_RESEARCHERS) {
      return [];
    }

    return linha.pesquisadores
      .split(",")
      .map((nome) => nome.trim())
      .filter(Boolean);
  }

  return [];
}

export function normalizarLinhaPublica(linha = {}, index = 0) {
  const pesquisadores = getPesquisadoresDaLinha(linha);
  const nome = linha.nome || "Linha de pesquisa";
  const grupo = linha.grupo || "Area nao informada";

  return {
    id: linha.id || `${nome}-${index}`,
    nome,
    grupo,
    ativo: linha.ativo !== false && linha.ativo !== 0,
    pesquisadores,
    totalPesquisadores: Number(linha.total_pesquisadores ?? pesquisadores.length ?? 0),
    image: getLinhaImage([nome, grupo, pesquisadores.join(" ")], index),
  };
}

export async function carregarLinhasPublicas() {
  const data = await api.get("/linhas-pesquisa/publicas");
  return (Array.isArray(data) ? data : []).map(normalizarLinhaPublica);
}
