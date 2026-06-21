import { Router } from "express";
import {
  alterarVisibilidadeProjeto,
  atualizarProjeto,
  criarProjeto,
  deletarProjeto,
  detalharProjetoPublico,
  listarProjetosAdmin,
  listarProjetosPublicos,
  quantidadeProjetos,
} from "../controllers/projetos.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/upload.js";

const router = Router();

router.get("/quantidade", quantidadeProjetos);
router.get("/admin", authMiddleware, listarProjetosAdmin);
router.get("/", listarProjetosPublicos);
router.get("/:id", detalharProjetoPublico);

router.post("/", authMiddleware, upload.single("imagem"), criarProjeto);
router.put("/:id", authMiddleware, upload.single("imagem"), atualizarProjeto);
router.patch("/:id/visibilidade", authMiddleware, alterarVisibilidadeProjeto);
router.delete("/:id", authMiddleware, deletarProjeto);

export default router;
