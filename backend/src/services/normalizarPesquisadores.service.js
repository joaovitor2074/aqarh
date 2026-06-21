import {db} from "../config/db.js"

function normalizarDadosLattes(p = {}) {
  if (p.dados_lattes && typeof p.dados_lattes === "object") {
    return p.dados_lattes;
  }

  const dados = {
    lattes_url: p.lattes_url || p.lattesUrl || null,
    id_lattes: p.id_lattes || null,
    nome_citacoes: p.nome_citacoes || null,
    resumo_lattes: p.resumo_lattes || null,
    ultima_atualizacao_lattes: p.ultima_atualizacao_lattes || null,
    linhas_pesquisa_lattes: p.linhas_pesquisa_lattes || [],
  };

  return Object.values(dados).some((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  )
    ? dados
    : null;
}

export function normalizarPesquisadores(brutos) {
  return brutos
    .filter(p => p.nome && !p.error)
    .map(p => ({
      nome: p.nome.trim().toUpperCase(),
      titulacao_max: p.titulacao_MAX?.trim() || null,
      data_inclusao: p.data_inclusao || null,
      email: p.email || null,
      espelho_url: p.espelho_url || p.espelhoUrl || null,
      lattes_url: p.lattes_url || p.lattesUrl || null,
      id_lattes: p.id_lattes || null,
      ultima_atualizacao_lattes: p.ultima_atualizacao_lattes || null,
      resumo_lattes: p.resumo_lattes || null,
      nome_citacoes: p.nome_citacoes || null,
      dados_lattes: normalizarDadosLattes(p),
      linhas_pesquisa: Array.isArray(p.linhas_pesquisa) ? p.linhas_pesquisa : [],
      scraping_erros: Array.isArray(p.scraping_erros) ? p.scraping_erros : []
    }));
}


export function normalizarLinhasPesquisa(brutos) {
  return brutos
    .filter(p => Array.isArray(p.linhas_pesquisa))
    .flatMap(p =>
      p.linhas_pesquisa
        .filter(lp => lp.linha_pesquisa && lp.grupo)
        .map(lp => ({
          nome: lp.linha_pesquisa?.trim(),
          grupo: lp.grupo?.trim(),
          ativo: 1
        }))
        .filter(l => l.nome && l.grupo)

    );
}

export function deduplicarLinhas(linhas) {
  const mapa = new Map();

  for (const linha of linhas) {
    if (!linha?.nome || !linha?.grupo) continue;

    const chave = `${linha.nome.trim().toLowerCase()}|${linha.grupo.trim().toLowerCase()}`;

    if (!mapa.has(chave)) {
      mapa.set(chave, linha);
    }
  }

  return Array.from(mapa.values());
}

export function detectarNovasLinhas(lattes, banco) {
  const setBanco = new Set(
    banco.map(
      l => `${l.nome.trim().toLowerCase()}|${l.grupo.trim().toLowerCase()}`
    )
  );

  return lattes.filter(linha => {
    const chave = `${linha.nome.trim().toLowerCase()}|${linha.grupo.trim().toLowerCase()}`;
    return !setBanco.has(chave);
  });
}


export async function vincularPesquisadorLinhas(dados) {
  for (const item of dados) {

    const [[pesquisador]] = await db.query(
      `SELECT id FROM pesquisadores WHERE nome = ?`,
      [item.pesquisador_nome || item.nome]
    );

    if (!pesquisador) continue;

    for (const linha of item.linhas_pesquisa || item.linhas) {

      const [[lp]] = await db.query(
        `SELECT id FROM linhas_pesquisa WHERE nome = ? AND grupo = ?`,
        [linha.linha_pesquisa || linha.nome, linha.grupo]
      );

      if (!lp) continue;

      await db.query(
        `INSERT IGNORE INTO pesquisador_linha_pesquisa
         (pesquisador_id, linha_pesquisa_id)
         VALUES (?, ?)`,
        [pesquisador.id, lp.id]
      );
    }
  }
}

export function normalizarVinculos(brutos) {
  return brutos
    .filter(p => p.nome && Array.isArray(p.linhas_pesquisa))
    .map(p => ({
      pesquisador_nome: p.nome.trim().toUpperCase(),
      linhas_pesquisa: p.linhas_pesquisa
        .filter(lp => lp.linha_pesquisa && lp.grupo)
        .map(lp => ({
          linha_pesquisa: lp.linha_pesquisa.trim(),
          grupo: lp.grupo.trim()
        }))
    }));
}


