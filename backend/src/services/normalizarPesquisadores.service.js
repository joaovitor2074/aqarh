export function normalizarPesquisadores(brutos) {
  return brutos
    .filter(p => p.nome && !p.error)
    .map(p => ({
      nome: p.nome.trim().toUpperCase(),
      titulacao_max: p.titulacao_MAX?.trim() || null,
      data_inclusao: p.data_inclusao || null
    }));
}

export function normalizarLinhasPesquisa(brutos) {
  return brutos
    .filter(p => Array.isArray(p.linhas_pesquisa))
    .flatMap(p =>
      p.linhas_pesquisa
        .filter(lp => lp.linha_pesquisa && lp.grupo)
        .map(lp => ({
          nome: lp.linha_pesquisa.trim(),
          grupo: lp.grupo.trim(),
          ativo: 1
        }))
    );
}

