import puppeteer, { Browser } from "puppeteer";
import {
  processarScrapePesquisador,
  processarEstudantes,
  processarScrapeLinhas,
  processarScrapelinhasEstudantes
} from "../services/compararbanco.service.js";

export async function runScrape(req, res) {


  try {
    const CHROME_PATH =
      process.env.CHROME_PATH ||
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: CHROME_PATH,
      defaultViewport: null,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    // 🔹 Executa em DOIS BLOCOS para evitar captcha
    const [pesquisador, linhas] = await Promise.all([
      processarScrapeLinhas(browser),
      processarScrapePesquisador(browser),
    ]);

    const [estudantes, linhasEstudantes] = await Promise.all([
      processarEstudantes(),
      processarScrapelinhasEstudantes(browser)
    ]);

    return res.json({
      pesquisador,
      estudantes,
      linhas,
      linhasEstudantes
    }) 
 
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro no scraping" });
  } finally {
  }
}
