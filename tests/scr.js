const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // precisa ser false
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    userDataDir: "./perfil-chrome", // salva cookies e sessão
    args: [
      "--start-maximized",
      "--disable-blink-features=AutomationControlled"
    ],
    defaultViewport: null
  });

  const page = await browser.newPage();

  await page.goto(
    "http://dgp.cnpq.br/dgp/espelhorh/0050280708#linhasPesquisa",
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );

  // espera a tabela aparecer
  await page.waitForSelector("#formVisualizarRH\\:tblEspelhoRHLPAtuacao", {
    timeout: 30000
  });

  const dados = await page.evaluate(() => {
    return [...document.querySelectorAll(
      "#formVisualizarRH\\:tblEspelhoRHLPAtuacao_data tr"
    )].map(tr => {
      const tds = tr.querySelectorAll("td");
      return {
        linha: tds[0]?.innerText.trim(),
        grupo: tds[1]?.innerText.trim()
      };
    });
  });

  console.log(dados);
})();
