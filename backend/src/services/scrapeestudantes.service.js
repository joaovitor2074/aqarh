// scrapeEstudantes.service.js (depurado)
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

puppeteer.use(StealthPlugin());

const URL = "http://dgp.cnpq.br/dgp/espelhogrupo/6038878475345897";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

// sleep util
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(__dirname, "../../data/resultado_final_estudantes.json");
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

function escapeCssId(id) {
  // simples escape para ':' e caracteres especiais usados aqui
  return id.replace(/([:\.\#\[\],=])/g, "\\$1");
}

async function findExistingSelector(page, ids, perIdTimeout = 30000) {
  // tenta um a um, com timeout curto, e retorna o selector encontrado ou null
  for (const id of ids) {
    const selector = `#${escapeCssId(id)}`;
    try {
      await page.waitForSelector(selector, { timeout: perIdTimeout });
      return selector;
    } catch (e) {
      // não encontrado, continua
    }
  }
  return null;
}

async function scrapeEstudantes() {
  console.log("========================================");
  console.log("Iniciando scraping de estudantes");
  console.log("========================================");

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME_PATH,
    defaultViewport: null,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  console.log("Navegador iniciado");

  const page = await browser.newPage();
  page.setDefaultTimeout(30000);
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );

  // opcional: bloquear recursos pesados para acelerar
  try {
    await page.setRequestInterception(true);
    page.on("request", req => {
      const t = req.resourceType();
      if (["image", "stylesheet", "font"].includes(t)) req.abort();
      else req.continue();
    });
  } catch (e) {
    // se algo der errado com interception, seguimos sem bloqueio
    console.warn("Request interception não disponível:", e.message || e);
  }

  console.log("Acessando página do grupo...");
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  console.log("Página acessada");

  // possíveis ids (sem escapar)
  const TBODY_IDS = [
    "idFormVisualizarGrupoPesquisa:j_idt288_data",
    "idFormVisualizarGrupoPesquisa:j_idt289_data",
    "idFormVisualizarGrupoPesquisa:j_idt289_data",
    "idFormVisualizarGrupoPesquisa:j_idt294_data"
  ];

  console.log("Procurando tbody com um dos possíveis ids...");
  const tbodySelector = await findExistingSelector(page, TBODY_IDS, 5000);

  if (!tbodySelector) {
    await browser.close();
    throw new Error("Nenhum tbody encontrado: verifique os IDs ou o carregamento da página.");
  }

  console.log("Tbody encontrado ->", tbodySelector);

  // conta linhas usando o selector correto
  const rowSelector = `${tbodySelector} > tr`;
  const totalRows = await page.$$eval(rowSelector, els => els.length);
  console.log(`Total de estudantes encontrados: ${totalRows}`);

  const resultados = [];

  for (let i = 0; i < totalRows; i++) {
    const rowNthSelector = `${tbodySelector} > tr:nth-of-type(${i + 1})`;
    try {
      // checar se a linha existe antes de usar $eval
      const rowHandle = await page.$(rowNthSelector);
      if (!rowHandle) {
        console.warn(`Linha ${i + 1} não encontrada (selector: ${rowNthSelector}) — pulando`);
        continue;
      }

      // função segura para extrair texto de uma célula (ou null)
      async function safeCellText(selector) {
        const h = await page.$(selector);
        if (!h) return null;
        const text = await h.evaluate(el => (el.innerText || "").trim());
        await h.dispose();
        return text;
      }

      const nomeSel = `${rowNthSelector} td:nth-child(1)`;
      const titulacaoSel = `${rowNthSelector} td:nth-child(2)`;
      const dataSel = `${rowNthSelector} td:nth-child(3)`;

      const nome = await safeCellText(nomeSel) || "";
      const titulacao_MAX = await safeCellText(titulacaoSel) || "";
      const data_inclusao = await safeCellText(dataSel) || "";

      resultados.push({ nome, titulacao_MAX, data_inclusao });
      console.log(`[${i + 1}/${totalRows}] OK - ${nome}`);

      // pequeno atraso para não sobrecarregar o servidor (ajuste conforme necessidade)
      await sleep(200);
    } catch (err) {
      console.error(`Erro linha ${i + 1}:`, err && err.message ? err.message : err);
    }
  }

  console.log("----------------------------------------");
  console.log("Salvando arquivo JSON...");

  try {
    fs.writeFileSync(outputPath, JSON.stringify(resultados, null, 2), "utf-8");
    console.log(`Arquivo salvo: ${outputPath}`);
  } catch (err) {
    console.error("Erro ao salvar arquivo:", err);
  }

  console.log("Scraping finalizado com sucesso");

  return resultados;
}

export default scrapeEstudantes;
