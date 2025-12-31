import { Router } from "express";
import {
  listarMembros,
  criarMembro,
  quantMembros
} from "../controllers/membros.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { db } from "../config/db.js";

const router = Router();

router.get("/", authMiddleware, listarMembros);
router.get("/quantidade",  quantMembros)
router.post("/", authMiddleware, criarMembro);

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM pesquisadores WHERE id = ?", [id]);
    res.json({ message: "Pesquisador excluído com sucesso" });
  } catch (err) {
    res.status(500).json({ message: "Erro ao excluir pesquisador" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, titulacao_maxima,data_inclusao, email } = req.body;

    if (!nome || !titulacao_maxima) {
      return res.status(400).json({
        message: "Nome e titulação máxima são obrigatórios"
      });
    }

    await db.query(
      `
      UPDATE pesquisadores
      SET nome = ?, titulacao_maxima = ?, email = ?
      WHERE id = ?
      `,
      [nome, titulacao_maxima, email, data_inclusao, id]
    );

    res.json({ message: "Pesquisador atualizado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar pesquisador" });
  }
});

export default router;
