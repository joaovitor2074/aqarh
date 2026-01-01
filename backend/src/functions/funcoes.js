function normalizarPesquisadores(lista) {
  return lista.map(item => ({
    nome: item.nome?.trim(),
    titulacao_maxima: item.titulacao_MAX ?? null,
    data_inclusao: formatarData(item.data_inclusao),
  })).filter(p => p.nome);
}

function formatarData(data) {
  if (!data) return null;
  const [dia, mes, ano] = data.split("/");
  return `${ano}-${mes}-${dia}`;
}
export { normalizarPesquisadores };
