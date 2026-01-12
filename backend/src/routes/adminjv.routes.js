import { Router } from "express"
import { runScrape } from "../controllers/scrape.controller.js"
import { scrapeStatus } from "../controllers/scrapeStatus.controller.js";
import { db } from "../config/db.js";


import { listarNotificacoes, AprovarNotificacao,AprovarNotificacaoLinha } from "../controllers/notificacoes.controller.js";

const router = Router()

router.post("/scrape/run", (req, res) => {
  return runScrape(req, res)
})
router.get("/scrape/status", scrapeStatus) // ⬅️ FALTAVA ISSO


router.get("/scrape/notificacoes", listarNotificacoes )
router.post("/scrape/notificacao/aprovar/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [[notificacao]] = await db.query(
      "SELECT tipo, dados FROM notificacoes_scraping WHERE id = ?",
      [id]
    );

    if (!notificacao) {
      return res.status(404).json({ error: "Notificação não encontrada" });
    }
console.log("📌 Tipo da notificação:", notificacao.tipo);

    // 🔥 AQUI ESTÁ O PONTO-CHAVE
    switch (notificacao.tipo) {
      case "NOVO_PESQUISADOR":
        await AprovarNotificacao(notificacao.dados);
        break;
      case "NOVO_ESTUDANTE":
        await AprovarNotificacao(notificacao.dados);
        break;

      case "NOVA_LINHA":
        await AprovarNotificacaoLinha(id);
        break;

      default:
        return res.status(400).json({
          error: `Tipo de notificação não suportado: ${notificacao.tipo}`
        });
    }

    // Atualiza status
    await db.query(
      "UPDATE notificacoes_scraping SET status = 'aprovado' WHERE id = ?",
      [id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao aprovar notificação" });
  }
});

export default router
