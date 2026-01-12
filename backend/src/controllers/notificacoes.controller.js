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
  console.log("Iniciando aprovação", dados);

  if (!dados) return;

  if (typeof dados === "string") {
    dados = JSON.parse(dados);
  }

  const { nome, titulacao_max, data_inclusao } = dados;
  if (!nome || !titulacao_max || !data_inclusao) return;

  await db.query(
    `INSERT INTO pesquisadores (nome, titulacao_maxima, data_inclusao)
     VALUES (?, ?, ?)`,
    [nome, titulacao_max, data_inclusao]
  );
}




