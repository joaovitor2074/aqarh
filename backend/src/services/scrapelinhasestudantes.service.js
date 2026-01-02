// scrapeLinhas.js
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
  "../../data/resultado_linha_estudantes.json"
);
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

/* =========================
   CONFIGURAÇÃO
========================= */
const URL =
  process.env.SCRAPE_URL ||
  "http://dgp.cnpq.br/dgp/espelhogrupo/6038878475345897";

const CHROME_PATH =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const HEADLESS =
  process.env.HEADLESS === "1" || process.env.HEADLESS === "true";

/* ===== TABELA DE PESQUISADORES (IDs FIXOS QUE ALTERNAM) ===== */
// Nota: IDs são fornecidos sem escapes; normalizeIdForSelector fará o escape correto.
const MAIN_TABLE_IDS = [
  "idFormVisualizarGrupoPesquisa\\:j_idt289_data",
];

/* ===== LINK DO ESPELHO (PESQUISADOR) ===== */
const LINK_SELECTOR = "a[id*='idBtnVisualizarEspelhoPesquisador']";

/* ===== POPUP ===== */
const POPUP_TBODY_SELECTOR = "tbody[id$='tblEspelhoRHLPAtuacao_data']";

/* ===== TIMEOUTS ===== */
const NAV_TIMEOUT = 60_000;
const SELECTOR_TIMEOUT = 60_000;
const POPUP_TIMEOUT = 90_000;
const BETWEEN_ITERATION_DELAY = 300;

/* =========================
   HELPERS
========================= */
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function normalizeIdForSelector(id) {
  // remove backslashes if user already provided escaped id, then escape colons
  const noBackslashes = id.replace(/\\/g, "");
  return `#${noBackslashes.replace(/:/g, "\\:")}`;
}

function safeWrite(data) {
  try {
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[scrapeLinhas] Erro ao gravar arquivo de saída:", err);
  }
}

/* =========================
   SERVICE
========================= */
export default async function scrapeLinhasEstudantes() {
  console.log("[scrapeLinhas] Iniciando scraping de pesquisadores...");

  const resultados = []; // coletamos aqui e gravamos apenas no final

  try {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: CHROME_PATH,
      defaultViewport: null,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    );

    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      if (["image", "stylesheet", "font"].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    page.setDefaultTimeout(SELECTOR_TIMEOUT);
    page.setDefaultNavigationTimeout(NAV_TIMEOUT);

    console.log("[scrapeLinhas] Abrindo página...");
    await page.goto(URL, {
      waitUntil: "domcontentloaded",
      timeout: NAV_TIMEOUT,
    });



    /* ===== LOCALIZA A TABELA CORRETA ===== */
    async function getMainTbodyHandle() {
      for (const id of MAIN_TABLE_IDS) {
        const selector = normalizeIdForSelector(id);
        const handle = await page.$(selector);
        if (handle) return handle;
      }
      return null;
    }

    const tbodyHandle = await getMainTbodyHandle();
    if (!tbodyHandle) {
      throw new Error("Tabela principal de pesquisadores não encontrada.");
    }

    const rows = await tbodyHandle.$$("tr");
    console.log(`[scrapeLinhas] Total de pesquisadores: ${rows.length}`);


    /* ===== FUNÇÃO PARA ABRIR POPUP (VERSÃO ESTÁVEL) ===== */
    async function openPopup(anchorHandle) {
      let resolvePopup;
      const popupPromise = new Promise((res) => (resolvePopup = res));

      const onTargetCreated = async (target) => {
        try {
          if (target.type && target.type() === "page") {
            const p = await target.page();
            if (p) resolvePopup(p);
          }
        } catch {
          // ignore
        }
      };

      browser.on("targetcreated", onTargetCreated);

      try {
        await anchorHandle.click({ delay: 50 });

        const popup = await Promise.race([
          popupPromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("popup_timeout")), POPUP_TIMEOUT)
          ),
        ]);

        await popup.bringToFront();
        popup.setDefaultTimeout(SELECTOR_TIMEOUT);
        return popup;
      } finally {
        try { browser.off("targetcreated", onTargetCreated); } catch { }
      }
    }

    /* =========================
       LOOP PRINCIPAL
    ========================= */
    for (let i = 0; i < rows.length; i++) {
      console.log(`\n[${i + 1}/${rows.length}] Processando pesquisador...`);

      try {
        const row = rows[i];

        // pega o nome (primeira td)
        const nome = await row.$eval("td", (td) => td.innerText.trim());
        console.log("→ Nome:", nome);
        const rowText = await row.evaluate(el => el.innerText);
        if (rowText.includes("Nenhum registro")) {
          resultados.push({ nome, linhas_pesquisa: [] });
          continue;
        }


        const anchor = await row.$(LINK_SELECTOR);
        if (!anchor) {
          console.warn("→ link_not_found para:", nome);
          resultados.push({ nome, error: "link_not_found" });
          await sleep(BETWEEN_ITERATION_DELAY);
          continue;
        }

        console.log("Anchor encontrado?", !!anchor);


        const popup = await openPopup(anchor);

        // espera a tabela do popup
        await popup.waitForSelector(POPUP_TBODY_SELECTOR, { timeout: SELECTOR_TIMEOUT });

        const linhas_pesquisa = await popup.evaluate((sel) => {
          return Array.from(document.querySelectorAll(`${sel} tr`)).map((tr) => {
            const tds = tr.querySelectorAll("td");
            return {
              linha_pesquisa: tds[0]?.innerText.trim() || "",
              grupo: tds[1]?.innerText.trim() || "",
            };
          });
        }, POPUP_TBODY_SELECTOR);

        resultados.push({
          nome,
          espelhoUrl: popup.url(),
          linhas_pesquisa,
        });

        console.log(`✔ ${linhas_pesquisa.length} linhas coletadas`);

        // fechar popup
        try { await popup.close(); } catch (e) { /* ignore */ }

        // espera curta entre iterações
        await sleep(BETWEEN_ITERATION_DELAY);
      } catch (err) {
        console.error(`✖ Erro no índice ${i + 1}:`, err && err.message ? err.message : err);
        resultados.push({ index: i + 1, error: err && err.message ? err.message : String(err) });
        // não gravamos aqui: gravação será feita apenas ao final
        await sleep(BETWEEN_ITERATION_DELAY);
      }
    }

    /* ========== gravação FINAL (apenas uma vez, após concluir o loop) ========== */
    safeWrite: {
      try {
        safeWrite(resultados);
        console.log(`[scrapeLinhas] Resultados gravados em: ${outputPath}`);
      } catch (writeErr) {
        console.error("[scrapeLinhas] Falha ao gravar resultado final:", writeErr);
      }
    }

    await browser.close();
    console.log("[scrapeLinhas] Finalizado com sucesso.");
    return resultados;
  } catch (err) {
    // Em caso de erro crítico, gravamos o que já foi coletado para não perder tudo
    console.error("[scrapeLinhas] Erro crítico durante scraping:", err && err.message ? err.message : err);
    try {
      if (resultados.length > 0) {
        safeWrite(resultados);
        console.log("[scrapeLinhas] Resultados parciais gravados após falha.");
      }
    } catch (e) {
      console.error("[scrapeLinhas] Falha ao gravar resultados parciais:", e);
    }
    if (browser) {
      try { await browser.close(); } catch { }
    }
    throw err;
  }
}
