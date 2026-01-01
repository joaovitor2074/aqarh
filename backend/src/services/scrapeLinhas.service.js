import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

puppeteer.use(StealthPlugin());

/* =========================
   PATHS / OUTPUT
========================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(
  __dirname,
  "../../data/resultado_final_pesquisadores.json"
);

/* =========================
   CONFIGURAÇÃO
========================= */
const URL = "http://dgp.cnpq.br/dgp/espelhogrupo/6038878475345897";
const CHROME_PATH =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

/* ===== IDs FIXOS (como solicitado) ===== */
const MAIN_TABLE_IDS = [
  "idFormVisualizarGrupoPesquisa:j_idt277_data",
  "idFormVisualizarGrupoPesquisa:j_idt272_data"
];
const POPUP_TBODY_ID = "formVisualizarRH:tblEspelhoRHLPAtuacao_data";

/* ===== TIMEOUTS ===== */
const NAV_TIMEOUT = 90000;
const DEFAULT_TIMEOUT = 90000;
const BETWEEN_ITERATION_DELAY = 1200;

/* =========================
   UTILS
========================= */
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* =========================
   SCRAPER
========================= */
export default async function scrapeLinhas() {
  console.log("Iniciando scraping de pesquisadores (JSF-safe)");

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: CHROME_PATH,
    defaultViewport: null,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(DEFAULT_TIMEOUT);
  page.setDefaultNavigationTimeout(NAV_TIMEOUT);

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );

  console.log("Abrindo página do grupo...");
  await page.goto(URL, { waitUntil: "domcontentloaded" });

  /* =========================
     FUNÇÕES CRÍTICAS
  ========================= */

  async function waitMainTableReady() {
    await page.bringToFront();
    await page.waitForFunction(() => {
      const tb = document.getElementById(
        "idFormVisualizarGrupoPesquisa:j_idt277_data",
     "idFormVisualizarGrupoPesquisa:j_idt272_data"
      );
      return tb && tb.querySelectorAll("tr").length > 0;
    }, { timeout: 90000 });
  }

  async function closeExtraPages(main) {
    const pages = await browser.pages();
    for (const p of pages) {
      if (p !== main && !p.isClosed()) {
        try { await p.close(); } catch {}
      }
    }
  }

  async function openPopupByRowIndex(rowIndex) {
    const pagesBefore = await browser.pages();

    await page.evaluate((idx) => {
      const tbody = document.getElementById(
        "#formVisualizarRH\\:tblEspelhoRHLPAtuacao_data"
          );
      if (!tbody) throw new Error("Tabela principal não encontrada");

      const row = tbody.querySelectorAll("tr")[idx];
      if (!row) throw new Error("Linha não encontrada");

      const link = row.querySelector(
        "a[id*='idBtnVisualizarEspelhoPesquisador']"
      );
      if (!link) throw new Error("Link do espelho não encontrado");

      link.click();
    }, rowIndex);

    const target = await browser.waitForTarget(t => t.type() === "page", {
      timeout: 90000
    });

    const popup = await target.page();
    await popup.bringToFront();
    return popup;
  }

  /* =========================
     EXECUÇÃO
  ========================= */

  await waitMainTableReady();

  const totalRows = await page.evaluate(() => {
    return document.getElementById(
      "idFormVisualizarGrupoPesquisa:j_idt277_data"
    ).querySelectorAll("tr").length;
  });

  console.log(`Total de pesquisadores: ${totalRows}`);

  const resultados = [];

  for (let i = 0; i < totalRows; i++) {
    console.log(`\n[${i + 1}/${totalRows}] Processando pesquisador...`);

    try {
      await waitMainTableReady();

      const nome = await page.evaluate((idx) => {
        const row = document
          .getElementById("idFormVisualizarGrupoPesquisa:j_idt277_data")
          .querySelectorAll("tr")[idx];
        return row.querySelector("td")?.innerText.trim();
      }, i);

      console.log(`→ Nome: ${nome}`);

      const popup = await openPopupByRowIndex(i);

      await popup.waitForFunction(() => {
        const tb = document.getElementById(
          "formVisualizarRH:tblEspelhoRHLPAtuacao_data"
        );
        return tb && tb.querySelectorAll("tr").length > 0;
      }, { timeout: 90000 });

      const linhas_pesquisa = await popup.evaluate(() => {
        return Array.from(
          document
            .getElementById("formVisualizarRH:tblEspelhoRHLPAtuacao_data")
            .querySelectorAll("tr")
        ).map(tr => {
          const tds = tr.querySelectorAll("td");
          return {
            linha_pesquisa: tds[0]?.innerText.trim() || "",
            grupo: tds[1]?.innerText.trim() || ""
          };
        });
      });

      resultados.push({
        nome,
        espelhoUrl: popup.url(),
        linhas_pesquisa
      });

      console.log(`✔ ${linhas_pesquisa.length} linhas coletadas`);

      await popup.close();
      await closeExtraPages(page);
      await sleep(BETWEEN_ITERATION_DELAY);

    } catch (err) {
      console.error(`✖ Erro: ${err.message}`);
      resultados.push({
        index: i + 1,
        error: err.message
      });
      await closeExtraPages(page);
      await sleep(BETWEEN_ITERATION_DELAY);
    }
  }

  await browser.close();

  fs.writeFileSync(
    outputPath,
    JSON.stringify(resultados, null, 2),
    "utf-8"
  );

  console.log("Scraping finalizado com sucesso.");
  return resultados;
}
