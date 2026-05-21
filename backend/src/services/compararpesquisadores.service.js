export function detectarNovosPesquisadores(normalizados, banco) {
  const nomesBanco = new Set(
    banco.map(p => p.nome.trim().toUpperCase())
  );

  return normalizados.filter(
    p => !nomesBanco.has(p.nome)
  );
}
