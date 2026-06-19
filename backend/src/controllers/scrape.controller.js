import {
  processarScrapePesquisador,
  processarEstudantes,
  processarScrapeLinhas,
  processarScrapeLinhasEstudantes,
} from "../services/compararbanco.service.js";

import { scrapeEmitter } from "../utils/scrapeEmitter.js";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

let isScraping = false;
let currentScrapeId = null;
let lastScrapeEvent = {
  etapa: "idle",
  status: "parado",
  mensagem: "Nenhum scraping em execucao",
  timestamp: new Date().toISOString(),
};

const BROWSER_CONFIG = {
  headless: process.env.SCRAPE_HEADLESS === "false" ? false : true,
  executablePath: process.env.CHROME_PATH || undefined,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-blink-features=AutomationControlled",
    "--window-size=1920,1080",
  ],
  defaultViewport: null,
  ignoreHTTPSErrors: true,
  timeout: 180000,
};

function emitScrapeStatus(event) {
  lastScrapeEvent = {
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
  };

  scrapeEmitter.emit("status", lastScrapeEvent);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class ScrapeManager {
  constructor() {
    this.results = {
      pesquisadores: null,
      estudantes: null,
      linhas_pesquisadores: null,
      linhas_estudantes: null,
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

    emitScrapeStatus({
      scrapeId: this.scrapeId,
      etapa: "inicio",
      status: "iniciando",
      mensagem: "Iniciando scraping sequencial",
    });

    return this.scrapeId;
  }

  logEtapa(etapa, status, mensagem, extra = {}) {
    emitScrapeStatus({
      scrapeId: this.scrapeId,
      etapa,
      status,
      mensagem,
      ...extra,
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
      timestamp: new Date().toISOString(),
    });

    this.results[tipo] = { error: error.message };
    this.logEtapa(tipo, "erro", error.message);
  }

  getDuration() {
    return ((Date.now() - this.startTime) / 1000).toFixed(1);
  }

  finalize() {
    const duration = this.getDuration();
    const hasErrors = this.errors.length > 0;

    const finalResult = {
      success: !hasErrors,
      duration: `${duration}s`,
      data: this.results,
      errors: hasErrors ? this.errors : undefined,
    };

    emitScrapeStatus({
      scrapeId: this.scrapeId,
      etapa: "final",
      status: hasErrors ? "erro_parcial" : "sucesso",
      mensagem: hasErrors
        ? "Scraping concluido com erros"
        : "Scraping concluido com sucesso",
      duracao: `${duration}s`,
      erros: this.errors,
    });

    return finalResult;
  }
}

async function launchBrowser(label) {
  return puppeteer.launch({
    ...BROWSER_CONFIG,
    args: [...BROWSER_CONFIG.args, `--user-data-dir=./temp/${label}`],
  });
}

async function executeScrapeLinhasSequencial(manager) {
  let browserPesq;

  try {
    manager.logEtapa(
      "linhas_pesquisadores",
      "iniciando",
      "Coletando linhas de pesquisadores"
    );

    browserPesq = await launchBrowser("linhas_pesquisadores");
    const result = await processarScrapeLinhas(browserPesq);
    manager.addResult("linhas_pesquisadores", result);

    manager.logEtapa(
      "linhas_pesquisadores",
      "sucesso",
      "Linhas de pesquisadores finalizadas"
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

  await delay(3000);

  let browserEst;

  try {
    manager.logEtapa(
      "linhas_estudantes",
      "iniciando",
      "Coletando linhas de estudantes"
    );

    browserEst = await launchBrowser("linhas_estudantes");
    const result = await processarScrapeLinhasEstudantes(browserEst);
    manager.addResult("linhas_estudantes", result);

    manager.logEtapa(
      "linhas_estudantes",
      "sucesso",
      "Linhas de estudantes finalizadas"
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

async function executeScrapeCompleto(manager) {
  try {
    try {
      manager.logEtapa("pesquisadores", "iniciando", "Coletando pesquisadores");
      const result = await processarScrapePesquisador();
      manager.addResult("pesquisadores", result);
      manager.logEtapa("pesquisadores", "sucesso", "Pesquisadores finalizados");
    } catch (error) {
      manager.addError("pesquisadores", error);
    }

    await delay(2000);

    try {
      manager.logEtapa("estudantes", "iniciando", "Coletando estudantes");
      const result = await processarEstudantes();
      manager.addResult("estudantes", result);
      manager.logEtapa("estudantes", "sucesso", "Estudantes finalizados");
    } catch (error) {
      manager.addError("estudantes", error);
    }

    await delay(3000);

    manager.logEtapa("linhas", "iniciando", "Coletando linhas de pesquisa");
    await executeScrapeLinhasSequencial(manager);

    manager.finalize();
  } catch (error) {
    emitScrapeStatus({
      scrapeId: manager.scrapeId,
      etapa: "final",
      status: "erro",
      mensagem: error.message,
    });
  } finally {
    isScraping = false;
    currentScrapeId = null;
  }
}

export async function runScrape(req, res) {
  if (isScraping) {
    return res.status(429).json({
      success: false,
      message: "Scraping ja em execucao",
      currentScrapeId,
    });
  }

  isScraping = true;
  const manager = new ScrapeManager();
  const scrapeId = manager.start();

  setImmediate(() => {
    executeScrapeCompleto(manager);
  });

  return res.status(202).json({
    success: true,
    message: "Scraping iniciado",
    scrapeId,
  });
}

export function getScrapeSnapshot() {
  return {
    isScraping,
    currentScrapeId,
    lastEvent: lastScrapeEvent,
    timestamp: new Date().toISOString(),
  };
}

export async function scrapeStatus(req, res) {
  res.json(getScrapeSnapshot());
}

export async function cancelScrape(req, res) {
  if (!isScraping) {
    return res.json({ success: true, message: "Nada para cancelar" });
  }

  emitScrapeStatus({
    scrapeId: currentScrapeId,
    etapa: "cancelamento",
    status: "cancelando",
    mensagem: "Cancelamento solicitado",
  });

  isScraping = false;
  currentScrapeId = null;

  res.json({ success: true, message: "Scraping cancelado" });
}
