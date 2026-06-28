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
  includePersonDetails: process.env.SCRAPE_INCLUDE_DETAILS !== "false",
  includeLattes: process.env.SCRAPE_INCLUDE_LATTES !== "false",
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
    const isLattes =
      meta.includes("btnacessolattes") ||
      meta.includes("ui-icon-contact") ||
      meta.includes("curriculo lattes") ||
      meta.includes("curriculo") ||
      meta.includes("lattes");
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

    function cleanActionNoise(value) {
      return clean(
        String(value || "")
          .replace(/\bui-button\b/gi, " ")
          .replace(/Visualizar\s+(espelho|historico|histórico)[^.;]*/gi, " ")
          .replace(/Fechar|Imprimir|Processando|Sua solicitação está sendo executada\.?\s*Aguarde\.?/gi, " ")
      );
    }

    function splitList(value) {
      return clean(value)
        .split(/\s*;\s*|\n+/)
        .map(clean)
        .filter(Boolean);
    }

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

    const fieldValue = (...patterns) => {
      const labels = [...document.querySelectorAll("label, .control-label")];
      const label = labels.find((element) => {
        const labelKey = key(element.innerText || element.textContent).replace(/:$/, "");
        return patterns.some((pattern) => labelKey === pattern || labelKey.includes(pattern));
      });

      if (!label) return "";

      const group = label.closest(".control-group") || label.parentElement;
      const valueElement =
        group?.querySelector(".controls") ||
        label.nextElementSibling ||
        group?.querySelector("div:not(.control-label)");

      return cleanActionNoise(valueElement?.innerText || valueElement?.textContent || "");
    };

    const espelhoMatch = rawText.match(/(?:https?:\/\/)?dgp\.cnpq\.br\/dgp\/espelhorh\/(\d+)/i);
    const espelhoUrl = espelhoMatch ? `http://dgp.cnpq.br/dgp/espelhorh/${espelhoMatch[1]}` : location.href;
    const lattesUrl = espelhoMatch ? `http://lattes.cnpq.br/${espelhoMatch[1]}` : "";
    const emailMatch = rawText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

    const tableData = [...document.querySelectorAll("table")].map((table, index) => {
      const headers = [...table.querySelectorAll("thead th")].map((th) => clean(th.innerText || th.textContent));
      const headerKeys = headers.map(key);
      const rows = [...table.querySelectorAll("tbody tr")]
        .map((row) => {
          const cells = [...row.querySelectorAll("td")].map((td) =>
            cleanActionNoise(td.innerText || td.textContent)
          );
          return { cells, text: cleanActionNoise(row.innerText || row.textContent) };
        })
        .filter((row) => row.text && !key(row.text).includes("nenhum registro"));

      return { index, headers, headerKeys, rows };
    });

    const columnIndex = (table, ...patterns) =>
      table?.headerKeys.findIndex((header) => patterns.some((pattern) => header.includes(pattern))) ?? -1;

    const hasColumns = (table, ...patterns) =>
      patterns.every((pattern) => columnIndex(table, pattern) >= 0);

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

    const gruposTable = tableData.find((table) =>
      hasColumns(table, "nome do grupo", "instituicao", "perfil")
    );
    const gruposPesquisa = gruposTable
      ? gruposTable.rows
          .map((row) => ({
            nome: row.cells[columnIndex(gruposTable, "nome do grupo")] || "",
            instituicao: row.cells[columnIndex(gruposTable, "instituicao")] || "",
            perfil: row.cells[columnIndex(gruposTable, "perfil")] || "",
          }))
          .filter((row) => row.nome)
      : [];

    const estudantesTable = tableData.find((table) =>
      hasColumns(table, "estudante", "nivel de treinamento", "grupo de pesquisa")
    );
    const estudantesOrientados = estudantesTable
      ? estudantesTable.rows
          .map((row) => ({
            nome: row.cells[columnIndex(estudantesTable, "estudante")] || "",
            nivel_treinamento: row.cells[columnIndex(estudantesTable, "nivel de treinamento")] || "",
            grupo_pesquisa: row.cells[columnIndex(estudantesTable, "grupo de pesquisa")] || "",
          }))
          .filter((row) => row.nome)
      : [];

    const gruposEgressoTable = tableData.find(
      (table) =>
        table.index !== gruposTable?.index &&
        hasColumns(table, "nome do grupo", "instituicao") &&
        columnIndex(table, "perfil") < 0 &&
        columnIndex(table, "estudante") < 0
    );
    const gruposEgresso = gruposEgressoTable
      ? gruposEgressoTable.rows
          .map((row) => ({
            nome: row.cells[columnIndex(gruposEgressoTable, "nome do grupo")] || "",
            instituicao: row.cells[columnIndex(gruposEgressoTable, "instituicao")] || "",
          }))
          .filter((row) => row.nome)
      : [];

    const nomeCitacoes = fieldValue("nome em citacoes bibliograficas") ||
      valueAfterKey("nome em citacoes bibliograficas");
    const areasAtuacao = splitList(fieldValue("areas de atuacao") || valueAfterKey("areas de atuacao"));
    const bolsistaCnpq = fieldValue("bolsista cnpq") || valueAfterKey("bolsista cnpq");
    const homepageRaw = fieldValue("homepage") || valueAfterKey("homepage");
    const homepage =
      homepageRaw &&
      !homepageRaw.includes("@") &&
      !key(homepageRaw).includes("grupos de pesquisa")
        ? homepageRaw
        : "";

    const dadosEspelho = {
      nome_citacoes: nomeCitacoes,
      nomes_citacao: splitList(nomeCitacoes),
      areas_atuacao: areasAtuacao,
      bolsista_cnpq: bolsistaCnpq,
      homepage,
      grupos_pesquisa: gruposPesquisa,
      linhas_pesquisa: linhasPesquisa,
      estudantes_orientados: estudantesOrientados,
      grupos_egresso: gruposEgresso,
      indicadores_producao_disponiveis: key(rawText).includes("indicadores de producao"),
    };

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
      nome_citacoes: nomeCitacoes,
      nomes_citacao: dadosEspelho.nomes_citacao,
      areas_atuacao_dgp: areasAtuacao,
      bolsista_cnpq: bolsistaCnpq,
      grupos_pesquisa_dgp: gruposPesquisa,
      estudantes_orientados: estudantesOrientados,
      grupos_egresso_dgp: gruposEgresso,
      indicadores_producao_disponiveis: dadosEspelho.indicadores_producao_disponiveis,
      dados_espelho: dadosEspelho,
    };
  });
}

export async function extractLattesData(page) {
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

    function unique(values) {
      const seen = new Set();
      return values.filter((value) => {
        const normalized = key(value);
        if (!normalized || seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
      });
    }

    const rawText = document.body.innerText || "";
    const lines = rawText
      .split(/\n+/)
      .map(clean)
      .filter(Boolean);

    const sectionLabels = [
      "dados pessoais",
      "dados gerais",
      "formacao academica",
      "formacao academica/titulacao",
      "formacao complementar",
      "atuacao profissional",
      "areas de atuacao",
      "linhas de pesquisa",
      "projetos de pesquisa",
      "projetos de extensao",
      "projetos de desenvolvimento",
      "producao bibliografica",
      "producoes bibliograficas",
      "artigos completos publicados em periodicos",
      "livros e capitulos",
      "capitulos de livros publicados",
      "trabalhos publicados em anais de eventos",
      "producao tecnica",
      "producoes tecnicas",
      "bancas",
      "participacao em bancas",
      "orientacoes",
      "orientacoes e supervisoes",
      "orientacoes concluidas",
      "orientacoes em andamento",
      "eventos",
      "participacao em eventos",
      "educacao e popularizacao",
      "resumo",
      "resumo informado pelo autor",
    ];

    const valueAfterKey = (...patterns) => {
      const index = lines.findIndex((line) => {
        const lineKey = key(line).replace(/:$/, "");
        return patterns.some((pattern) => lineKey === pattern || lineKey.includes(pattern));
      });

      if (index < 0) return "";

      const line = lines[index];
      const colonIndex = line.indexOf(":");
      if (colonIndex >= 0) {
        const inlineValue = clean(line.slice(colonIndex + 1));
        if (inlineValue) return inlineValue;
      }

      const updateMatch = line.match(/em\s+(.+)$/i);
      if (updateMatch?.[1]) return clean(updateMatch[1]);

      const nextLine = lines[index + 1] || "";
      return sectionLabels.some((label) => key(nextLine) === label) ? "" : nextLine;
    };

    const sanitizeSectionItem = (value) => {
      const cleaned = clean(
        String(value || "")
          .replace(/^[-*]\s*/, "")
          .replace(/\bexpandir\b/gi, "")
          .replace(/\bcontrair\b/gi, "")
          .replace(/\bmostrar tudo\b/gi, "")
      );
      const cleanedKey = key(cleaned);

      if (!cleaned) return "";
      if (cleanedKey.includes("pagina gerada pelo sistema curriculo lattes")) return "";
      if (cleanedKey.includes("curriculo lattes")) return "";
      if (cleanedKey.includes("conselho nacional de desenvolvimento cientifico")) return "";
      return cleaned;
    };

    const collectSection = (startPatterns, limit = 10) => {
      const startIndex = lines.findIndex((line) => {
        const lineKey = key(line).replace(/:$/, "");
        return startPatterns.some((pattern) => lineKey === pattern || lineKey.includes(pattern));
      });

      if (startIndex < 0) return [];

      const values = [];
      for (let index = startIndex + 1; index < lines.length; index++) {
        const line = lines[index];
        const lineKey = key(line).replace(/:$/, "");
        const isNextSection =
          values.length > 0 &&
          sectionLabels.some((label) => lineKey === label || lineKey.startsWith(`${label} `));

        if (isNextSection) break;
        if (!line || startPatterns.some((pattern) => lineKey.includes(pattern))) continue;

        const item = sanitizeSectionItem(line);
        if (item) values.push(item);
        if (values.length >= limit) break;
      }

      return unique(values);
    };

    const idMatch =
      location.href.match(/lattes\.cnpq\.br\/(\d+)/i) ||
      location.href.match(/[?&]id=([A-Z0-9]+)/i) ||
      rawText.match(/lattes\.cnpq\.br\/(\d+)/i);
    const idLattes = idMatch?.[1] || "";
    const lattesUrl = location.href;
    const hasCaptcha =
      Boolean(document.querySelector("#divCaptcha, .g-recaptcha, [class*='captcha']")) ||
      (key(rawText).includes("captcha") && key(rawText).includes("visualizar curriculo"));

    if (hasCaptcha) {
      return {
        lattes_url: lattesUrl,
        lattesUrl,
        id_lattes: idLattes,
        ultima_atualizacao_lattes: "",
        resumo_lattes: "",
        nome_citacoes: "",
        linhas_pesquisa_lattes: [],
        dados_lattes: {
          lattes_url: lattesUrl,
          id_lattes: idLattes,
          coleta_lattes_status: "captcha",
          coleta_lattes_mensagem: "Curriculo Lattes protegido por verificacao automatica.",
          pagina_lattes_coletada_em: new Date().toISOString(),
        },
      };
    }
    const resumo = collectSection(["resumo informado pelo autor", "resumo"], 6).join(" ");
    const linhasPesquisaLattes = collectSection(["linhas de pesquisa"], 20);
    const artigosPublicados = collectSection(["artigos completos publicados em periodicos"], 12);
    const capitulosLivros = collectSection(
      ["livros e capitulos", "capitulos de livros publicados", "livros publicados"],
      12
    );
    const trabalhosEventos = collectSection(["trabalhos publicados em anais de eventos"], 12);
    const orientacoesConcluidas = collectSection(["orientacoes concluidas"], 12);
    const orientacoesAndamento = collectSection(["orientacoes em andamento"], 12);

    const dadosLattes = {
      lattes_url: lattesUrl,
      id_lattes: idLattes,
      nome_citacoes: valueAfterKey("nome em citacoes bibliograficas", "nome em citações bibliográficas"),
      ultima_atualizacao_lattes: valueAfterKey(
        "ultima atualizacao do curriculo",
        "ultima atualizacao do curriculo lattes"
      ),
      resumo_lattes: resumo,
      formacao_academica: collectSection(["formacao academica", "formacao academica/titulacao"], 12),
      formacao_complementar: collectSection(["formacao complementar"], 12),
      atuacao_profissional: collectSection(["atuacao profissional"], 12),
      areas_atuacao: collectSection(["areas de atuacao"], 12),
      linhas_pesquisa_lattes: linhasPesquisaLattes,
      projetos_pesquisa: collectSection(["projetos de pesquisa"], 12),
      projetos_extensao: collectSection(["projetos de extensao"], 12),
      projetos_desenvolvimento: collectSection(["projetos de desenvolvimento"], 12),
      producoes_bibliograficas: collectSection(
        ["producao bibliografica", "producoes bibliograficas"],
        16
      ),
      artigos_publicados: artigosPublicados,
      capitulos_livros: capitulosLivros,
      trabalhos_eventos: trabalhosEventos,
      producoes_tecnicas: collectSection(["producao tecnica", "producoes tecnicas"], 12),
      orientacoes: unique([...orientacoesConcluidas, ...orientacoesAndamento]),
      orientacoes_concluidas: orientacoesConcluidas,
      orientacoes_em_andamento: orientacoesAndamento,
      bancas: collectSection(["bancas", "participacao em bancas"], 12),
      eventos: collectSection(["eventos", "participacao em eventos"], 12),
      educacao_popularizacao: collectSection(["educacao e popularizacao"], 12),
      coleta_lattes_status: "ok",
      pagina_lattes_coletada_em: new Date().toISOString(),
    };

    return {
      lattes_url: lattesUrl,
      lattesUrl,
      id_lattes: idLattes,
      ultima_atualizacao_lattes: dadosLattes.ultima_atualizacao_lattes,
      resumo_lattes: resumo,
      nome_citacoes: dadosLattes.nome_citacoes,
      linhas_pesquisa_lattes: linhasPesquisaLattes,
      dados_lattes: dadosLattes,
    };
  });
}

async function collectActionData(mainPage, rowHandle, kind, action, extractor) {
  let detailPage = null;
  let lastError = null;

  for (let attempt = 1; attempt <= DGP_CONFIG.retryAttempts; attempt++) {
    try {
      const linkHandle = await findActionLink(rowHandle, kind, action);
      if (!linkHandle) {
        throw new Error(`Botao de ${action} nao encontrado`);
      }

      detailPage = await openActionPage(mainPage, linkHandle);
      const data = await extractor(detailPage);

      await closePageSafely(detailPage);
      detailPage = null;

      return { data, error: null };
    } catch (error) {
      lastError = error;

      if (detailPage && !detailPage.isClosed()) {
        await closePageSafely(detailPage);
        detailPage = null;
      }

      await cleanupExtraPages(mainPage.browser(), mainPage);
      await sleep(DGP_CONFIG.delays.beforeRetry * attempt);
    }
  }

  return {
    data: null,
    error: lastError?.message || `Falha ao coletar ${action}`,
  };
}

export async function collectPersonDetails(mainPage, rowHandle, kind, options = {}) {
  const basePerson = await extractPersonFromRow(rowHandle);
  const errors = [];

  const mirrorResult = await collectActionData(
    mainPage,
    rowHandle,
    kind,
    "espelho",
    extractMirrorData
  );
  const mirrorData = mirrorResult.data || {};

  if (mirrorResult.error) {
    errors.push({ fonte: "espelho", mensagem: mirrorResult.error });
  }

  const shouldIncludeLattes = options.includeLattes ?? DGP_CONFIG.includeLattes;
  let lattesData = {};

  if (shouldIncludeLattes) {
    const lattesResult = await collectActionData(
      mainPage,
      rowHandle,
      kind,
      "lattes",
      extractLattesData
    );

    lattesData = lattesResult.data || {};

    if (lattesResult.error) {
      errors.push({ fonte: "lattes", mensagem: lattesResult.error });
    }
  }

  const espelhoUrl = mirrorData.espelho_url || mirrorData.espelhoUrl || "";
  const lattesUrl =
    lattesData.lattes_url || lattesData.lattesUrl || mirrorData.lattes_url || mirrorData.lattesUrl || "";
  const dadosLattes = {
    ...(lattesData.dados_lattes || {}),
    espelho_url: espelhoUrl || null,
    dados_espelho: mirrorData.dados_espelho || {
      nome_citacoes: mirrorData.nome_citacoes || "",
      nomes_citacao: mirrorData.nomes_citacao || [],
      areas_atuacao: mirrorData.areas_atuacao_dgp || [],
      bolsista_cnpq: mirrorData.bolsista_cnpq || "",
      homepage: mirrorData.homepage || "",
      grupos_pesquisa: mirrorData.grupos_pesquisa_dgp || [],
      linhas_pesquisa: mirrorData.linhas_pesquisa || [],
      estudantes_orientados: mirrorData.estudantes_orientados || [],
      grupos_egresso: mirrorData.grupos_egresso_dgp || [],
      indicadores_producao_disponiveis: Boolean(mirrorData.indicadores_producao_disponiveis),
    },
  };

  return {
    ...basePerson,
    ...mirrorData,
    ...lattesData,
    espelho_url: espelhoUrl || null,
    espelhoUrl: espelhoUrl || null,
    lattes_url: lattesUrl || null,
    lattesUrl: lattesUrl || null,
    id_lattes: lattesData.id_lattes || mirrorData.id_lattes || null,
    ultima_atualizacao_lattes:
      lattesData.ultima_atualizacao_lattes || mirrorData.ultima_atualizacao_lattes || null,
    linhas_pesquisa: mirrorData.linhas_pesquisa || [],
    dados_lattes: dadosLattes,
    scraping_erros: errors,
  };
}

export async function extractGroupPeople(page, kind, options = {}) {
  const table = await findPeopleTable(page, kind);
  const rows = await getValidRows(table);
  const selectedRows = DGP_CONFIG.maxItems > 0 ? rows.slice(0, DGP_CONFIG.maxItems) : rows;
  const people = [];
  const includeDetails = Boolean(options.includeDetails);

  for (let index = 0; index < selectedRows.length; index++) {
    const row = selectedRows[index];
    const person = includeDetails
      ? await collectPersonDetails(page, row, kind, {
          includeLattes: options.includeLattes,
          index,
          total: selectedRows.length,
        })
      : await extractPersonFromRow(row);

    if (person.nome) people.push(person);

    if (typeof options.onProgress === "function") {
      await options.onProgress(person, people);
    }

    if (includeDetails && index < selectedRows.length - 1) {
      await sleep(DGP_CONFIG.delays.betweenPeople);
    }
  }

  return people;
}
