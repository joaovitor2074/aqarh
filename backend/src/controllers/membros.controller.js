import { db } from "../config/db.js";
import { getQuantidadeMembros } from "../services/getquantidadeMembros.service.js";

export async function quantMembros(req, res) {
    try {
        const total = await getQuantidadeMembros();
        return res.json({ total });
    } catch (err) {
        return res.status(500).json({ message: "Erro interno" });
    }
}



export async function listarMembros(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT 
  p.id,
  p.nome,
  p.email,
  p.ativo,
  p.titulacao_maxima,
  p.data_inclusao,
  p.tipo_vinculo,
  GROUP_CONCAT(lp.nome SEPARATOR ', ') AS linhas_pesquisa
FROM pesquisadores p
LEFT JOIN pesquisador_linha_pesquisa plp
  ON p.id = plp.pesquisador_id
LEFT JOIN linhas_pesquisa lp
  ON lp.id = plp.linha_pesquisa_id
GROUP BY p.id;
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao listar membros" });
  }
}



export async function criarMembro(req, res) {
  try {
    const { nome, titulacao_maxima, email } = req.body;

    if (!nome || !titulacao_maxima) {
      return res.status(400).json({
        message: "Nome e titulação máxima são obrigatórios."
      });
    }

    await db.query(
      `
      INSERT INTO pesquisadores (
        nome,
        titulacao_maxima,
        email,
        tipo_vinculo,
        ativo
      )
      VALUES (?, ?, ?, 'pesquisador', 1)
      `,
      [nome.trim(), titulacao_maxima.trim(), email || null]
    );

    res.status(201).json({ message: "Pesquisador cadastrado com sucesso!" });
  } catch (error) {
    console.error("Erro ao criar pesquisador:", error);
    res.status(500).json({ message: "Erro ao criar pesquisador." });
  }
}

