// scrapeLinhasEstudantes.js - VERSÃO CORRIGIDA
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

puppeteer.use(StealthPlugin());

/* =========================
   CONFIGURAÇÃO
========================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(
  __dirname,
  "../../data/resultado_linha_estudantes.json"
);

// ⚡ CONFIGURAÇÕES OTIMIZADAS
const CONFIG = {
  url: process.env.SCRAPE_URL || "http://dgp.cnpq.br/dgp/espelhogrupo/6038878475345897",
  chromePath: process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  retryAttempts: 5,
  
  timeouts: {
    navigation: 120000,    // 2 minutos
    selector: 90000,       // 1.5 minutos
    popup: 30000,         // 30 segundos para popup abrir (REDUZIDO)
    pageLoad: 60000,       // 1 minuto para página carregar
    tableLoad: 45000       // 45 segundos para tabela
  },
  
  delays: {
    afterClick: 1000,      // 3 segundos após clicar
    betweenStudents: 1000, // 5 segundos entre estudantes
    beforeRetry: 4000      // 8 segundos antes de retry
  }
};

// ⚡⚡⚡ IDS CORRIGIDOS - VERIFICAR NO SITE REAL ⚡⚡⚡
// Se não funcionar, tentar capturar via console:
// document.querySelectorAll('table[id*="_data"]').forEach(t => console.log(t.id))
const TABLE_IDS = [
  "idFormVisualizarGrupoPesquisa:j_idt277_data",
    "idFormVisualizarGrupoPesquisa:j_idt272_data",
    "idFormVisualizarGrupoPesquisa:j_idt271_data",
];

// ⚡⚡⚡ SELECTORS CORRIGIDOS ⚡⚡⚡
const SELECTORS = {
  link: "a[id*='idBtnVisualizarEspelhoPesquisador']", // Link específico para estudantes
  // Tabela na popup (mesmo que pesquisadores, pois a estrutura é similar)
  popupTable: "#formVisualizarRH\\:tblEspelhoRHLPAtuacao_data",
  popupTableAlt1: "table[id*='tblEspelhoRHLPAtuacao']",
  popupTableAlt2: "table.ui-datatable-data",
  popupTableAlt3: "tbody.ui-datatable-data",
  anyTable: "table",
  loadingIndicator: ".ui-datatable-loading",
  noDataText: "Nenhum registro",
  // Selector para nome do estudante na linha da tabela
  studentNameCell: "td:first-child"
};

/* =========================
   HELPERS
========================= */
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function escapeSelector(id) {
  return `#${id.replace(/:/g, "\\:")}`;
}

async function safeWrite(data) {
  try {
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Resultados salvos em: ${outputPath}`);
  } catch (err) {
    console.error("❌ Erro ao gravar arquivo:", err);
  }
}

/* =========================
   FUNÇÃO AUXILIAR: FECHAR TODAS AS POPUPS
========================= */
async function closeAllPopupsExceptMain(page) {
  try {
    const pages = await page.browser().pages();
    for (const p of pages) {
      if (p !== page && !p.isClosed()) {
        try {
          await p.close();
          console.log(`  🧹 Popup órfã fechada`);
        } catch (error) {
          // Ignora erros ao fechar
        }
      }
    }
  } catch (error) {
    console.warn(`  ⚠️  Erro ao fechar popups: ${error.message}`);
  }
}

/* =========================
   FUNÇÃO AUXILIAR: AGUARDAR POPUP
========================= */
async function waitForPopup(page, studentName) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout ao aguardar popup para ${studentName}`));
    }, CONFIG.timeouts.popup);
    
    const targetHandler = async (target) => {
      if (target.type() === 'page') {
        try {
          const popupPage = await target.page();
          if (popupPage && popupPage !== page) {
            clearTimeout(timeoutId);
            page.browser().off('targetcreated', targetHandler);
            console.log(`  📄 Popup aberta via targetcreated`);
            resolve(popupPage);
          }
        } catch (error) {
          console.warn(`  ⚠️  Erro ao obter página do target: ${error.message}`);
        }
      }
    };
    
    page.browser().on('targetcreated', targetHandler);
    
    // Verifica se já abriu (às vezes abre instantaneamente)
    setTimeout(async () => {
      try {
        const pages = await page.browser().pages();
        const newPages = pages.filter(p => p !== page && !p.isClosed());
        if (newPages.length > 0) {
          clearTimeout(timeoutId);
          page.browser().off('targetcreated', targetHandler);
          console.log(`  📄 Popup já aberta encontrada`);
          resolve(newPages[0]);
        }
      } catch (error) {
        console.warn(`  ⚠️  Erro ao verificar páginas: ${error.message}`);
      }
    }, 2000);
  });
}

/* =========================
   FUNÇÃO PARA ABRIR POPUP DE FORMA CONFIÁVEL - CORRIGIDA
========================= */
async function openPopupReliably(page, linkHandle, studentName) {
  console.log(`  🔗 Tentando abrir popup para: ${studentName}`);
  
  // Limpa qualquer popup existente antes de abrir nova
  await closeAllPopupsExceptMain(page);
  
  // Método 1: Usando evaluate para clicar e abrir em nova aba
  try {
    // Obtém a URL do link
    const href = await linkHandle.evaluate(node => node.getAttribute('href'));
    console.log(`  🔗 URL do link: ${href || 'não encontrada'}`);
    
    if (!href || href === '#' || href.startsWith('javascript:')) {
      // Se não tem href válido, usa click normal
      console.log(`  ⚠️  Link sem href válido, usando click normal`);
      await linkHandle.click({ delay: 100 });
      
      // Aguarda abertura da popup
      return await waitForPopup(page, studentName);
    } else {
      // Abre nova aba diretamente com a URL
      console.log(`  📄 Abrindo nova aba com URL...`);
      const browser = page.browser();
      const popupPage = await browser.newPage();
      
      try {
        // Constrói URL completa se for relativa
        const fullUrl = href.startsWith('http') ? href : new URL(href, page.url()).href;
        await popupPage.goto(fullUrl, { 
          waitUntil: 'domcontentloaded',
          timeout: CONFIG.timeouts.pageLoad 
        });
        return popupPage;
      } catch (error) {
        // Se falhar, fecha a página e tenta outro método
        await popupPage.close().catch(() => {});
        throw error;
      }
    }
  } catch (error) {
    console.log(`  ⚠️  Método de URL falhou, tentando click: ${error.message}`);
    await linkHandle.click({ delay: 100 });
    return await waitForPopup(page, studentName);
  }
}

/* =========================
   FUNÇÃO PARA DETECTAR E EXTRAIR DADOS DA POPUP
========================= */
async function extractDataFromPopup(popupPage, studentName) {
  console.log(`  🔍 Procurando tabela na popup para ${studentName}...`);
  
  // Lista de selectors para tentar (em ordem de prioridade)
  const tableSelectors = [
    SELECTORS.popupTable,           // 1. ID exato que você mencionou
    SELECTORS.popupTableAlt1,       // 2. ID parcial
    SELECTORS.popupTableAlt2,       // 3. Classe PrimeFaces
    SELECTORS.popupTableAlt3,       // 4. Outro padrão
    SELECTORS.anyTable              // 5. Qualquer tabela
  ];
  
  let linhas_pesquisa = [];
  let tableFound = false;
  let foundSelector = '';
  
  // Tenta cada selector
  for (const selector of tableSelectors) {
    try {
      console.log(`  🔎 Tentando selector: ${selector}`);
      
      // Aguarda a tabela aparecer
      await popupPage.waitForSelector(selector, {
        visible: true,
        timeout: selector === SELECTORS.anyTable ? 20000 : 35000
      });
      
      tableFound = true;
      foundSelector = selector;
      console.log(`  ✅ Tabela encontrada com selector: ${selector}`);
      break;
      
    } catch (error) {
      console.log(`  ❌ Não encontrado com ${selector}: ${error.message}`);
      continue;
    }
  }
  
  // Se não encontrou tabela, verifica se há mensagem de "sem dados"
  if (!tableFound) {
    console.log(`  ⚠️  Nenhuma tabela encontrada, verificando conteúdo...`);
    
    const pageText = await popupPage.evaluate(() => document.body.innerText);
    
    // Verifica mensagens comuns de "sem dados"
    const noDataPatterns = [
      'Não há dados',
      'Nenhum registro',
      'sem dados',
      'não possui',
      'vazio',
      'empty',
      'no data'
    ];
    
    const hasNoData = noDataPatterns.some(pattern => 
      pageText.toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (hasNoData) {
      console.log(`  ℹ️  Popup indica que não há dados para ${studentName}`);
      return [];
    }
    
    // Tira screenshot para debug
    const screenshotName = `debug-popup-estudante-${studentName.replace(/[^a-z0-9]/gi, '_')}.png`;
    await popupPage.screenshot({ 
      path: screenshotName,
      fullPage: true 
    });
    console.log(`  📸 Screenshot salvo: ${screenshotName}`);
    
    return [];
  }
  
  // Extrai dados da tabela encontrada
  console.log(`  📊 Extraindo dados da tabela...`);
  
  // Aguarda um pouco para garantir que os dados estão carregados
  await sleep(2000);
  
  // Verifica se a tabela tem linhas
  const hasRows = await popupPage.evaluate((sel) => {
    const table = document.querySelector(sel);
    if (!table) return false;
    
    // Se for tbody, pega as tr diretamente
    if (table.tagName.toLowerCase() === 'tbody') {
      return table.querySelectorAll('tr').length > 0;
    }
    
    // Se for table, procura tbody primeiro
    const tbody = table.querySelector('tbody');
    if (tbody) {
      return tbody.querySelectorAll('tr').length > 0;
    }
    
    // Caso contrário, tenta pegar trs direto da table
    return table.querySelectorAll('tr').length > 0;
  }, foundSelector);
  
  if (!hasRows) {
    console.log(`  ⚠️  Tabela encontrada mas sem linhas de dados`);
    return [];
  }
  
  // Extrai os dados
  linhas_pesquisa = await popupPage.evaluate((sel) => {
    const extractRowsFromElement = (element) => {
      const rows = [];
      const trs = element.querySelectorAll('tr');
      
      trs.forEach(tr => {
        const tds = tr.querySelectorAll('td');
        if (tds.length >= 2) {
          const linha = tds[0]?.innerText.trim() || '';
          const grupo = tds[1]?.innerText.trim() || '';
          
          if (linha || grupo) {
            rows.push({ linha_pesquisa: linha, grupo: grupo });
          }
        }
      });
      
      return rows;
    };
    
    const element = document.querySelector(sel);
    if (!element) return [];
    
    // Se for tbody, extrai direto
    if (element.tagName.toLowerCase() === 'tbody') {
      return extractRowsFromElement(element);
    }
    
    // Se for table, procura tbody
    if (element.tagName.toLowerCase() === 'table') {
      const tbody = element.querySelector('tbody');
      if (tbody) {
        return extractRowsFromElement(tbody);
      }
      // Se não tiver tbody, tenta extrair direto da table
      return extractRowsFromElement(element);
    }
    
    return [];
  }, foundSelector);
  
  console.log(`  ✅ ${linhas_pesquisa.length} linha(s) extraída(s)`);
  return linhas_pesquisa;
}

/* =========================
   FUNÇÃO PARA PROCESSAR UM ESTUDANTE - CORRIGIDA
========================= */
async function processStudent(page, rowHandle, index, total) {
  const studentId = index + 1;
  console.log(`\n[${studentId}/${total}] Iniciando processamento...`);
  
  let studentName = `Estudante ${studentId}`;
  let popupPage = null;
  
  for (let attempt = 1; attempt <= CONFIG.retryAttempts; attempt++) {
    try {
      // Obtém nome do estudante da primeira célula da linha
      studentName = await rowHandle.$eval(SELECTORS.studentNameCell, (td) => td.innerText.trim());
      console.log(`  👤 Nome: ${studentName} (Tentativa ${attempt}/${CONFIG.retryAttempts})`);
      
      // Verifica se é linha vazia
      const rowText = await rowHandle.evaluate(el => el.innerText);
      if (rowText.includes(SELECTORS.noDataText) || !studentName || studentName === '') {
        console.log(`  ⚠️  Linha vazia ou sem nome, pulando...`);
        return { nome: studentName || `Estudante ${studentId}`, linhas_pesquisa: [] };
      }
      
      // Localiza link específico para estudantes
      const linkHandle = await rowHandle.$(SELECTORS.link).catch(() => null);
      
      if (!linkHandle) {
        console.warn(`  ⚠️  Link não encontrado para: ${studentName}`);
        // Tenta encontrar qualquer link na linha como fallback
        const anyLink = await rowHandle.$('a').catch(() => null);
        if (anyLink) {
          console.log(`  🔄 Usando link alternativo encontrado`);
          return await processStudentWithLink(page, anyLink, studentName, studentId);
        }
        return { nome: studentName, error: "link_not_found", linhas_pesquisa: [] };
      }
      
      // Abre popup
      console.log(`  🖱️  Clicando no link...`);
      popupPage = await openPopupReliably(page, linkHandle, studentName);
      
      // Configura popup
      await popupPage.bringToFront();
      popupPage.setDefaultTimeout(CONFIG.timeouts.selector);
      
      // Aguarda carregamento
      console.log(`  ⏳ Aguardando popup carregar...`);
      await sleep(CONFIG.delays.afterClick);
      
      // Extrai dados
      const linhas_pesquisa = await extractDataFromPopup(popupPage, studentName);
      
      // Obtém URL
      const espelhoUrl = popupPage.url();
      console.log(`  🌐 URL do popup: ${espelhoUrl}`);
      
      // Fecha popup IMEDIATAMENTE após extrair dados
      try {
        if (popupPage && !popupPage.isClosed()) {
          await popupPage.close();
          console.log(`  ✅ Popup fechada`);
          popupPage = null;
        }
      } catch (closeError) {
        console.warn(`  ⚠️  Erro ao fechar popup: ${closeError.message}`);
        // Tenta forçar fechamento
        if (popupPage && !popupPage.isClosed()) {
          try {
            await popupPage.evaluate(() => window.close());
          } catch {}
        }
        popupPage = null;
      }
      
      console.log(`  ✅ ${linhas_pesquisa.length} linha(s) coletada(s) para ${studentName}`);
      
      return {
        nome: studentName,
        espelhoUrl,
        linhas_pesquisa
      };
      
    } catch (error) {
      console.error(`  ❌ Tentativa ${attempt} falhou para ${studentName}:`, error.message);
      
      // Fecha popup se ainda estiver aberta
      if (popupPage && !popupPage.isClosed()) {
        try {
          await popupPage.close();
          console.log(`  🧹 Popup fechada após erro`);
        } catch {}
        popupPage = null;
      }
      
      // Fecha outras popups abertas
      await closeAllPopupsExceptMain(page);
      
      if (attempt === CONFIG.retryAttempts) {
        console.error(`  💥 Todas as tentativas falharam para ${studentName}`);
        return { 
          nome: studentName, 
          error: error.message,
          linhas_pesquisa: [] 
        };
      }
      
      // Backoff
      const backoffTime = CONFIG.delays.beforeRetry * attempt;
      console.log(`  ⏳ Aguardando ${backoffTime/1000}s antes da próxima tentativa...`);
      await sleep(backoffTime);
    }
  }
}

/* =========================
   FUNÇÃO AUXILIAR PARA PROCESSAR COM LINK ALTERNATIVO
========================= */
async function processStudentWithLink(page, linkHandle, studentName, studentId) {
  let popupPage = null;
  try {
    console.log(`  🖱️  Clicando no link alternativo...`);
    popupPage = await openPopupReliably(page, linkHandle, studentName);
    
    await popupPage.bringToFront();
    await sleep(CONFIG.delays.afterClick);
    
    const linhas_pesquisa = await extractDataFromPopup(popupPage, studentName);
    const espelhoUrl = popupPage.url();
    
    // Fecha popup
    if (popupPage && !popupPage.isClosed()) {
      await popupPage.close();
    }
    
    return {
      nome: studentName,
      espelhoUrl,
      linhas_pesquisa
    };
  } catch (error) {
    console.error(`  ❌ Erro com link alternativo: ${error.message}`);
    if (popupPage && !popupPage.isClosed()) {
      await popupPage.close();
    }
    return {
      nome: studentName,
      error: `link_alternativo_falhou: ${error.message}`,
      linhas_pesquisa: []
    };
  }
}

/* =========================
   FUNÇÃO PARA ENCONTRAR TABELA - CORRIGIDA
========================= */
async function findMainTable(page) {
  console.log("[INFO] Procurando tabela de estudantes...");
  
  // Primeiro, tenta encontrar qualquer tabela com dados
  const allTables = await page.$$('table[id*="_data"]');
  console.log(`  🔍 Encontradas ${allTables.length} tabelas com sufixo _data`);
  
  // Lista IDs encontrados para debug
  for (const table of allTables) {
    const id = await table.evaluate(el => el.id);
    console.log(`  📋 ID da tabela encontrada: ${id}`);
  }
  
  // Tenta cada ID na lista
  for (const tableId of TABLE_IDS) {
    const selector = escapeSelector(tableId);
    console.log(`  🔍 Tentando selector específico: ${selector}`);
    
    try {
      await sleep(1000);
      
      const table = await page.waitForSelector(selector, {
        timeout: 15000,
        visible: true
      });
      
      if (table) {
        const rowCount = await table.$$eval('tr', rows => rows.length);
        console.log(`  ✅ Tabela encontrada: ${tableId} com ${rowCount} linhas`);
        return table;
      }
    } catch (error) {
      console.log(`  ❌ Tabela não encontrada com ID ${tableId}: ${error.message}`);
    }
  }
  
  // Fallback: procura por qualquer tabela que possa conter estudantes
  console.log(`  🔍 Fallback: procurando por tabelas com links de estudantes...`);
  try {
    const tablesWithStudentLinks = await page.$$('table');
    
    for (const table of tablesWithStudentLinks) {
      const hasStudentLinks = await table.$$eval('a[id*="Estudante"]', links => links.length > 0);
      if (hasStudentLinks) {
        console.log(`  ✅ Tabela com links de estudantes encontrada`);
        return table;
      }
    }
  } catch (error) {
    console.log(`  ❌ Fallback falhou: ${error.message}`);
  }
  
  return null;
}

/* =========================
   FUNÇÃO PRINCIPAL - CORRIGIDA
========================= */
export default async function scrapeLinhasEstudantes(browser) {
  console.log("🚀 INICIANDO SCRAPING DE LINHAS DE ESTUDANTES");
  console.log("=============================================\n");
  
  const startTime = Date.now();
  const resultados = [];
  let page = null;
  
  try {
    // 1. INICIALIZAÇÃO
    console.log("[1/4] Inicializando navegador...");
    
    
    console.log("✅ Navegador inicializado");
    
    // 2. CONFIGURAÇÃO DA PÁGINA
    console.log("[2/4] Configurando página...");
    
    page = await browser.newPage();
    page.setDefaultNavigationTimeout(CONFIG.timeouts.navigation);
    page.setDefaultTimeout(CONFIG.timeouts.selector);
    
    // Configurações de stealth
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    
    // Esconde WebDriver
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    });
    
    // 3. NAVEGAÇÃO
    console.log("[3/4] Navegando para a página...");
    console.log(`   📍 URL: ${CONFIG.url}`);
    
    await page.goto(CONFIG.url, {
      waitUntil: 'domcontentloaded',
      timeout: CONFIG.timeouts.navigation
    });
    
    console.log("✅ Página carregada");
    await sleep(3000);
    
    // 4. LOCALIZAÇÃO DA TABELA
    console.log("[4/4] Localizando tabela de estudantes...");
    
    const tableHandle = await findMainTable(page);
    if (!tableHandle) {
      await page.screenshot({ path: 'debug-no-table-estudantes.png', fullPage: true });
      throw new Error("❌ Nenhuma tabela de estudantes encontrada");
    }
    
    // Obtém todas as linhas da tabela
    const rows = await tableHandle.$$("tr");
    const totalRows = rows.length;
    console.log(`\n📊 TOTAL DE LINHAS ENCONTRADAS: ${totalRows}`);
    
    // Filtra apenas linhas que parecem ser de estudantes (tem conteúdo)
    const studentRows = [];
    for (let i = 0; i < rows.length; i++) {
      const rowText = await rows[i].evaluate(el => el.innerText.trim());
      if (rowText && !rowText.includes(SELECTORS.noDataText)) {
        studentRows.push(rows[i]);
      }
    }
    
    console.log(`📊 ESTUDANTES PARA PROCESSAR: ${studentRows.length}`);
    
    if (studentRows.length === 0) {
      console.warn("⚠️  Nenhum estudante encontrado na tabela");
      await safeWrite([]);
      return [];
    }
    
    // 5. PROCESSAMENTO
    console.log("\n🔄 INICIANDO PROCESSAMENTO DOS ESTUDANTES");
    console.log("=========================================\n");
    
    for (let i = 0; i < studentRows.length; i++) {
      try {
        const result = await processStudent(page, studentRows[i], i, studentRows.length);
        resultados.push(result);
        
        // Salva checkpoint a cada 3 estudantes (mais frequente para debug)
        if ((i + 1) % 3 === 0) {
          console.log(`\n💾 Checkpoint: Salvando ${i + 1}/${studentRows.length} estudantes...`);
          await safeWrite(resultados);
          
          // Limpa popups acumuladas a cada checkpoint
          await closeAllPopupsExceptMain(page);
        }
        
        // Delay entre estudantes
        if (i < studentRows.length - 1) {
          console.log(`\n⏳ Aguardando ${CONFIG.delays.betweenStudents/1000}s antes do próximo...`);
          await sleep(CONFIG.delays.betweenStudents);
        }
        
      } catch (error) {
        console.error(`\n💥 Erro crítico no estudante ${i + 1}:`, error.message);
        resultados.push({
          index: i + 1,
          error: error.message,
          linhas_pesquisa: []
        });
        
        // Limpa popups após erro
        await closeAllPopupsExceptMain(page);
        
        await sleep(CONFIG.delays.betweenStudents);
      }
    }
    
    // 6. FINALIZAÇÃO
    console.log("\n===========================================");
    console.log("✅ PROCESSAMENTO CONCLUÍDO");
    console.log("===========================================");
    
    await safeWrite(resultados);
    
    // Estatísticas
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    const successful = resultados.filter(r => !r.error && r.linhas_pesquisa?.length >= 0).length;
    const withData = resultados.filter(r => r.linhas_pesquisa?.length > 0).length;
    const errors = resultados.filter(r => r.error).length;
    
    console.log(`\n📈 ESTATÍSTICAS:`);
    console.log(`   ⏱️  Tempo total: ${totalTime}s`);
    console.log(`   👥 Total processado: ${resultados.length}`);
    console.log(`   ✅ Sucesso: ${successful}`);
    console.log(`   📊 Com dados: ${withData}`);
    console.log(`   ❌ Erros: ${errors}`);
    
    // Mostra alguns exemplos
    if (withData > 0) {
      console.log(`\n📋 EXEMPLOS DE DADOS COLETADOS:`);
      const exemplos = resultados.filter(r => r.linhas_pesquisa?.length > 0).slice(0, 3);
      exemplos.forEach((result, idx) => {
        console.log(`\n   ${idx + 1}. ${result.nome}`);
        result.linhas_pesquisa.forEach((linha, i) => {
          console.log(`      ${i + 1}. ${linha.linha_pesquisa} | ${linha.grupo}`);
        });
      });
    }
    
    return resultados;
    
  } catch (error) {
    console.error("\n💥 ERRO CRÍTICO NO SCRAPING:", error.message);
    
    if (resultados.length > 0) {
      console.log(`\n💾 Salvando resultados parciais (${resultados.length} registros)...`);
      try {
        await safeWrite(resultados);
        console.log("✅ Resultados parciais salvos");
      } catch (writeError) {
        console.error("❌ Falha ao salvar resultados parciais:", writeError.message);
      }
    }
    
    if (page) {
      try {
        await page.screenshot({ path: 'error-screenshot-estudantes.png', fullPage: true });
        console.log("📸 Screenshot do erro salvo");
      } catch {}
    }
    
    throw error;
    
  } finally {
    console.log("\n🧹 Finalizando e liberando recursos...");
    
    // Fecha TODAS as páginas antes de fechar o browser
    if (browser) {
      try {
        const pages = await browser.pages();
        for (const p of pages) {
          if (!p.isClosed()) {
            try {
              await p.close();
            } catch {}
          }
        }
        
        console.log("✅ Navegador fechado");
      } catch (error) {
        console.warn("⚠️  Erro ao fechar navegador:", error.message);
      }
    }
    
    console.log("🎯 SCRAPING DE ESTUDANTES FINALIZADO");
  }
}

// Função para testar diretamente
export async function testScrapeEstudantes() {
  console.log("🧪 TESTE DIRETO DO SCRAPE DE ESTUDANTES");
  console.log("=======================================\n");
  
  try {
    const resultados = await scrapeLinhasEstudantes();
    
    console.log("\n✅ TESTE CONCLUÍDO COM SUCESSO!");
    console.log(`📊 Total de estudantes processados: ${resultados.length}`);
    
    // Análise detalhada
    const comDados = resultados.filter(r => r.linhas_pesquisa && r.linhas_pesquisa.length > 0);
    const semDados = resultados.filter(r => r.linhas_pesquisa && r.linhas_pesquisa.length === 0);
    const comErro = resultados.filter(r => r.error);
    
    console.log(`📈 Estatísticas:`);
    console.log(`   ✅ Com dados: ${comDados.length}`);
    console.log(`   ⚠️  Sem dados: ${semDados.length}`);
    console.log(`   ❌ Com erro: ${comErro.length}`);
    
    return resultados;
    
  } catch (error) {
    console.error("\n❌ TESTE FALHOU:", error.message);
    throw error;
  }
}

// Execução direta
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log("🔧 MODO: Execução direta do scrape de estudantes");
  
  // Verifica se é um teste rápido
  const isTest = process.argv.includes('--test');
  
  if (isTest) {
    testScrapeEstudantes().catch(error => {
      console.error("\n💥 TESTE FALHOU:", error.message);
      process.exit(1);
    });
  } else {
    scrapeLinhasEstudantes().catch(error => {
      console.error("\n💥 SCRAPING FALHOU:", error.message);
      process.exit(1);
    });
  }
}