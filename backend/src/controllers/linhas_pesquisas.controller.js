import { db } from "../config/db.js";

export async function listarLinhasPesquisa(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT 
        lp.id,
        lp.nome,
        lp.grupo,
        lp.ativo,
        GROUP_CONCAT(p.nome SEPARATOR ', ') AS pesquisadores
      FROM linhas_pesquisa lp
      JOIN pesquisador_linha_pesquisa plp 
        ON plp.linha_pesquisa_id = lp.id
      JOIN pesquisadores p 
        ON p.id = plp.pesquisador_id
      GROUP BY lp.id
      ORDER BY lp.nome ASC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Erro ao listar linhas de pesquisa:", error);
    res.status(500).json({ message: "Erro ao listar linhas de pesquisa." });
  }
}
