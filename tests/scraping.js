const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // IMPORTANTE
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

  await page.goto(
    "http://dgp.cnpq.br/dgp/espelhogrupo/6038878475345897",
    { waitUntil: "networkidle2", timeout: 60000 }
  );

  await page.waitForSelector("#formVisualizarRH\\:tblEspelhoRHLPAtuacao_data");

  const dados = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll("#formVisualizarRH\\:tblEspelhoRHLPAtuacao_data tr")
    ).map(tr => {
      const tds = tr.querySelectorAll("td");
      return {
        linha: tds[0]?.innerText.trim(),
        grupo: tds[1]?.innerText.trim()
      };
    });
  });

  console.log(dados);

  await browser.close();
})();
