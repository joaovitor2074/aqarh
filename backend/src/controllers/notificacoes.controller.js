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
