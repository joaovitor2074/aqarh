const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");

puppeteer.use(StealthPlugin());

const URL = "http://dgp.cnpq.br/dgp/espelhogrupo/6038878475345897";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: CHROME_PATH,
    defaultViewport: null
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );

  console.log("Abrindo página do grupo...");
  await page.goto(URL, { waitUntil: "networkidle2" });

  // Aguarda tabela de pesquisadores
  await page.waitForSelector(
    "#idFormVisualizarGrupoPesquisa\\:j_idt271_data tr",
    { timeout: 30000 }
  );

  // Pega somente a primeira linha
  const primeiraLinha = await page.$(
    "#idFormVisualizarGrupoPesquisa\\:j_idt271_data tr"
  );

  if (!primeiraLinha) {
    throw new Error("Nenhuma linha encontrada na tabela principal");
  }

  // 🔹 AQUI ESTÁ A CORREÇÃO
  const linkEspelho = await primeiraLinha.$(
    "a[id*='idBtnVisualizarEspelhoPesquisador']"
  );

  if (!linkEspelho) {
    throw new Error("Link do espelho não encontrado na linha");
  }

  console.log("Abrindo espelho do pesquisador...");

  const [espelhoPage] = await Promise.all([
    new Promise(resolve =>
      browser.once("targetcreated", async target => {
        const p = await target.page();
        resolve(p);
      })
    ),
    linkEspelho.click()
  ]);

  await espelhoPage.bringToFront();

  // Espera o PrimeFaces carregar os dados reais (AJAX)
  await espelhoPage.waitForFunction(() => {
    const rows = document.querySelectorAll(
      "tbody[id$='tblEspelhoRHLPAtuacao_data'] tr[data-ri]"
    );
    return rows.length > 0;
  }, { timeout: 30000 });

  // Extrai os dados
  const dados = await espelhoPage.evaluate(() => {
    const rows = document.querySelectorAll(
      "tbody[id$='tblEspelhoRHLPAtuacao_data'] tr[data-ri]"
    );

    return Array.from(rows).map(tr => {
      const tds = tr.querySelectorAll("td");
      return {
        linha_pesquisa: tds[0]?.innerText.trim() || "",
        grupo: tds[1]?.innerText.trim() || ""
      };
    });
  });

  console.log("DADOS EXTRAÍDOS:");
  console.log(dados);

  fs.writeFileSync(
    "teste_linha1.json",
    JSON.stringify(dados, null, 2),
    "utf-8"
  );

  console.log("Arquivo teste_linha1.json salvo com sucesso");

  // Não fechar o browser para debug
  // await browser.close();
})();
