import { Router } from "express";
import { listarLinhasPesquisa, quantLinhas } from "../controllers/linhas_pesquisas.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// GET /linhas-pesquisa
router.get("/",authMiddleware, listarLinhasPesquisa);
router.get("/quantidade",quantLinhas)

export default router;
