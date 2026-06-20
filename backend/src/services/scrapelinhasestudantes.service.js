import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  cleanupExtraPages,
  closePageSafely,
  configureDgpPage,
  DGP_CONFIG,
  extractMirrorData,
  extractPersonFromRow,
  findActionLink,
  findPeopleTable,
  getLaunchOptions,
  getValidRows,
  navigateToDgpGroup,
  openActionPage,
  sleep,
} from "./dgpScraper.helpers.js";

puppeteer.use(StealthPlugin());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, "../../data/resultado_linha_estudantes.json");

async function safeWrite(data) {
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`Resultados salvos em: ${outputPath}`);
}

function sliceRows(rows, chunkOptions) {
  const startIndex = Number(chunkOptions?.startIndex || 0);
  const endIndex =
    chunkOptions?.endIndex === undefined ? rows.length - 1 : Number(chunkOptions.endIndex);
  const chunk = rows.slice(startIndex, endIndex + 1);
  return DGP_CONFIG.maxItems > 0 ? chunk.slice(0, DGP_CONFIG.maxItems) : chunk;
}

async function processStudent(mainPage, rowHandle, index, total) {
  const basePerson = await extractPersonFromRow(rowHandle);
  const label = basePerson.nome || `Estudante ${index + 1}`;

  console.log(`[${index + 1}/${total}] Processando estudante: ${label}`);

  let detailPage = null;
  let lastError = null;

  for (let attempt = 1; attempt <= DGP_CONFIG.retryAttempts; attempt++) {
    try {
      const linkHandle = await findActionLink(rowHandle, "estudante", "espelho");
      if (!linkHandle) {
        throw new Error("Botao de espelho do estudante nao encontrado");
      }

      detailPage = await openActionPage(mainPage, linkHandle);
      const mirrorData = await extractMirrorData(detailPage);

      await closePageSafely(detailPage);
      detailPage = null;

      return {
        ...basePerson,
        ...mirrorData,
        espelhoUrl: mirrorData.espelhoUrl || mirrorData.espelho_url,
        linhas_pesquisa: mirrorData.linhas_pesquisa || [],
      };
    } catch (error) {
      lastError = error;
      console.warn(`Tentativa ${attempt} falhou para ${label}: ${error.message}`);

      if (detailPage && !detailPage.isClosed()) {
        await closePageSafely(detailPage);
        detailPage = null;
      }

      await cleanupExtraPages(mainPage.browser(), mainPage);
      await sleep(DGP_CONFIG.delays.beforeRetry * attempt);
    }
  }

  return {
    ...basePerson,
    error: lastError?.message || "Falha ao processar estudante",
    linhas_pesquisa: [],
  };
}

export default async function scrapeLinhasEstudantes(externalBrowser = null, chunkOptions = null) {
  console.log("========================================");
  console.log("Iniciando scraping de linhas dos estudantes");
  console.log("========================================");

  const ownsBrowser = !externalBrowser;
  const browser = externalBrowser || (await puppeteer.launch(getLaunchOptions()));
  const resultados = [];
  let mainPage = null;

  try {
    mainPage = await browser.newPage();
    await configureDgpPage(mainPage);
    await navigateToDgpGroup(mainPage);

    const tableHandle = await findPeopleTable(mainPage, "estudante");
    const rows = sliceRows(await getValidRows(tableHandle), chunkOptions);

    console.log(`Estudantes para processar: ${rows.length}`);

    for (let i = 0; i < rows.length; i++) {
      const result = await processStudent(mainPage, rows[i], i, rows.length);
      resultados.push(result);

      if ((i + 1) % 5 === 0 || i === rows.length - 1) {
        await safeWrite(resultados);
        await cleanupExtraPages(browser, mainPage);
      }

      if (i < rows.length - 1) {
        await sleep(DGP_CONFIG.delays.betweenPeople);
      }
    }

    const withData = resultados.filter((item) => item.linhas_pesquisa?.length > 0).length;
    const errors = resultados.filter((item) => item.error).length;
    console.log(`Concluido: ${resultados.length} estudantes, ${withData} com linhas, ${errors} erros`);

    await safeWrite(resultados);
    return resultados;
  } catch (error) {
    if (resultados.length > 0) {
      await safeWrite(resultados);
    }
    throw error;
  } finally {
    if (browser && mainPage) {
      await cleanupExtraPages(browser, mainPage).catch(() => {});
    }

    if (mainPage && !mainPage.isClosed()) {
      await mainPage.close().catch(() => {});
    }

    if (ownsBrowser && browser) {
      await browser.close().catch(() => {});
    }
  }
}
