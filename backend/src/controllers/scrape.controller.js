import puppeteer, { Browser } from "puppeteer";
import {
  processarScrapePesquisador,
  processarEstudantes,
  processarScrapeLinhas,
  processarScrapeLinhasEstudantes
} from "../services/compararbanco.service.js";

import { scrapeEmitter } from "../utils/scrapeEmitter.js";


export async function runScrape(req, res) {
  let browser;

  try {
    scrapeEmitter.emit("status", {
      etapa: "browser",
      status: "iniciando",
    });

    const CHROME_PATH =
      process.env.CHROME_PATH ||
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

    browser = await puppeteer.launch({
      headless: true,
      executablePath: CHROME_PATH,
      defaultViewport: null,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    scrapeEmitter.emit("status", {
      etapa: "browser",
      status: "pronto",
    });

    // 🔹 BLOCO 1 (paralelo)
    scrapeEmitter.emit("status", {
      etapa: "pesquisadores + estudantes",
      status: "iniciando",
    });

    const [pesquisador, estudantes] = await Promise.all([
      processarScrapePesquisador(),
      processarEstudantes(browser),
    ]);

    scrapeEmitter.emit("status", {
      etapa: "pesquisadores + estudantes",
      status: "finalizado",
    });

    // 🔹 BLOCO 2 (paralelo)
    scrapeEmitter.emit("status", {
      etapa: "linhas",
      status: "iniciando",
    });

    const [linhas, linhasEstudantes] = await Promise.all([
      processarScrapeLinhas(browser),
      processarScrapeLinhasEstudantes(browser),
    ]);

    scrapeEmitter.emit("status", {
      etapa: "linhas",
      status: "finalizado",
    });
scrapeEmitter.emit("status", {
  etapa: "scraping",
  status: "sucesso",
  mensagem: "Scraping concluído com sucesso"
});

    return res.json({
      pesquisador,
      estudantes,
      linhas,
      linhasEstudantes
    });

  } catch (error) {
    scrapeEmitter.emit("status", {
      etapa: "erro",
      status: "erro",
      mensagem: error.message
    });

    console.error(error);
    return res.status(500).json({ error: "Erro no scraping" });

  } finally {
    if (browser) await browser.close();
  }
}
