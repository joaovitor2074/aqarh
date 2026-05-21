// scrape.controller.js — VERSÃO SEQUENCIAL (ESTÁVEL)

import {
  processarScrapePesquisador,
  processarEstudantes,
  processarScrapeLinhas,
  processarScrapeLinhasEstudantes
} from "../services/compararbanco.service.js";

import { scrapeEmitter } from "../utils/scrapeEmitter.js";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

// =========================
// CONTROLE GLOBAL
// =========================
let isScraping = false;
let currentScrapeId = null;

// =========================
// CONFIGURAÇÃO DO BROWSER
// =========================
const BROWSER_CONFIG = {
  headless: false,
  executablePath:
    process.env.CHROME_PATH ||
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--start-maximized",
    "--disable-blink-features=AutomationControlled",
    "--window-size=1920,1080"
  ],
  defaultViewport: null,
  ignoreHTTPSErrors: true,
  timeout: 180000
};

// =========================
// MANAGER
// =========================
class ScrapeManager {
  constructor() {
    this.results = {
      pesquisadores: null,
      estudantes: null,
      linhas_pesquisadores: null,
      linhas_estudantes: null
    };
    this.errors = [];
    this.startTime = null;
    this.scrapeId = null;
  }

  start() {
    this.startTime = Date.now();
    this.scrapeId = `scrape_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    currentScrapeId = this.scrapeId;

    scrapeEmitter.emit("status", {
      scrapeId: this.scrapeId,
      etapa: "inicio",
      status: "iniciando",
      timestamp: new Date().toISOString(),
      mensagem: "🚀 INICIANDO SCRAPING SEQUENCIAL"
    });

    return this.scrapeId;
  }

  logEtapa(etapa, status, mensagem, extra = {}) {
    scrapeEmitter.emit("status", {
      scrapeId: this.scrapeId,
      etapa,
      status,
      mensagem,
      timestamp: new Date().toISOString(),
      ...extra
    });
  }

  addResult(tipo, resultado) {
    this.results[tipo] = resultado;
    if (resultado?.error) {
      this.errors.push({ tipo, error: resultado.error });
    }
  }

  addError(tipo, error) {
    this.errors.push({
      tipo,
      mensagem: error.message,
      timestamp: new Date().toISOString()
    });

    this.results[tipo] = { error: error.message };

    this.logEtapa(tipo, "erro", `❌ ${error.message}`);
  }

  getDuration() {
    return ((Date.now() - this.startTime) / 1000).toFixed(1);
  }

  finalize() {
    const duration = this.getDuration();
    const hasErrors = this.errors.length > 0;

    scrapeEmitter.emit("status", {
      scrapeId: this.scrapeId,
      etapa: "final",
      status: hasErrors ? "erro_parcial" : "sucesso",
      mensagem: hasErrors
        ? "Scraping concluído com erros"
        : "✅ SCRAPING CONCLUÍDO COM SUCESSO",
      duracao: `${duration}s`,
      timestamp: new Date().toISOString(),
      erros: this.errors
    });

    return {
      success: !hasErrors,
      duration: `${duration}s`,
      data: this.results,
      errors: hasErrors ? this.errors : undefined
    };
  }
}

// =========================
// BROWSER HELPERS
// =========================
async function launchBrowser(label) {
  const browser = await puppeteer.launch({
    ...BROWSER_CONFIG,

    // 🔥 ESSENCIAL para evitar Runtime.callFunctionOn timeout

    args: [
      ...BROWSER_CONFIG.args,
      `--user-data-dir=./temp/${label}`
    ],
  });

  return browser;
}


// =========================
// LINHAS SEQUENCIAL
// =========================
async function executeScrapeLinhasSequencial(manager) {
  // ---- PESQUISADORES ----
  let browserPesq;
  try {
    manager.logEtapa(
      "linhas_pesquisadores",
      "iniciando",
      "🔄 Linhas de pesquisadores"
    );

    browserPesq = await launchBrowser("linhas_pesquisadores");
    const result = await processarScrapeLinhas(browserPesq);
    manager.addResult("linhas_pesquisadores", result);

    manager.logEtapa(
      "linhas_pesquisadores",
      "sucesso",
      "✅ Linhas de pesquisadores finalizadas"
    );
  } catch (error) {
    manager.addError("linhas_pesquisadores", error);
  } finally {
    if (browserPesq) {
      try {
        await browserPesq.close();
      } catch {}
    }
  }

  await new Promise(r => setTimeout(r, 3000));

  // ---- ESTUDANTES ----
  let browserEst;
  try {
    manager.logEtapa(
      "linhas_estudantes",
      "iniciando",
      "🔄 Linhas de estudantes"
    );

    browserEst = await launchBrowser("linhas_estudantes");
    const result = await processarScrapeLinhasEstudantes(browserEst);
    manager.addResult("linhas_estudantes", result);

    manager.logEtapa(
      "linhas_estudantes",
      "sucesso",
      "✅ Linhas de estudantes finalizadas"
    );
  } catch (error) {
    manager.addError("linhas_estudantes", error);
  } finally {
    if (browserEst) {
      try {
        await browserEst.close();
      } catch {}
    }
  }
}

// =========================
// CONTROLLER PRINCIPAL
// =========================
export async function runScrape(req, res) {
  if (isScraping) {
    return res.status(429).json({
      success: false,
      message: "Scraping já em execução",
      currentScrapeId
    });
  }

  isScraping = true;
  const manager = new ScrapeManager();
  const scrapeId = manager.start();

  try {
    // PESQUISADORES
    try {
      manager.logEtapa("pesquisadores", "iniciando", "👨‍🔬 Pesquisadores");
      const r = await processarScrapePesquisador();
      manager.addResult("pesquisadores", r);
    } catch (e) {
      manager.addError("pesquisadores", e);
    }

    await new Promise(r => setTimeout(r, 2000));

    // ESTUDANTES
    try {
      manager.logEtapa("estudantes", "iniciando", "👨‍🎓 Estudantes");
      const r = await processarEstudantes();
      manager.addResult("estudantes", r);
    } catch (e) {
      manager.addError("estudantes", e);
    }

    await new Promise(r => setTimeout(r, 3000));

    // LINHAS (SEQUENCIAL)
    manager.logEtapa(
      "linhas",
      "iniciando",
      "🚀 Scraping de linhas (sequencial)"
    );
    await executeScrapeLinhasSequencial(manager);

    const finalResult = manager.finalize();
    return res.status(finalResult.errors ? 207 : 200).json({
      ...finalResult,
      scrapeId
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      scrapeId
    });
  } finally {
    isScraping = false;
    currentScrapeId = null;
  }
}

// =========================
// STATUS
// =========================
export async function scrapeStatus(req, res) {
  res.json({
    isScraping,
    currentScrapeId,
    timestamp: new Date().toISOString()
  });
}

// =========================
// CANCELAR
// =========================
export async function cancelScrape(req, res) {
  if (!isScraping) {
    return res.json({ success: true, message: "Nada para cancelar" });
  }

  scrapeEmitter.emit("status", {
    scrapeId: currentScrapeId,
    etapa: "cancelamento",
    status: "cancelando",
    mensagem: "🚫 Cancelamento solicitado",
    timestamp: new Date().toISOString()
  });

  isScraping = false;
  currentScrapeId = null;

  res.json({ success: true, message: "Scraping cancelado" });
}
