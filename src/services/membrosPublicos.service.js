import { api } from "../utils/api";

const MEMBER_IMAGES = [
  "/img/equiperetrato.jpeg",
  "/img/equiperetrato2.jpeg",
  "/img/laboratorioretrato1.jpeg",
  "/img/microscopioretrato3.jpeg",
  "/img/microcopioretrato1.jpeg",
  "/img/microcopioretrato2.jpeg",
  "/img/orgaosretrato.jpeg",
  "/img/orgaosretrato2.jpeg",
];

function getMemberImage(index = 0) {
  return MEMBER_IMAGES[index % MEMBER_IMAGES.length];
}

function parseDadosLattes(value) {
  if (!value) return null;
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function normalizarMembroPublico(membro = {}, index = 0) {
  const linhasPesquisa = Array.isArray(membro.linhas_pesquisa)
    ? membro.linhas_pesquisa
    : [];
  const gruposPesquisa = Array.isArray(membro.grupos_pesquisa)
    ? membro.grupos_pesquisa
    : [];
  const dadosLattes = parseDadosLattes(membro.dados_lattes);

  return {
    id: membro.id || `${membro.nome}-${index}`,
    nome: membro.nome || "Membro do GIEPI",
    email: membro.email || "",
    ativo: membro.ativo !== false && membro.ativo !== 0,
    tipoVinculo: membro.tipo_vinculo || "pesquisador",
    titulacao: membro.titulacao_maxima || "Formacao nao informada",
    dataInclusao: membro.data_inclusao || null,
    linhasPesquisa,
    gruposPesquisa,
    areaPrincipal: linhasPesquisa[0] || gruposPesquisa[0] || "Sem linha vinculada",
    imagem: membro.imagem_url || membro.imagem || getMemberImage(index),
    lattesUrl: membro.lattes_url || dadosLattes?.lattes_url || "",
    espelhoUrl: membro.espelho_url || "",
    idLattes: membro.id_lattes || dadosLattes?.id_lattes || "",
    ultimaAtualizacaoLattes:
      membro.ultima_atualizacao_lattes || dadosLattes?.ultima_atualizacao_lattes || "",
    orcid: membro.orcid || "",
    instituicao: membro.instituicao || "",
    cargo: membro.cargo || "",
    resumo: dadosLattes?.resumo_lattes || "",
    dadosLattes,
  };
}

export async function carregarMembrosPublicos() {
  const data = await api.get("/membros/publicos");
  return (Array.isArray(data) ? data : []).map(normalizarMembroPublico);
}
