import { Router } from "express";
import { listarLinhasPesquisa, quantLinhas, ultimasLinha } from "../controllers/linhas_pesquisas.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// GET /linhas-pesquisa
router.get("/",authMiddleware, listarLinhasPesquisa);
router.get("/quantidade",quantLinhas)
router.get("/ultimas", ultimasLinha)

export default router;
