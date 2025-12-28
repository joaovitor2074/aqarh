import { db } from "../config/db.js";

export async function listarMembros(req, res) {
  try {
    const [rows] = await db.query(`
  SELECT
    id,
    nome,
    titulacao_maxima,
    email,
    data_inclusao
  FROM pesquisadores
  ORDER BY nome ASC
`);


    res.json(rows);
  } catch (error) {
    console.error("Erro ao listar pesquisadores:", error);
    res.status(500).json({ message: "Erro ao listar pesquisadores." });
  }
}

export async function criarMembro(req, res) {
  try {
    const { nome, titulacao_maxima, data_inclusao, email } = req.body;

    if (!nome || !titulacao_maxima) {
      return res.status(400).json({
        message: "Nome e titulação máxima são obrigatórios."
      });
    }

    await db.query(
      `
      INSERT INTO pesquisadores (nome, titulacao_maxima, email)
      VALUES (?, ?, ?)
      `,
      [nome.trim(), titulacao_maxima.trim(), email, data_inclusao || null]
    );

    res.status(201).json({ message: "Pesquisador cadastrado com sucesso!" });
  } catch (error) {
    console.error("Erro ao criar pesquisador:", error);
    res.status(500).json({ message: "Erro ao criar pesquisador." });
  }
}
