import { db } from "../config/db.js";

export async function MostrarComunicados(req, res) {
  try {
    const status = req.query.status || "rascunho";

    const [rows] = await db.query(
      `
      SELECT 
        id,
        tipo,
        titulo,
        descricao,
        imagem,
        status,
        criado_em
      FROM comunicados
      WHERE status = ?
      ORDER BY criado_em DESC
      `,
      [status]
    );

    return res.status(200).json({
      total: rows.length,
      comunicados: rows
    });
  } catch (error) {
    console.error("Erro ao listar comunicados:", error);
    return res.status(500).json({
      error: "Erro interno ao listar comunicados"
    });
  }
}





export function mapTipoNotificacaoParaComunicado(tipo) {
  const mapa = {
    NOVO_PESQUISADOR: "pesquisador",
    NOVO_ESTUDANTE: "estudante",
    NOVA_LINHA: "linha"
  };

  return mapa[tipo] || "geral";
}


