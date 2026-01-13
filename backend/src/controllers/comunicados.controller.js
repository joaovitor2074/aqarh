import { db } from "../config/db.js";

export async function MostrarComunicados(req, res) {
  try {
    const [rows] = await db.query(
      `
      SELECT id, tipo, titulo, descricao, imagem
      FROM comunicados
      WHERE status = 'rascunho'
      ORDER BY criado_em DESC
      `
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao buscar comunicados ativos:", error);
    return res.status(500).json({
      error: "Erro interno ao buscar comunicados"
    });
  }
}


export async function criarComunicado({ tipo, titulo, descricao, imagem = null }) {
  await db.query(
    `
    INSERT INTO comunicados (tipo, titulo, descricao, imagem, status)
    VALUES (?, ?, ?, ?, 'rascunho')
    `,
    [tipo, titulo, descricao, imagem]
  );
}

export function mapTipoNotificacaoParaComunicado(tipo) {
  switch (tipo) {
    case "NOVO_PESQUISADOR":
      return "pesquisador";
    case "NOVO_ESTUDANTE":
      return "estudante";
    case "NOVA_LINHA":
      return "linha";
    default:
      return null;
  }
}

