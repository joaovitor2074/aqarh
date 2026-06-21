import { Router } from "express";
import {
  alterarStatusMembro,
  atualizarMembro,
  deletarMembro,
  listarMembros,
  listarMembrosPublicos,
  criarMembro,
  quantMembros,
} from "../controllers/membros.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/upload.js";

const router = Router();

router.get("/quantidade", quantMembros);
router.get("/publicos", listarMembrosPublicos);
router.get("/", authMiddleware, listarMembros);
router.post("/", authMiddleware, upload.single("imagem"), criarMembro);

router.delete("/:id", authMiddleware, deletarMembro);
router.put("/:id", authMiddleware, upload.single("imagem"), atualizarMembro);
router.patch("/:id", authMiddleware, alterarStatusMembro);

export default router;
