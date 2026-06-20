import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  configureDgpPage,
  DGP_CONFIG,
  extractGroupPeople,
  getLaunchOptions,
  navigateToDgpGroup,
} from "./dgpScraper.helpers.js";

puppeteer.use(StealthPlugin());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, "../../data/resultado_final_estudantes.json");

function ensureOutputDir() {
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
}

async function scrapeEstudantes(externalBrowser = null) {
  console.log("========================================");
  console.log("Iniciando scraping de estudantes");
  console.log("========================================");

  ensureOutputDir();

  const ownsBrowser = !externalBrowser;
  const browser = externalBrowser || (await puppeteer.launch(getLaunchOptions()));
  let page;

  try {
    page = await browser.newPage();
    await configureDgpPage(page);

    console.log(`Acessando pagina do grupo: ${DGP_CONFIG.url}`);
    await navigateToDgpGroup(page);

    const resultados = await extractGroupPeople(page, "estudante");
    console.log(`Total de estudantes encontrados: ${resultados.length}`);

    fs.writeFileSync(outputPath, JSON.stringify(resultados, null, 2), "utf-8");
    console.log(`Arquivo salvo: ${outputPath}`);

    return resultados;
  } finally {
    if (page && !page.isClosed()) {
      await page.close().catch(() => {});
    }

    if (ownsBrowser && browser) {
      await browser.close().catch(() => {});
    }
  }
}

export default scrapeEstudantes;
