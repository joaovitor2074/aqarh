import { API_URL, api } from "../utils/api";

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

function resolveMemberImage(membro, index = 0) {
  const imagePath = membro.imagem || membro.imagem_url;

  if (!imagePath) return getMemberImage(index);

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  if (imagePath.startsWith("/uploads/") || imagePath.startsWith("/img/defaults/")) {
    return `${API_URL}${imagePath}`;
  }

  return imagePath;
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

function uniqueList(values = []) {
  const seen = new Set();

  return values
    .flatMap((value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === "string") return value.split(/\s*;\s*|\n+/);
      return [value];
    })
    .map((value) => {
      if (typeof value === "string") return value.trim();
      return value;
    })
    .filter((value) => {
      const text = typeof value === "string" ? value : JSON.stringify(value);
      const key = text.toLowerCase();
      if (!text || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function normalizeObjectList(values = [], fields = []) {
  return uniqueList(values)
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;

      return fields.reduce((acc, field) => {
        acc[field] = item[field] || "";
        return acc;
      }, {});
    })
    .filter((item) => item && Object.values(item).some(Boolean));
}

function normalizeLattesDetails(dadosLattes = {}) {
  const dadosEspelho = dadosLattes?.dados_espelho || {};

  return {
    status: dadosLattes?.coleta_lattes_status || "",
    statusMensagem: dadosLattes?.coleta_lattes_mensagem || "",
    coletadoEm: dadosLattes?.pagina_lattes_coletada_em || "",
    nomeCitacoes: uniqueList([
      dadosLattes?.nome_citacoes,
      dadosEspelho?.nome_citacoes,
      dadosEspelho?.nomes_citacao,
    ]),
    formacaoAcademica: uniqueList(dadosLattes?.formacao_academica),
    formacaoComplementar: uniqueList(dadosLattes?.formacao_complementar),
    atuacaoProfissional: uniqueList(dadosLattes?.atuacao_profissional),
    areasAtuacao: uniqueList([dadosLattes?.areas_atuacao, dadosEspelho?.areas_atuacao]),
    linhasPesquisaLattes: uniqueList([
      dadosLattes?.linhas_pesquisa_lattes,
      dadosEspelho?.linhas_pesquisa?.map((linha) => linha.linha_pesquisa || linha.nome),
    ]),
    projetosPesquisa: uniqueList([
      dadosLattes?.projetos_pesquisa,
      dadosLattes?.projetos_extensao,
      dadosLattes?.projetos_desenvolvimento,
    ]),
    producoesBibliograficas: uniqueList([
      dadosLattes?.producoes_bibliograficas,
      dadosLattes?.artigos_publicados,
      dadosLattes?.capitulos_livros,
      dadosLattes?.trabalhos_eventos,
    ]),
    producoesTecnicas: uniqueList(dadosLattes?.producoes_tecnicas),
    orientacoes: uniqueList([
      dadosLattes?.orientacoes,
      dadosLattes?.orientacoes_concluidas,
      dadosLattes?.orientacoes_em_andamento,
    ]),
    bancas: uniqueList(dadosLattes?.bancas),
    eventos: uniqueList(dadosLattes?.eventos),
    educacaoPopularizacao: uniqueList(dadosLattes?.educacao_popularizacao),
    gruposDgp: normalizeObjectList(dadosEspelho?.grupos_pesquisa, [
      "nome",
      "instituicao",
      "perfil",
    ]),
    estudantesOrientados: normalizeObjectList(dadosEspelho?.estudantes_orientados, [
      "nome",
      "nivel_treinamento",
      "grupo_pesquisa",
    ]),
    gruposEgresso: normalizeObjectList(dadosEspelho?.grupos_egresso, [
      "nome",
      "instituicao",
    ]),
    bolsistaCnpq: dadosEspelho?.bolsista_cnpq || "",
    homepage: dadosEspelho?.homepage || "",
    indicadoresProducaoDisponiveis: Boolean(dadosEspelho?.indicadores_producao_disponiveis),
  };
}

export function normalizarMembroPublico(membro = {}, index = 0) {
  const linhasPesquisa = Array.isArray(membro.linhas_pesquisa)
    ? membro.linhas_pesquisa
    : [];
  const gruposPesquisa = Array.isArray(membro.grupos_pesquisa)
    ? membro.grupos_pesquisa
    : [];
  const dadosLattes = parseDadosLattes(membro.dados_lattes);
  const detalhesLattes = normalizeLattesDetails(dadosLattes);

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
    imagem: resolveMemberImage(membro, index),
    lattesUrl: membro.lattes_url || dadosLattes?.lattes_url || "",
    espelhoUrl: membro.espelho_url || "",
    idLattes: membro.id_lattes || dadosLattes?.id_lattes || "",
    ultimaAtualizacaoLattes:
      membro.ultima_atualizacao_lattes || dadosLattes?.ultima_atualizacao_lattes || "",
    orcid: membro.orcid || "",
    instituicao: membro.instituicao || "",
    cargo: membro.cargo || "",
    resumo: dadosLattes?.resumo_lattes || "",
    detalhesLattes,
    dadosLattes,
  };
}

export async function carregarMembrosPublicos() {
  const data = await api.get("/membros/publicos");
  return (Array.isArray(data) ? data : []).map(normalizarMembroPublico);
}
