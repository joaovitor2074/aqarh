import { Router } from "express";
import {
  listarMembros,
  criarMembro
} from "../controllers/membros.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { db } from "../config/db.js";


const router = Router();

// protegidas
router.get("/", authMiddleware, listarMembros);
router.post("/", authMiddleware, criarMembro);
// DELETE /membros/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM membros WHERE id = ?", [id]);
    res.json({ message: "Membro excluído com sucesso" });
  } catch (err) {
    res.status(500).json({ message: "Erro ao excluir membro" });
  }
});
// PUT /membros/:id
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, funcao } = req.body;

    if (!nome || !funcao) {
      return res.status(400).json({ message: "Nome e função são obrigatórios" });
    }

    await db.query(
      "UPDATE membros SET nome = ?, email = ?, funcao = ? WHERE id = ?",
      [nome, email, funcao, id]
    );

    res.json({ message: "Membro atualizado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar membro" });
  }
});



export default router;

