import { db } from "../config/db.js";
import { getQuantidadeLinhas } from "../services/getquantidadeLinhas.service.js";

export async function quantLinhas(req, res) {
  try {
    const total = await getQuantidadeLinhas();
    return res.json({ total });
  } catch (err) {
    return res.status(500).json({ message: "Erro interno" });
  }
}
export async function listarLinhasPesquisa(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT 
  lp.id,
  lp.nome,
  lp.grupo,
  lp.ativo,

  COALESCE(
    GROUP_CONCAT(
      CASE 
        WHEN p.ativo = 1 THEN p.nome
      END
      SEPARATOR ', '
    ),
    'Nenhum pesquisador relacionado'
  ) AS pesquisadores

FROM linhas_pesquisa lp

LEFT JOIN pesquisador_linha_pesquisa plp
  ON plp.linha_pesquisa_id = lp.id

LEFT JOIN pesquisadores p
  ON p.id = plp.pesquisador_id

GROUP BY lp.id
ORDER BY lp.nome ASC;

    `);

    res.json(rows);
  } catch (error) {
    console.error("Erro ao listar linhas de pesquisa:", error);
    res.status(500).json({ message: "Erro ao listar linhas de pesquisa." });
  }
}

