// controllers/scrapeController.js
import { runLattesUpdateService } from "../services/runLattesUpdate.service.js"

export const runScrape = async (req, res) => {
  try {
    const result = await runLattesUpdateService()

    return res.status(200).json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error("Erro no scraping:", error)

    return res.status(500).json({
      success: false,
      message: "Erro ao executar verificação de atualizações"
    })
  }
}
