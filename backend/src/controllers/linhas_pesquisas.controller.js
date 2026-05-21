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


export async function ultimasLinha(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM linhas_pesquisa
      ORDER BY created_at DESC
      LIMIT 3
    `);

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao buscar últimas linhas:", error);
    return res.status(500).json({
      message: "Erro ao buscar as últimas linhas de pesquisa"
    });
  }
}


