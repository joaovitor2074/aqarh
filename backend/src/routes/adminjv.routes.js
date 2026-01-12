import { Router } from "express"
import { runScrape } from "../controllers/scrape.controller.js"
import { scrapeStatus } from "../controllers/scrapeStatus.controller.js";
import { db } from "../config/db.js";


import { listarNotificacoes, AprovarNotificacao } from "../controllers/notificacoes.controller.js";

const router = Router()

router.post("/scrape/run", (req, res) => {
  return runScrape(req, res)
})
router.get("/scrape/status", scrapeStatus) // ⬅️ FALTAVA ISSO


router.get("/scrape/notificacoes", listarNotificacoes )
router.post("/scrape/notificacao/aprovar/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // Buscar a notificação no banco pelo ID
    const [notificacao] = await db.query(
      "SELECT dados FROM notificacoes_scraping WHERE id = ?",
      [id]
    );

    if (!notificacao || notificacao.length === 0) {
      return res.status(404).json({ error: "Notificação não encontrada" });
    }

    // Aprovar e inserir no banco de pesquisadores
    await AprovarNotificacao(notificacao[0].dados);

    // Opcional: atualizar status da notificação
    await db.query(
      "UPDATE notificacoes_scraping SET status = 'aprovado' WHERE id = ?",
      [id]
    );

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Erro ao aprovar notificação" });
  }
});

export default router
