import { Router } from "express"
import { runScrape } from "../controllers/scrape.controller.js"
import { scrapeStatus } from "../controllers/scrapeStatus.controller.js";


import { listarNotificacoes } from "../controllers/notificacoes.controller.js";

const router = Router()

router.post("/scrape/run", (req, res) => {
  return runScrape(req, res)
})
router.get("/scrape/status", scrapeStatus) // ⬅️ FALTAVA ISSO


router.get("/scrape/notificacoes", listarNotificacoes )

export default router
