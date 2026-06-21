import { Router } from "express";
import {
  listarLinhasPesquisa,
  listarLinhasPesquisaPublicas,
  quantLinhas,
  ultimasLinha,
} from "../controllers/linhas_pesquisas.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { db } from "../config/db.js";

const router = Router();

router.get("/quantidade", quantLinhas);
router.get("/ultimas", ultimasLinha);
router.get("/publicas", listarLinhasPesquisaPublicas);
router.get("/", authMiddleware, listarLinhasPesquisa);

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { nome, grupo, ativo = true } = req.body;

    if (!nome) {
      return res.status(400).json({ message: "Nome da linha e obrigatorio" });
    }

    const [result] = await db.query(
      `
      INSERT INTO linhas_pesquisa (nome, grupo, ativo)
      VALUES (?, ?, ?)
      `,
      [nome.trim(), grupo?.trim() || null, ativo ? 1 : 0]
    );

    res.status(201).json({
      message: "Linha de pesquisa criada com sucesso",
      id: result.insertId,
    });
  } catch (err) {
    console.error("Erro ao criar linha de pesquisa:", err);
    res.status(500).json({ message: "Erro ao criar linha de pesquisa" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, grupo, ativo = true } = req.body;

    if (!nome) {
      return res.status(400).json({ message: "Nome da linha e obrigatorio" });
    }

    await db.query(
      `
      UPDATE linhas_pesquisa
      SET nome = ?, grupo = ?, ativo = ?
      WHERE id = ?
      `,
      [nome.trim(), grupo?.trim() || null, ativo ? 1 : 0, id]
    );

    res.json({ message: "Linha de pesquisa atualizada com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar linha de pesquisa:", err);
    res.status(500).json({ message: "Erro ao atualizar linha de pesquisa" });
  }
});

router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { ativo } = req.body;

    await db.query("UPDATE linhas_pesquisa SET ativo = ? WHERE id = ?", [
      ativo ? 1 : 0,
      id,
    ]);

    res.json({ message: "Status da linha atualizado com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar status da linha:", err);
    res.status(500).json({ message: "Erro ao atualizar status da linha" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "DELETE FROM pesquisador_linha_pesquisa WHERE linha_pesquisa_id = ?",
      [id]
    );
    await db.query("DELETE FROM linhas_pesquisa WHERE id = ?", [id]);

    res.json({ message: "Linha de pesquisa excluida com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir linha de pesquisa:", err);
    res.status(500).json({ message: "Erro ao excluir linha de pesquisa" });
  }
});

export default router;
