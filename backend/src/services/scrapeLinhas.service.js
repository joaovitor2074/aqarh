// scrapeLinhasEstudantes.js - VERSÃO COM TIMEOUTS CORRIGIDOS
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
  "../../data/resultado_linha_pesquisadores.json"
);

// ⚡ CONFIGURAÇÕES OTIMIZADAS COM TIMEOUTS AUMENTADOS
const CONFIG = {
  url: process.env.SCRAPE_URL || "http://dgp.cnpq.br/dgp/espelhogrupo/6038878475345897",
  chromePath: process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  retryAttempts: 3,
  
  timeouts: {
    navigation: 180000,    // 3 minutos
    selector: 120000,      // 2 minutos
    popup: 30000,          // 30 segundos
    pageLoad: 60000,       // 1 minuto
    tableLoad: 30000,      // 30 segundos
    protocol: 120000       // 2 minutos para protocol timeout (NOVO)
  },
  
  delays: {
    afterClick: 1000,      // 1 segundos após clicar
    betweenStudents: 500, // 2 segundos entre estudantes
    beforeRetry: 5000,    // 10 segundos antes de retry
    afterPopupClose: 500  // 2 segundos após fechar popup
  },
  
  maxConcurrentPopups: 2,  // Apenas 1 popup por vez
  closePopupAfterMs: 30000 // Fecha popup automaticamente após 30 segundos
};

// IDs das tabelas de estudantes
const TABLE_IDS = [
  "idFormVisualizarGrupoPesquisa:j_idt277_data",
  "idFormVisualizarGrupoPesquisa:j_idt272_data",
  "idFormVisualizarGrupoPesquisa:j_idt271_data",
];

// ⚡⚡⚡ SELECTORS ⚡⚡⚡
const SELECTORS = {
  link: "a[id*='idBtnVisualizarEspelhoPesquisador']",
  popupTable: "#formVisualizarRH\\:tblEspelhoRHLPAtuacao_data",
  popupTableAlt1: "table[id*='tblEspelhoRHLPAtuacao']",
  popupTableAlt2: "table.ui-datatable-data",
  popupTableAlt3: "tbody.ui-datatable-data",
  anyTable: "table",
  noDataText: "Nenhum registro"
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
   FUNÇÃO AUXILIAR: LIMPAR NAVEGADOR
========================= */
async function cleanupBrowser(browser, mainPage) {
  try {
    if (!browser) return;
    
    const pages = await browser.pages();
    let closedCount = 0;
    
    for (const page of pages) {
      if (page !== mainPage && !page.isClosed()) {
        try {
          await page.close();
          closedCount++;
        } catch (error) {
          // Ignora erros ao fechar
        }
      }
    }
    
    if (closedCount > 0) {
      console.log(`  🧹 Fechadas ${closedCount} popups pendentes`);
    }
  } catch (error) {
    console.warn(`  ⚠️  Erro na limpeza: ${error.message}`);
  }
}

/* =========================
   FUNÇÃO PARA ABRIR POPUP DE FORMA CONFIÁVEL (CORRIGIDA)
========================= */
async function openPopupReliably(page, linkHandle, studentName, attempt = 1) {
  console.log(`  🔗 Abrindo popup para: *nomeOculto* (tentativa ${attempt})`);
  
  // Limpa popups antes de abrir nova
  await cleanupBrowser(page.browser(), page);
  
  try {
    // Método 1: Clique normal que abre nova guia
    console.log(`  🖱️  Clicando no link...`);
    
    // Prepara listener para nova página ANTES de clicar
    const browser = page.browser();
    const existingPages = await browser.pages();
    
    // Clica no link (deve abrir nova guia)
    await Promise.all([
      linkHandle.click({ delay: 100 }),
      sleep(1000) // Pequeno delay após clique
    ]);
    
    // Aguarda nova página aparecer (com timeout aumentado)
    const startTime = Date.now();
    let newPage = null;
    
    while (Date.now() - startTime < CONFIG.timeouts.popup) {
      const currentPages = await browser.pages();
      const newPages = currentPages.filter(p => 
        !existingPages.includes(p) && !p.isClosed()
      );
      
      if (newPages.length > 0) {
        newPage = newPages[0];
        console.log(`  ✅ Nova guia detectada`);
        break;
      }
      
      await sleep(500);
    }
    
    if (!newPage) {
      throw new Error("Nova guia não foi aberta");
    }
    
    // Aguarda a página carregar
    try {
      await newPage.waitForNavigation({ 
        waitUntil: 'networkidle0', 
        timeout: CONFIG.timeouts.pageLoad 
      });
    } catch (navError) {
      // Tenta waitForSelector como fallback
      console.log(`  ⏳ Aguardando conteúdo carregar...`);
      await newPage.waitForSelector('body', { timeout: 10000 });
    }
    
    await sleep(CONFIG.delays.afterClick);
    return newPage;
    
  } catch (error) {
    console.log(`  ⚠️  Método 1 falhou: ${error.message}`);
    
    // Método 2: Tenta extrair href e abrir manualmente

    try {
      console.log(`  🔗 Tentando método alternativo...`);
      const href = await linkHandle.evaluate(el => el.getAttribute('href'));
      
      if (href && href !== '#' && !href.startsWith('javascript:')) {
        const newPage = await page.browser().newPage();
        const fullUrl = new URL(href, page.url()).href;
        
        console.log(`  🌐 Navegando para: ${fullUrl}`);
        await newPage.goto(fullUrl, {
          waitUntil: 'networkidle0',
          timeout: CONFIG.timeouts.pageLoad
        });
        
        return newPage;
      }
    } catch (altError) {
      console.log(`  ⚠️  Método alternativo falhou: ${altError.message}`);
    }
    
    throw new Error(`Não foi possível abrir popup: ${error.message}`);
  }
}

/* =========================
   FUNÇÃO PARA EXTRAIR DADOS DA POPUP
========================= */
async function extractDataFromPopup(popupPage, studentName) {
  console.log(`  🔍 Extraindo dados para *nome Oculto*...`);
  
  try {
    // Tenta encontrar a tabela
    await popupPage.waitForSelector(SELECTORS.popupTable, {
      timeout: 10000
    }).catch(() => {
      console.log(`  ⚠️  Tabela não encontrada, tentando alternativas...`);
    });
    
    // Extrai dados
    const linhas_pesquisa = await popupPage.evaluate((selectors) => {
      // Tenta vários selectors
      const selectorsToTry = [
        selectors.popupTable,
        selectors.popupTableAlt1,
        selectors.popupTableAlt2,
        selectors.popupTableAlt3,
        selectors.anyTable
      ];
      
      let table = null;
      for (const selector of selectorsToTry) {
        table = document.querySelector(selector);
        if (table) break;
      }
      
      if (!table) return [];
      
      const rows = [];
      const trs = table.querySelectorAll('tr');
      
      trs.forEach(tr => {
        const cells = tr.querySelectorAll('td');
        if (cells.length >= 2) {
          const linha = cells[0]?.textContent?.trim() || '';
          const grupo = cells[1]?.textContent?.trim() || '';
          
          // Filtra linhas válidas
          if (linha && grupo && 
              !linha.includes('ui-button') && 
              !grupo.includes('ui-button')) {
            rows.push({ 
              linha_pesquisa: linha, 
              grupo: grupo 
            });
          }
        }
      });
      
      return rows;
    }, {
      popupTable: SELECTORS.popupTable,
      popupTableAlt1: SELECTORS.popupTableAlt1,
      popupTableAlt2: SELECTORS.popupTableAlt2,
      popupTableAlt3: SELECTORS.popupTableAlt3,
      anyTable: SELECTORS.anyTable
    });
    
    console.log(`  ✅ ${linhas_pesquisa.length} linha(s) extraída(s)`);
    return linhas_pesquisa;
    
  } catch (error) {
    console.log(`  ❌ Erro na extração: ${error.message}`);
    return [];
  }
}

/* =========================
   FUNÇÃO PARA FECHAR POPUP SEGURAMENTE
========================= */
async function closePopupSafely(popupPage, studentName) {
  if (!popupPage || popupPage.isClosed()) return;

  try {
    // await popupPage.close({ runBeforeUnload: false });
    console.log(`  ✅ Popup fechada para *nome oculto*`);
  } catch (error) {
    console.warn(`  ⚠️  Erro ao fechar popup: ${error.message}`);
  }

  await sleep(CONFIG.delays.afterPopupClose);
}

/* =========================
   FUNÇÃO PARA PROCESSAR UM ESTUDANTE (COM RETRY)
========================= */
async function processStudent(mainPage, rowHandle, index, total) {
  const studentId = index + 1;
  console.log(`\n[${studentId}/${total}] Processando...`);
  
  let studentName = `Estudante ${studentId}`;
  let popupPage = null;
  
  // Tenta múltiplas vezes
  for (let attempt = 1; attempt <= CONFIG.retryAttempts; attempt++) {
    try {
      // Obtém nome
      studentName = await rowHandle.$eval("td:first-child", (td) => 
        td.textContent?.trim() || td.innerText?.trim() || `Estudante ${studentId}`
      ).catch(() => `Estudante ${studentId}`);
      
      console.log(`  👤 *nomeOculto* (tentativa ${attempt}/${CONFIG.retryAttempts})`);
      
      // Verifica se é linha vazia
      const rowText = await rowHandle.evaluate(el => 
        el.textContent || el.innerText
      );
      
      if (!rowText || rowText.includes(SELECTORS.noDataText)) {
        console.log(`  ⚠️  Linha vazia, pulando...`);
        return { nome: studentName, linhas_pesquisa: [] };
      }
      
      // Encontra link
      const linkHandle = await rowHandle.$(SELECTORS.link).catch(() => null);
      
      if (!linkHandle) {
        console.warn(`  ⚠️  Link não encontrado`);
        return { 
          nome: studentName, 
          error: "link_not_found", 
          linhas_pesquisa: [] 
        };
      }
      
      // Abre popup
      popupPage = await openPopupReliably(mainPage, linkHandle, studentName, attempt);
      
      // Extrai dados com timeout
      const dataPromise = extractDataFromPopup(popupPage, studentName);
      const timeoutPromise = sleep(CONFIG.timeouts.tableLoad).then(() => {
        throw new Error("Timeout na extração de dados");
      });
      
      const linhas_pesquisa = await Promise.race([dataPromise, timeoutPromise]);
      const espelhoUrl = popupPage.url();
      
      console.log(`  🌐 URL: ${espelhoUrl.substring(0, 100)}...`);
      
      // Fecha popup
      await closePopupSafely(popupPage, studentName);
      popupPage = null;
      
      return {
        nome: studentName,
        espelhoUrl,
        linhas_pesquisa
      };
      
    } catch (error) {
      console.error(`  ❌ Tentativa ${attempt} falhou: ${error.message}`);
      
      // Fecha popup se ainda estiver aberta
      if (popupPage && !popupPage.isClosed()) {
        await closePopupSafely(popupPage, studentName);
        popupPage = null;
      }
      
      // Limpa outras popups
      await cleanupBrowser(mainPage.browser(), mainPage);
      
      if (attempt === CONFIG.retryAttempts) {
        console.error(`  💥 Todas as tentativas falharam para *nome oculto*`);
        return { 
          nome: studentName, 
          error: `max_retries_exceeded: ${error.message}`,
          linhas_pesquisa: [] 
        };
      }
      
      // Backoff exponencial
      const backoffTime = CONFIG.delays.beforeRetry * attempt;
      console.log(`  ⏳ Aguardando ${backoffTime/1000}s antes de retry...`);
      await sleep(backoffTime);
    }
  }
}

/* =========================
   FUNÇÃO PARA ENCONTRAR TABELA
========================= */
async function findMainTable(page) {
  console.log("[INFO] Procurando tabela...");
  
  for (const tableId of TABLE_IDS) {
    try {
      const selector = escapeSelector(tableId);
      console.log(`  🔍 Tentando: ${selector}`);
      
      await sleep(500);
      const table = await page.$(selector);
      
      if (table) {
        const rowCount = await table.$$eval('tr', rows => rows.length);
        console.log(`  ✅ Tabela encontrada: ${tableId} (${rowCount} linhas)`);
        return table;
      }
    } catch (error) {
      console.log(`  ❌ Não encontrada: ${tableId}`);
    }
  }
  
  // Fallback
  console.log(`  🔍 Fallback: procurando qualquer tabela...`);
  const tables = await page.$$('table');
  
  for (const table of tables) {
    const hasLinks = await table.$$eval(
      'a[id*="Estudante"]', 
      links => links.length > 0
    );
    
    if (hasLinks) {
      console.log(`  ✅ Tabela com links encontrada`);
      return table;
    }
  }
  
  return null;
}

/* =========================
   FUNÇÃO PRINCIPAL COM GESTÃO DE RECURSOS
========================= */
export default async function scrapeLinhas(browser) {
  console.log("🚀 INICIANDO SCRAPING De PESQUISADORES");
  console.log("===================================\n");
  
  const resultados = [];
  let mainPage = null;
  
  try {
    // 1. INICIALIZAÇÃO COM TIMEOUTS AUMENTADOS
    console.log("[1/4] Inicializando navegador...");
    
    
    console.log("✅ Navegador inicializado");
    
    // 2. CONFIGURAÇÃO DA PÁGINA
    console.log("[2/4] Configurando página...");
    
    mainPage = await browser.newPage();
    mainPage.setDefaultNavigationTimeout(CONFIG.timeouts.navigation);
    mainPage.setDefaultTimeout(CONFIG.timeouts.selector);
    
    await mainPage.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    
    // 3. NAVEGAÇÃO
    console.log("[3/4] Navegando para página...");
    console.log(`   📍 ${CONFIG.url}`);
    
    await mainPage.goto(CONFIG.url, {
      waitUntil: 'networkidle0',
      timeout: CONFIG.timeouts.navigation
    });
    
    console.log("✅ Página carregada");
    await sleep(1500);
    
    // 4. LOCALIZAR TABELA
    console.log("[4/4] Procurando tabela...");
    
    const tableHandle = await findMainTable(mainPage);
    if (!tableHandle) {
      throw new Error("Tabela não encontrada");
    }
    
    // Obtém linhas
    const rows = await tableHandle.$$("tr");
    console.log(`\n📊 TOTAL DE LINHAS: ${rows.length}`);
    
    // Filtra linhas com conteúdo
    const studentRows = [];
    for (let i = 0; i < rows.length; i++) {
      const text = await rows[i].evaluate(el => el.textContent?.trim());
      if (text && text.length > 0 && !text.includes(SELECTORS.noDataText)) {
        studentRows.push({ row: rows[i], index: i });
      }
    }
    
    console.log(`📊 PESQUISADORES PARA PROCESSAR: ${studentRows.length}\n`);
    
    if (studentRows.length === 0) {
      console.log("⚠️  Nenhum pesquisador encontrado");
      await safeWrite([]);
      return [];
    }
    
    // 5. PROCESSAMENTO COM PAUSAS PERIÓDICAS
    console.log("🔄 PROCESSANDO PESQUISADPRES");
    console.log("========================");
    
    for (let i = 0; i < studentRows.length; i++) {
      const { row, index } = studentRows[i];
      
      try {
        const result = await processStudent(mainPage, row, i, studentRows.length);
        resultados.push(result);
        
        // Checkpoint a cada 5 estudantes
        if ((i + 1) % 5 === 0 || i === studentRows.length - 1) {
          console.log(`\n💾 Checkpoint: ${i + 1}/${studentRows.length} pesquisadores`);
          await safeWrite(resultados);
          
          // Limpeza periódica
          await cleanupBrowser(browser, mainPage);
          
          // Pausa mais longa a cada 20 estudantes
          if ((i + 1) % 20 === 0 && i < studentRows.length - 1) {
            console.log(`\n⏸️  Pausa de 10 segundos...`);
            await sleep(1000);
          }
        }
        
        // Delay normal entre estudantes
        if (i < studentRows.length - 1) {
          await sleep(CONFIG.delays.betweenStudents);
        }
        
      } catch (error) {
        console.error(`\n💥 Erro crítico no pesquisador ${i + 1}: ${error.message}`);
        resultados.push({
          index: i + 1,
          error: error.message,
          linhas_pesquisa: []
        });
        
        await cleanupBrowser(browser, mainPage);
        await sleep(2000); // Pausa mais longa após erro
      }
    }
    
    // 6. FINALIZAÇÃO
    console.log("\n" + "=".repeat(50));
    console.log("✅ PROCESSAMENTO CONCLUÍDO");
    console.log("=".repeat(50));
    
    await safeWrite(resultados);
    
    // Estatísticas
    const successful = resultados.filter(r => !r.error).length;
    const withData = resultados.filter(r => r.linhas_pesquisa?.length > 0).length;
    
    console.log(`\n📈 ESTATÍSTICAS:`);
    console.log(`   👥 Total: ${resultados.length}`);
    console.log(`   ✅ Sucesso: ${successful}`);
    console.log(`   📊 Com dados: ${withData}`);
    console.log(`   ❌ Erros: ${resultados.length - successful}`);
    
    // Exemplos
    const examples = resultados
      .filter(r => r.linhas_pesquisa?.length > 0)
      .slice(0, 3);
    
    if (examples.length > 0) {
      console.log(`\n📋 EXEMPLOS:`);
      examples.forEach((result, idx) => {
        console.log(`  ${idx + 1}. ${result.nome}`);
        result.linhas_pesquisa.slice(0, 2).forEach((linha, i) => {
          console.log(`     ${i + 1}. ${linha.linha_pesquisa}`);
        });
      });
    }
    
    return resultados;
    
  } catch (error) {
    console.error("\n💥 ERRO CRÍTICO:", error.message);
    
    if (resultados.length > 0) {
      console.log(`\n💾 Salvando resultados parciais (${resultados.length})...`);
      await safeWrite(resultados);
    }
    
    throw error;
    
  } finally {
    console.log("\n🧹 FINALIZANDO...");
    
    // Garante fechamento completo
    if (browser) {
      try {
        // Fecha todas as páginas
        const pages = await browser.pages();
        for (const page of pages) {
          if (!page.isClosed()) {
            try {
              await page.close();
            } catch {}
          }
        }
        
        // Desconecta e fecha
        if (mainPage && !mainPage.isClosed()) {
  await mainPage.close();
}
        
        // Garante que o processo termine
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log("✅ Navegador fechado");
      } catch (error) {
        console.warn("⚠️  Erro ao fechar navegador:", error.message);
      }
    }
    
    console.log("🎯 SCRAPING FINALIZADO");
  }
}

// Função para teste rápido

// Execução
if (process.argv[1] === fileURLToPath(import.meta.url)) {
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