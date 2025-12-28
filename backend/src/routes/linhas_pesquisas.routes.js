import { Router } from "express";
import { listarLinhasPesquisa } from "../controllers/linhas_pesquisas.controller.js";

const router = Router();

// GET /linhas-pesquisa
router.get("/", listarLinhasPesquisa);

export default router;
