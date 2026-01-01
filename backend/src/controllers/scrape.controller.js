import { processarScrapeLinhas } from "../services/compararbanco.service.js";


export async function runScrape(req, res) {
  try {
    const linhas = await processarScrapeLinhas();
    return res.json(linhas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro no scraping" });
  }
}
