// scrape_cnpq.js
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

const URL = "http://dgp.cnpq.br/dgp/espelhorh/0038452960";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

(async () => {
  console.log("Iniciando scraper...");

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: CHROME_PATH,
    defaultViewport: null,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled"
    ]
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );

  console.log("Abrindo página...");
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });

  // Espera manual (substitui waitForTimeout)
  await new Promise(r => setTimeout(r, 5000));

  console.log("Aguardando carregamento da tabela...");

  // Espera o PrimeFaces realmente renderizar
  try {
    await page.waitForFunction(() => {
      const el = document.querySelector("#formVisualizarRH\\:tblEspelhoRHLPAtuacao_data");
      return el && el.querySelectorAll("tr").length > 0;
    }, { timeout: 20000 });
  } catch {
    console.log("Tabela não carregou automaticamente.");
  }

  // Extrai os dados
  const dados = await page.evaluate(() => {
    const linhas = document.querySelectorAll(
      "#formVisualizarRH\\:tblEspelhoRHLPAtuacao_data tr"
    );

    return Array.from(linhas).map(tr => {
      const tds = tr.querySelectorAll("td");
      return {
        linha: tds[0]?.innerText.trim() || "",
        grupo: tds[1]?.innerText.trim() || ""
      };
    });
  });

  console.log("RESULTADO:");
  console.log(dados);

  // Salva arquivos
  fs.writeFileSync("dados.json", JSON.stringify(dados, null, 2), "utf8");

  console.log("✔ Dados salvos em dados.json");

  // NÃO fecha o navegador automaticamente (pra debug)
  // await browser.close();
})();
