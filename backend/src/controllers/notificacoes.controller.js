import { db } from "../config/db.js";

export async function listarNotificacoes(req, res) {
  const [rows] = await db.query(
    `SELECT id, tipo, status, dados, criado_em
     FROM notificacoes_scraping
     WHERE status = 'pendente'
     ORDER BY criado_em DESC`
  );

  res.json(rows);
}

export async function AprovarNotificacao(dados) {
  try {
    console.log("🟢 Iniciando aprovação de pesquisador:", dados);

    if (!dados) {
      console.log("❌ Dados vazios");
      return false;
    }

    // Garante objeto
    if (typeof dados === "string") {
      dados = JSON.parse(dados);
    }

    const {
      nome,
      titulacao_max,
      data_inclusao
    } = dados;

    if (!nome) {
      console.log("❌ Nome não encontrado nos dados");
      return false;
    }

    // 🔹 Normalização
    const nomeNormalizado = nome.trim().toUpperCase();
    const titulacao = titulacao_max?.trim() || null;
    const data = data_inclusao || null;

    // 🔍 Evita duplicação
    const [[existe]] = await db.query(
      `SELECT id FROM pesquisadores WHERE nome = ?`,
      [nomeNormalizado]
    );

    if (existe) {
      console.log("⚠️ Pesquisador já existe:", nomeNormalizado);
      return true;
    }

    // ✅ Inserção
    await db.query(
      `INSERT INTO pesquisadores
       (nome, titulacao_maxima, data_inclusao)
       VALUES (?, ?, ?)`,
      [nomeNormalizado, titulacao, data]
    );

    console.log("✅ Pesquisador aprovado com sucesso:", nomeNormalizado);
    return true;

  } catch (error) {
    console.error("🔥 Erro ao aprovar pesquisador:", error);
    throw error;
  }
}

export async function AprovarNotificacaoLinha(id) {
  console.log("Iniciando aprovação da linha, id:", id);

  const [[notificacao]] = await db.query(
    `SELECT dados
     FROM notificacoes_scraping
     WHERE id = ? AND tipo = 'NOVA_LINHA' AND status = 'pendente'`,
    [id]
  );

  if (!notificacao) {
    console.log("Nenhuma notificação encontrada");
    return;
  }

  const dados = JSON.parse(notificacao.dados);

  // 🔥 NORMALIZA PARA ARRAY
  const linhas = Array.isArray(dados)
    ? dados
    : dados.linhas
      ? dados.linhas
      : [dados]; // 👈 caso objeto único

  if (!Array.isArray(linhas) || linhas.length === 0) {
    console.log("Nenhuma linha de pesquisa encontrada", dados);
    return;
  }

  for (const linha of linhas) {
    const { nome, grupo, ativo = 1 } = linha;

    if (!nome || !grupo) continue;

    await db.query(
      `INSERT IGNORE INTO linhas_pesquisa (nome, grupo, ativo)
       VALUES (?, ?, ?)`,
      [nome, grupo, ativo]
    );
  }

  await db.query(
    `UPDATE notificacoes_scraping
     SET status = 'aprovado', avaliado_em = NOW()
     WHERE id = ?`,
    [id]
  );

  console.log("Linha(s) aprovada(s) com sucesso");
}
