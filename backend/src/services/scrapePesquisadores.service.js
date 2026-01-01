import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

puppeteer.use(StealthPlugin());


puppeteer.use(StealthPlugin());

const URL = "http://dgp.cnpq.br/dgp/espelhogrupo/6038878475345897";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

// sleep compatível com puppeteer antigo
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(
  __dirname,
  "../../data/resultado_final_pesquisadores.json"
);






async function scrapePesquisadores() {
  console.log("========================================");
  console.log("🚀 Iniciando scraping de pesquisadores");
  console.log("========================================");

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: CHROME_PATH,
    defaultViewport: null,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  console.log("✅ Navegador iniciado");

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );

  console.log("🌐 Acessando página do grupo...");
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
  console.log("✅ Página carregada com sucesso");

  const rowSelectorBase = "#idFormVisualizarGrupoPesquisa\\:j_idt271_data tr";
  console.log("🔍 Aguardando tabela de pesquisadores...");
  await page.waitForSelector(rowSelectorBase);
  console.log("✅ Tabela encontrada");

  const totalRows = await page.$$eval(rowSelectorBase, els => els.length);
  console.log(`📊 Total de pesquisadores encontrados: ${totalRows}`);

  const resultados = [];

  for (let i = 0; i < totalRows; i++) {
    const rowNth = `${rowSelectorBase}:nth-of-type(${i + 1})`;
    console.log("----------------------------------------");
    console.log(`➡️ Processando linha ${i + 1} de ${totalRows}`);

    try {
      const nome = await page.$eval(
        `${rowNth} td:nth-child(1)`,
        td => td.innerText.trim()
      );
      console.log(`   👤 Nome: ${nome}`);

      const titulacao_MAX = await page.$eval(
        `${rowNth} td:nth-child(2)`,
        td => td.innerText.trim()
      );
      console.log(`   🎓 Titulação máx.: ${titulacao_MAX}`);

      const data_inclusao = await page.$eval(
        `${rowNth} td:nth-child(3)`,
        td => td.innerText.trim()
      );
      console.log(`   📅 Data de inclusão: ${data_inclusao}`);

      const link = await page.$(
        `${rowNth} a[id*='idBtnVisualizarEspelhoPesquisador']`
      );

      if (!link) {
        console.warn(`   ⚠️ Link do espelho NÃO encontrado (${nome})`);
        resultados.push({ nome, error: "link_not_found" });
        continue;
      }

      console.log("   🔗 Link do espelho encontrado");

      resultados.push({
        nome,
        titulacao_MAX,
        data_inclusao
      });

      console.log("   ✅ Pesquisador salvo com sucesso");

    } catch (err) {
      console.error(`   ❌ Erro ao processar linha ${i + 1}`);
      console.error(`      Motivo: ${err.message}`);

      resultados.push({
        index: i + 1,
        error: err.message
      });

      await sleep(500);
    }
  }

  console.log("----------------------------------------");
  console.log("💾 Salvando arquivo JSON...");

  fs.writeFileSync(
    outputPath,
    JSON.stringify(resultados, null, 2),
    "utf-8"
  );
  return resultados
  

  console.log("✅ Arquivo salvo: resultado_final_pesquisadores.json");
  console.log("🏁 Scraping finalizado com sucesso");
};

export default scrapePesquisadores;
