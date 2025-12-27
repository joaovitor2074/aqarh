const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");

puppeteer.use(StealthPlugin());

const URL = "http://dgp.cnpq.br/dgp/espelhogrupo/6038878475345897";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

// sleep compatível com puppeteer antigo
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: CHROME_PATH,
    defaultViewport: null,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );

  console.log("Abrindo página do grupo...");
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });

  const rowSelectorBase = "#idFormVisualizarGrupoPesquisa\\:j_idt271_data tr";
  await page.waitForSelector(rowSelectorBase);

  const totalRows = await page.$$eval(rowSelectorBase, els => els.length);
  console.log(`Total de linhas encontradas: ${totalRows}`);

  const resultados = [];

  for (let i = 0; i < totalRows; i++) {
    const rowNth = `${rowSelectorBase}:nth-of-type(${i + 1})`;
    console.log(`\nProcessando linha ${i + 1} / ${totalRows}`);

    try {
      const nome = await page.$eval(
        `${rowNth} td:nth-child(1)`,
        td => td.innerText.trim()
      );

      const link = await page.$(`${rowNth} a[id*='idBtnVisualizarEspelhoPesquisador']`);
      if (!link) {
        console.warn(`  → Link não encontrado (${nome})`);
        resultados.push({ nome, error: "link_not_found" });
        continue;
      }

      // captura SOMENTE popup do tipo "page"
      const popupPromise = new Promise(resolve => {
        browser.once("targetcreated", async target => {
          if (target.type() === "page") {
            const p = await target.page();
            resolve(p);
          }
        });
      });

      console.log(`  → Abrindo espelho de "${nome}"`);
      await link.click();

      const popup = await Promise.race([
        popupPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("popup_timeout")), 70000)
        )
      ]);

      await popup.bringToFront();

      // aguarda tabela aparecer
      const tbodySelector = "tbody[id$='tblEspelhoRHLPAtuacao_data']";
      await popup.waitForSelector(tbodySelector, { timeout: 30000 });

      // aguarda dados AJAX
      await popup.waitForFunction(() => {
        const rows = document.querySelectorAll(
          "tbody[id$='tblEspelhoRHLPAtuacao_data'] tr"
        );
        return rows.length > 0;
      }, { timeout: 30000 });

      const linhas_pesquisa = await popup.evaluate(() => {
        return Array.from(
          document.querySelectorAll("tbody[id$='tblEspelhoRHLPAtuacao_data'] tr")
        ).map(tr => {
          const tds = tr.querySelectorAll("td");
          return {
            linha_pesquisa: (tds[0]?.innerText || "").trim(),
            grupo: (tds[1]?.innerText || "").trim()
          };
        });
      });

      resultados.push({
        nome,
        espelhoUrl: popup.url(),
        linhas_pesquisa
      });

      console.log(`  → OK (${linhas_pesquisa.length} linhas)`);

      await popup.close();
      await sleep(500);

    } catch (err) {
      console.error(`  → Erro: ${err.message}`);
      resultados.push({ index: i + 1, error: err.message });
      await sleep(500);
    }
  }

  fs.writeFileSync(
    "resultado_final.json",
    JSON.stringify(resultados, null, 2),
    "utf-8"
  );

  console.log("\nConcluído. Dados salvos em resultado_final.json");
})();
