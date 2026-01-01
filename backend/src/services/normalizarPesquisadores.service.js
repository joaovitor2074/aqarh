export function normalizarPesquisadores(brutos) {
  return brutos
    .filter(p => p.nome && !p.error)
    .map(p => ({
      nome: p.nome.trim().toUpperCase(),
      titulacao_max: p.titulacao_MAX?.trim() || null,
      data_inclusao: p.data_inclusao || null
    }));
}
