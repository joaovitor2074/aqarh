// scrape_estudantes_espelho.js
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");

puppeteer.use(StealthPlugin());

// === CONFIGURAÇÃO ===
const URL = "http://dgp.cnpq.br/dgp/espelhogrupo/6038878475345897";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

// Seletor da tabela de estudantes (escape dos ':')
const TABLE_TBODY_SELECTOR = "#idFormVisualizarGrupoPesquisa\\:j_idt288_data";
const ROW_SELECTOR = `${TABLE_TBODY_SELECTOR} > tr`;

// seletor do link dentro da linha (id parcialmente conhecido)
const LINK_SELECTOR_WITHIN_ROW = "a[id*='idBtnVisualizarEspelhoEstudante']";

// dentro do popup, tabela de linhas de pesquisa (sufixo conhecido)
const POPUP_TBODY_SELECTOR = "tbody[id$='tblEspelhoRHLPAtuacao_data']";

// timeouts (ms)
const NAV_TIMEOUT = 60000;
const SELECTOR_TIMEOUT = 60000;
const POPUP_TIMEOUT = 90000;
const CLICK_RETRIES = 2;
const BETWEEN_ITERATION_DELAY = 700; // ms

// sleep util
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  console.log("Iniciando script de scraping (estudantes -> espelho) ...");

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: CHROME_PATH,
    defaultViewport: null,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(SELECTOR_TIMEOUT);
  page.setDefaultNavigationTimeout(NAV_TIMEOUT);

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );

  console.log(`Abrindo ${URL} ...`);
  await page.goto(URL, { waitUntil: "networkidle2", timeout: NAV_TIMEOUT });

  console.log("Aguardando tabela de estudantes...");
  await page.waitForSelector(TABLE_TBODY_SELECTOR, { timeout: SELECTOR_TIMEOUT });

  const totalRows = await page.$$eval(ROW_SELECTOR, els => els.length);
  console.log(`Total de linhas encontradas: ${totalRows}`);

  const resultados = [];

  // guarda a página principal para referência e comparações
  const mainPage = page;

  // função utilitária para garantir fechamento de páginas extras
  async function closeNonMainPages() {
    const allPages = await browser.pages();
    for (const p of allPages) {
      if (p !== mainPage) {
        try { if (!p.isClosed()) await p.close(); } catch (e) { /* ignore */ }
      }
    }
  }

  for (let i = 0; i < totalRows; i++) {
    const rowNth = `${ROW_SELECTOR}:nth-of-type(${i + 1})`;
    console.log(`\n[${i + 1}/${totalRows}] Processando linha ...`);

    try {
      // pega o nome (ajuste td:nth-child se necessário)
      const nome = await page.$eval(`${rowNth} td:nth-child(1)`, td => td.innerText.trim());

      // localiza a âncora do espelho
      const anchor = await page.$(`${rowNth} ${LINK_SELECTOR_WITHIN_ROW}`);

      if (!anchor) {
        console.warn(`  → Link de espelho não encontrado para: ${nome}`);
        resultados.push({ nome, error: "link_not_found" });
        continue;
      }

      // Função para abrir popup e devolver a página do popup
      async function openPopupFromAnchor(anchorHandle) {
        let resolvePopup;
        const popupPromise = new Promise(resolve => (resolvePopup = resolve));

        const onTargetCreated = async target => {
          try {
            if (target.type && target.type() === "page") {
              const p = await target.page();
              // pequena proteção: só resolve uma vez
              if (p) resolvePopup(p);
            }
          } catch (e) {
            // ignore
          }
        };

        // adiciona listener
        browser.on("targetcreated", onTargetCreated);

        try {
          // tentativa direta de click
          await anchorHandle.click({ delay: 50 }).catch(() => { /* fallback abaixo */ });

          // aguarda o popup aparecer via listener
          let popup = null;
          try {
            popup = await Promise.race([
              popupPromise,
              new Promise((_, reject) => setTimeout(() => reject(new Error("popup_timeout")), POPUP_TIMEOUT))
            ]);
          } catch (e) {
            // noop: tentaremos fallback
          }

          // fallback: se listener não capturou, tente forçar click via id e esperar target com waitForTarget
          if (!popup) {
            const idHandle = await anchorHandle.getProperty("id");
            const anchorId = idHandle ? await idHandle.jsonValue() : null;

            if (anchorId) {
              await page.evaluate(id => {
                const a = document.getElementById(id);
                if (a) a.click();
              }, anchorId);

              // espera target que seja tipo page (pode ser o popup)
              try {
                const target = await browser.waitForTarget(t => t.type && t.type() === "page", { timeout: POPUP_TIMEOUT });
                popup = await target.page();
              } catch (e) {
                // nada
              }
            }
          }

          if (!popup) {
            throw new Error("Não foi possível abrir o popup do espelho");
          }

          // trazer para front e aguardar carregamento mínimo
          try { await popup.bringToFront(); } catch (e) { /* ignore */ }
          return popup;

        } finally {
          // REMOÇÃO CORRETA DO LISTENER (browser.off)
          try { browser.off("targetcreated", onTargetCreated); } catch (e) { /* ignore */ }
        }
      }

      // TENTATIVAS para abrir o popup (reduz flakiness)
      let popupPage = null;
      let lastOpenError = null;
      for (let attempt = 1; attempt <= CLICK_RETRIES; attempt++) {
        try {
          popupPage = await openPopupFromAnchor(anchor);
          break;
        } catch (err) {
          lastOpenError = err;
          console.warn(`  → tentativa ${attempt} de abrir popup falhou: ${err.message}`);
          await sleep(1000 * attempt);
        }
      }
      if (!popupPage) {
        throw new Error(`Falha ao abrir popup (todos retries): ${lastOpenError?.message || "unknown"}`);
      }

      // espera a tabela de linhas de pesquisa aparecer no popup
      await popupPage.waitForSelector(POPUP_TBODY_SELECTOR, { timeout: SELECTOR_TIMEOUT });

      // espera a tabela ser preenchida (condição: pelo menos 1 linha)
      await popupPage.waitForFunction(
        sel => {
          const rows = document.querySelectorAll(`${sel} tr`);
          return rows && rows.length > 0;
        },
        { timeout: SELECTOR_TIMEOUT },
        POPUP_TBODY_SELECTOR
      );

      // extrai as linhas de pesquisa
      const linhas_pesquisa = await popupPage.evaluate(sel => {
        return Array.from(document.querySelectorAll(`${sel} tr`)).map(tr => {
          const tds = tr.querySelectorAll("td");
          return {
            linha_pesquisa: (tds[0]?.innerText || "").trim(),
            grupo: (tds[1]?.innerText || "").trim()
          };
        });
      }, POPUP_TBODY_SELECTOR);

      resultados.push({
        nome,
        espelhoUrl: popupPage.url(),
        linhas_pesquisa
      });

      console.log(`  → OK - ${linhas_pesquisa.length} linhas extraídas`);

      // fechar popup e garantir limpeza de guias
      try { await popupPage.close(); } catch (e) { /* ignore */ }

      await closeNonMainPages();

      // pequeno delay antes da próxima iteração
      await sleep(BETWEEN_ITERATION_DELAY);

    } catch (err) {
      console.error(`  → Erro processando linha ${i + 1}: ${err.message}`);
      resultados.push({ index: i + 1, error: err.message });

      // garantir limpeza de páginas antes de continuar
      await closeNonMainPages();
      await sleep(BETWEEN_ITERATION_DELAY);
    }
  } // fim loop linhas

  // salva resultado
  const outFile = "resultado_final_estudantes_espelho.json";
  fs.writeFileSync(outFile, JSON.stringify(resultados, null, 2), "utf-8");
  console.log(`\nConcluído. Dados salvos em ${outFile}`);

  await browser.close();
})();
