import { Router } from "express";
import {
  listarMembros,
  criarMembro,
  quantMembros,
} from "../controllers/membros.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { db } from "../config/db.js";

const router = Router();

router.get("/", authMiddleware, listarMembros);
router.get("/quantidade", quantMembros);
router.post("/", authMiddleware, criarMembro);

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM pesquisador_linha_pesquisa WHERE pesquisador_id = ?", [id]);
    await db.query("DELETE FROM pesquisadores WHERE id = ?", [id]);

    res.json({ message: "Membro excluido com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao excluir membro" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome,
      titulacao_maxima,
      data_inclusao,
      email,
      tipo_vinculo = "pesquisador",
      ativo = true,
      linha_pesquisa_id,
    } = req.body;

    if (!nome) {
      return res.status(400).json({ message: "Nome e obrigatorio" });
    }

    await db.query(
      `
      UPDATE pesquisadores
      SET nome = ?,
          titulacao_maxima = ?,
          data_inclusao = ?,
          email = ?,
          tipo_vinculo = ?,
          ativo = ?
      WHERE id = ?
      `,
      [
        nome,
        titulacao_maxima || null,
        data_inclusao || null,
        email || null,
        tipo_vinculo || "pesquisador",
        ativo ? 1 : 0,
        id,
      ]
    );

    if (linha_pesquisa_id !== undefined) {
      await db.query(
        "DELETE FROM pesquisador_linha_pesquisa WHERE pesquisador_id = ?",
        [id]
      );

      if (linha_pesquisa_id) {
        await db.query(
          `
          INSERT IGNORE INTO pesquisador_linha_pesquisa
            (pesquisador_id, linha_pesquisa_id)
          VALUES (?, ?)
          `,
          [id, linha_pesquisa_id]
        );
      }
    }

    res.json({ message: "Membro atualizado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar membro" });
  }
});

router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { ativo } = req.body;

    await db.query("UPDATE pesquisadores SET ativo = ? WHERE id = ?", [
      ativo ? 1 : 0,
      id,
    ]);

    res.json({ message: "Status do membro atualizado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar status do membro" });
  }
});

export default router;
