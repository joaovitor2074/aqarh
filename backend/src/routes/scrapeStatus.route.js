// scrape.routes.js - ROTAS ATUALIZADAS
import { Router } from "express";
import { 
  runScrape, 
  runScrapeLinhasParalelo,
  scrapeStatus,
  testParalelismo,
  healthCheck,
  cancelScrape
} from "../controllers/scrape.controller.js";

const router = Router();

// 🔥 ROTAS PRINCIPAIS
router.post("/scrape/run", runScrape);                    // Completo (cadastro + linhas paralelo)
router.post("/scrape/run-parallel", runScrapeLinhasParalelo); // Apenas linhas em paralelo (2 navegadores)

// 📊 ROTAS DE STATUS E CONTROLE
router.get("/scrape/status", scrapeStatus);
router.get("/scrape/health", healthCheck);
router.post("/scrape/cancel", cancelScrape);

// 🧪 ROTA DE TESTE
router.post("/scrape/test-parallel", testParalelismo);

export default router;