import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

/*CONFIGURAÇÕES GERAIS*/
const CONFIG = {
  timeouts: {
    popup: 30000, navigation: 60000,
  },
  retryAttempts: 3, slowMoClick: 120,
};

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

function log(message) {
  console.log(`[SCRAPER] ${message}`);
}

/* ABERTURA CONFIÁVEL DE POPUP */
async function openPopupReliably(page, linkHandle, contextName) {
  const browser = page.browser();

  for (let attempt = 1; attempt <= CONFIG.retryAttempts; attempt++) {
    log(`Tentando abrir popup (${contextName}) - tentativa ${attempt}`);

    const pagesBefore = await browser.pages();

    await Promise.all([
      linkHandle.click({ delay: CONFIG.slowMoClick }),
      sleep(800)
    ]);

    const start = Date.now();
    while (Date.now() - start < CONFIG.timeouts.popup) {
      const pagesAfter = await browser.pages();
      const newPages = pagesAfter.filter(p => !pagesBefore.includes(p));

      if (newPages.length > 0) {
        const popup = newPages[0];

        await popup
          .waitForNavigation({ waitUntil: "networkidle0", timeout: CONFIG.timeouts.navigation })
          .catch(() => log("Popup abriu, mas sem navegação completa"));

        log("Popup detectado com sucesso");
        return popup;
      }

      await sleep(500);
    }

    log("Popup não detectado, tentando novamente...");
  }

  throw new Error("Falha ao abrir popup após múltiplas tentativas");
}

/*EXTRAÇÃO DEFENSIVA DE DADOS*/
async function extractTableData(popupPage) {
  return await popupPage.evaluate(() => {
    const rows = document.querySelectorAll("tr");

    return Array.from(rows)
      .map(row => {
        const cols = row.querySelectorAll("td");

        return {
          titulo: cols[0]?.innerText?.trim() || null,
          descricao: cols[1]?.innerText?.trim() || null
        };
      })
      .filter(item => item.titulo);
  });}

async function closePopupSafely(popupPage) {
  try {
    await popupPage.close();
  } catch {
  }}