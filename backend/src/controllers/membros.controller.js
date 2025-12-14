import { db } from "../config/db.js";

export async function listarMembros(req, res) {
  try {
    const [rows] = await db.query(
      "SELECT * FROM membros WHERE ativo = 1 ORDER BY criado_em DESC"
    );

    res.json(rows);
  } catch (error) {
    console.error("Erro ao listar membros:", error);
    res.status(500).json({ message: "Erro ao listar membros." });
  }
}

export async function criarMembro(req, res) {
  try {
    const { nome, funcao, email } = req.body;

    if (!nome || !funcao) {
      return res
        .status(400)
        .json({ message: "Nome e função são obrigatórios." });
    }

    await db.query(
      "INSERT INTO membros (nome, funcao, email) VALUES (?, ?, ?)",
      [nome, funcao, email]
    );

    res.status(201).json({ message: "Membro cadastrado com sucesso!" });

  } catch (error) {
    console.error("Erro ao criar membro:", error);
    res.status(500).json({ message: "Erro ao criar membro." });
  }
}
