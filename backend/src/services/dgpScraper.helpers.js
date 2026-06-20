import fs from "fs";

const DEFAULT_DGP_URL = "http://dgp.cnpq.br/dgp/espelhogrupo/6038878475345897";

export const DGP_CONFIG = {
  url: process.env.SCRAPE_URL || DEFAULT_DGP_URL,
  headless: process.env.SCRAPE_HEADLESS === "true",
  chromePath: process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  retryAttempts: Number(process.env.SCRAPE_RETRY_ATTEMPTS || 3),
  maxItems: Number(process.env.SCRAPE_MAX_ITEMS || 0),
  timeouts: {
    navigation: Number(process.env.SCRAPE_NAV_TIMEOUT || 180000),
    selector: Number(process.env.SCRAPE_SELECTOR_TIMEOUT || 90000),
    popup: Number(process.env.SCRAPE_POPUP_TIMEOUT || 60000),
    pageLoad: Number(process.env.SCRAPE_PAGE_LOAD_TIMEOUT || 90000),
    tableLoad: Number(process.env.SCRAPE_TABLE_TIMEOUT || 30000),
  },
  delays: {
    afterLoad: Number(process.env.SCRAPE_AFTER_LOAD_DELAY || 1800),
    afterClick: Number(process.env.SCRAPE_AFTER_CLICK_DELAY || 900),
    betweenPeople: Number(process.env.SCRAPE_BETWEEN_PEOPLE_DELAY || 350),
    beforeRetry: Number(process.env.SCRAPE_BEFORE_RETRY_DELAY || 1800),
    afterPopupClose: Number(process.env.SCRAPE_AFTER_POPUP_CLOSE_DELAY || 400),
  },
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function normalizeText(value) {
  return String(value || "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeKey(value) {
  return normalizeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function getLaunchOptions(overrides = {}) {
  const chromePath = overrides.executablePath || DGP_CONFIG.chromePath;
  const executablePath = chromePath && fs.existsSync(chromePath) ? chromePath : undefined;

  return {
    headless: overrides.headless ?? DGP_CONFIG.headless,
    executablePath,
    defaultViewport: null,
    ignoreHTTPSErrors: true,
    timeout: DGP_CONFIG.timeouts.navigation,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-extensions",
      "--disable-blink-features=AutomationControlled",
      "--window-size=1920,1080",
      ...(overrides.args || []),
    ],
  };
}

export async function configureDgpPage(page) {
  page.setDefaultNavigationTimeout(DGP_CONFIG.timeouts.navigation);
  page.setDefaultTimeout(DGP_CONFIG.timeouts.selector);

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );
}

export async function navigateToDgpGroup(page, url = DGP_CONFIG.url) {
  let lastError;

  for (let attempt = 1; attempt <= DGP_CONFIG.retryAttempts; attempt++) {
    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: DGP_CONFIG.timeouts.navigation,
      });
      await page.waitForSelector("body", {
        timeout: DGP_CONFIG.timeouts.selector,
      });
      await page.waitForFunction(
        () =>
          document.body.innerText.includes("Recursos humanos") ||
          document.querySelectorAll("table").length > 2,
        { timeout: DGP_CONFIG.timeouts.selector }
      );
      await sleep(DGP_CONFIG.delays.afterLoad);
      return;
    } catch (error) {
      lastError = error;
      await sleep(DGP_CONFIG.delays.beforeRetry * attempt);
    }
  }

  throw new Error(`Falha ao abrir pagina do DGP: ${lastError?.message || "erro desconhecido"}`);
}

function classifyTable(headers, rowText, kind) {
  const headerText = headers.map(normalizeKey).join(" | ");
  const bodyText = normalizeKey(rowText);
  let score = 0;

  if (kind === "pesquisador") {
    if (headerText.includes("pesquisadores")) score += 5;
    if (headerText.includes("titulacao maxima")) score += 5;
    if (bodyText.includes("idbtnvisualizarespelhopesquisador")) score += 4;
    if (bodyText.includes("idbtnvisualizarespelhopesquisadoregresso")) score -= 8;
  }

  if (kind === "estudante") {
    if (headerText.includes("estudantes")) score += 5;
    if (headerText.includes("nivel de treinamento") || headerText.includes("titulacao")) score += 5;
    if (bodyText.includes("idbtnvisualizarespelhoestudante")) score += 4;
    if (bodyText.includes("idbtnvisualizarespelhoestudanteegresso")) score -= 8;
  }

  if (headerText.includes("data inclusao")) score += 3;
  if (headerText.includes("periodo de participacao")) score -= 5;
  if (headerText.includes("acoes")) score += 1;

  return score;
}

export async function findPeopleTable(page, kind) {
  const tables = await page.$$("table");
  let best = null;

  for (const table of tables) {
    const meta = await table.evaluate((element) => {
      const headers = [...element.querySelectorAll("thead th")].map((th) =>
        (th.innerText || th.textContent || "").replace(/\s+/g, " ").trim()
      );
      const rows = [...element.querySelectorAll("tbody tr")];
      const rowText = rows
        .slice(0, 3)
        .map((row) => `${row.innerText || ""} ${row.innerHTML || ""}`)
        .join(" ");

      return {
        headers,
        rowText,
        rows: rows.filter((row) => !/nenhum registro/i.test(row.innerText || "")).length,
      };
    });

    const score = classifyTable(meta.headers, meta.rowText, kind);
    if (score > 0 && (!best || score > best.score)) {
      best = { table, meta, score };
    }
  }

  if (!best) {
    throw new Error(`Tabela de ${kind} nao encontrada no DGP`);
  }

  return best.table;
}

export async function getValidRows(tableHandle) {
  const rows = await tableHandle.$$("tbody tr");
  const validRows = [];

  for (const row of rows) {
    const valid = await row.evaluate((element) => {
      const text = (element.innerText || element.textContent || "").replace(/\s+/g, " ").trim();
      return Boolean(text) && !/nenhum registro/i.test(text);
    });

    if (valid) validRows.push(row);
  }

  return validRows;
}

export async function extractPersonFromRow(rowHandle) {
  return rowHandle.evaluate((row) => {
    function clean(value) {
      return String(value || "").replace(/\s+/g, " ").trim();
    }

    function key(value) {
      return clean(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    }

    const table = row.closest("table");
    const headers = [...(table?.querySelectorAll("thead th") || [])].map((th) => key(th.innerText));
    const cells = [...row.querySelectorAll("td")];

    const indexBy = (patterns, fallback) => {
      const found = headers.findIndex((header) => patterns.some((pattern) => header.includes(pattern)));
      return found >= 0 ? found : fallback;
    };

    const nameIndex = indexBy(["pesquisador", "estudante", "tecnico", "colaborador"], 0);
    const titleIndex = indexBy(["titulacao", "nivel de treinamento", "formacao academica"], 1);
    const dateIndex = indexBy(["data inclusao"], 2);

    return {
      nome: clean(cells[nameIndex]?.innerText),
      titulacao_MAX: clean(cells[titleIndex]?.innerText),
      data_inclusao: clean(cells[dateIndex]?.innerText),
    };
  });
}

export async function findActionLink(rowHandle, kind, action) {
  const links = await rowHandle.$$("a");
  const expectedMirror =
    kind === "pesquisador"
      ? "idbtnvisualizarespelhopesquisador"
      : "idbtnvisualizarespelhoestudante";

  for (const link of links) {
    const meta = await link.evaluate((element) => {
      const text = `${element.id || ""} ${element.getAttribute("onclick") || ""} ${
        element.title || ""
      } ${element.querySelector("button")?.title || ""} ${
        [...element.querySelectorAll("[class*='ui-icon']")].map((node) => node.className).join(" ")
      }`;

      return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    });

    const isEgresso = meta.includes("egresso");
    const isLattes = meta.includes("btnacessolattes") || meta.includes("ui-icon-contact");
    const isMirror = meta.includes(expectedMirror) || meta.includes("ui-icon-battery-2");

    if (action === "lattes" && isLattes && !isEgresso) return link;
    if (action === "espelho" && isMirror && !isEgresso) return link;
  }

  return null;
}

async function waitForNewPage(browser, previousPages, timeoutMs) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const pages = await browser.pages();
    const page = pages.find((candidate) => !previousPages.includes(candidate) && !candidate.isClosed());
    if (page) return page;
    await sleep(150);
  }

  return null;
}

export async function cleanupExtraPages(browser, mainPage) {
  const pages = await browser.pages();
  for (const page of pages) {
    if (page !== mainPage && !page.isClosed()) {
      try {
        await page.close({ runBeforeUnload: false });
      } catch {}
    }
  }
}

export async function openActionPage(mainPage, linkHandle) {
  const browser = mainPage.browser();
  await cleanupExtraPages(browser, mainPage);

  let lastError;

  for (let attempt = 1; attempt <= DGP_CONFIG.retryAttempts; attempt++) {
    try {
      const previousPages = await browser.pages();
      await linkHandle.evaluate((element) => element.scrollIntoView({ block: "center" }));

      const newPagePromise = waitForNewPage(browser, previousPages, DGP_CONFIG.timeouts.popup);
      await linkHandle.click({ delay: 80 });

      const newPage = await newPagePromise;
      if (!newPage) throw new Error("Nova aba nao foi aberta pelo DGP");

      await newPage.bringToFront().catch(() => {});
      await newPage.waitForSelector("body", { timeout: DGP_CONFIG.timeouts.pageLoad }).catch(() => {});
      await sleep(DGP_CONFIG.delays.afterClick);
      return newPage;
    } catch (error) {
      lastError = error;
      await cleanupExtraPages(browser, mainPage);
      await sleep(DGP_CONFIG.delays.beforeRetry * attempt);
    }
  }

  throw new Error(`Nao foi possivel abrir pagina de detalhes: ${lastError?.message || "erro desconhecido"}`);
}

export async function closePageSafely(page) {
  if (!page || page.isClosed()) return;

  try {
    await page.close({ runBeforeUnload: false });
  } catch {}

  await sleep(DGP_CONFIG.delays.afterPopupClose);
}

export async function extractMirrorData(page) {
  await page.waitForSelector("body", { timeout: DGP_CONFIG.timeouts.pageLoad }).catch(() => {});

  return page.evaluate(() => {
    function clean(value) {
      return String(value || "").replace(/\s+/g, " ").trim();
    }

    function key(value) {
      return clean(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    }

    const rawText = document.body.innerText || "";
    const lines = rawText
      .split(/\n+/)
      .map(clean)
      .filter(Boolean);

    const knownLabels = [
      "endereco para acessar este espelho",
      "nome",
      "titulacao",
      "titulacao maxima",
      "nivel de treinamento",
      "formacao academica",
      "ultima atualizacao do curriculo lattes",
      "homepage",
      "email",
      "e-mail",
    ];

    const isKnownLabel = (value) => {
      const valueKey = key(value).replace(/:$/, "");
      return knownLabels.some((label) => valueKey === label);
    };

    const valueAfterKey = (...patterns) => {
      const index = lines.findIndex((line) => {
        const lineKey = key(line).replace(/:$/, "");
        return patterns.some((pattern) => lineKey === pattern || lineKey.includes(pattern));
      });

      if (index < 0) return "";

      const currentLine = lines[index];
      const colonIndex = currentLine.indexOf(":");
      if (colonIndex >= 0) {
        const inlineValue = clean(currentLine.slice(colonIndex + 1));
        if (inlineValue) return inlineValue;
      }

      const nextLine = lines[index + 1] || "";
      return nextLine && !isKnownLabel(nextLine) ? nextLine : "";
    };

    const espelhoMatch = rawText.match(/(?:https?:\/\/)?dgp\.cnpq\.br\/dgp\/espelhorh\/(\d+)/i);
    const espelhoUrl = espelhoMatch ? `http://dgp.cnpq.br/dgp/espelhorh/${espelhoMatch[1]}` : location.href;
    const lattesUrl = espelhoMatch ? `http://lattes.cnpq.br/${espelhoMatch[1]}` : "";
    const emailMatch = rawText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

    const tableData = [...document.querySelectorAll("table")].map((table) => {
      const headers = [...table.querySelectorAll("thead th")].map((th) => clean(th.innerText || th.textContent));
      const headerKeys = headers.map(key);
      const rows = [...table.querySelectorAll("tbody tr")]
        .map((row) => {
          const cells = [...row.querySelectorAll("td")].map((td) => clean(td.innerText || td.textContent));
          return { cells, text: clean(row.innerText || row.textContent) };
        })
        .filter((row) => row.text && !key(row.text).includes("nenhum registro"));

      return { headers, headerKeys, rows };
    });

    const linhasTable = tableData
      .map((table) => {
        const linhaIndex = table.headerKeys.findIndex((header) => header.includes("linha de pesquisa"));
        const grupoIndex = table.headerKeys.findIndex(
          (header) => header.includes("nome do grupo") || header === "grupo"
        );
        const score = (linhaIndex >= 0 ? 5 : 0) + (grupoIndex >= 0 ? 5 : 0);
        return { ...table, linhaIndex, grupoIndex, score };
      })
      .sort((a, b) => b.score - a.score)[0];

    const linhasPesquisa =
      linhasTable && linhasTable.score >= 10
        ? linhasTable.rows
            .map((row) => ({
              linha_pesquisa: row.cells[linhasTable.linhaIndex] || "",
              grupo: row.cells[linhasTable.grupoIndex] || "",
            }))
            .filter((row) => row.linha_pesquisa && row.grupo && !key(row.linha_pesquisa).includes("ui-button"))
        : [];

    const homepage = valueAfterKey("homepage");

    return {
      espelho_url: espelhoUrl,
      espelhoUrl,
      id_lattes: espelhoMatch?.[1] || "",
      lattes_url: lattesUrl,
      lattesUrl,
      titulacao: valueAfterKey("titulacao", "nivel de treinamento", "titulacao maxima", "formacao academica"),
      ultima_atualizacao_lattes: valueAfterKey("ultima atualizacao do curriculo lattes"),
      homepage: homepage.includes("@") ? "" : homepage,
      email: emailMatch?.[0] || (homepage.includes("@") ? homepage : ""),
      linhas_pesquisa: linhasPesquisa,
    };
  });
}

export async function extractGroupPeople(page, kind) {
  const table = await findPeopleTable(page, kind);
  const rows = await getValidRows(table);
  const selectedRows = DGP_CONFIG.maxItems > 0 ? rows.slice(0, DGP_CONFIG.maxItems) : rows;
  const people = [];

  for (const row of selectedRows) {
    const person = await extractPersonFromRow(row);
    if (person.nome) people.push(person);
  }

  return people;
}
