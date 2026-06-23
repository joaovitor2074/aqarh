import { api } from "../utils/api";
import { getLinhaImage } from "../utils/linhaImages";

const EMPTY_RESEARCHERS = "Nenhum pesquisador relacionado";

function uniqueNames(names = []) {
  const seen = new Set();

  return names
    .map((nome) => String(nome || "").trim())
    .filter(Boolean)
    .filter((nome) => {
      const key = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function getPesquisadoresDaLinha(linha = {}) {
  if (Array.isArray(linha.pesquisadores_lista)) {
    return uniqueNames(linha.pesquisadores_lista);
  }

  if (typeof linha.pesquisadores_lista === "string" && linha.pesquisadores_lista.trim()) {
    return uniqueNames(
      linha.pesquisadores_lista
        .split("||")
        .map((nome) => nome.trim())
        .filter(Boolean)
    );
  }

  if (typeof linha.pesquisadores === "string" && linha.pesquisadores.trim()) {
    if (linha.pesquisadores === EMPTY_RESEARCHERS) {
      return [];
    }

    return uniqueNames(
      linha.pesquisadores
        .split(",")
        .map((nome) => nome.trim())
        .filter(Boolean)
    );
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
