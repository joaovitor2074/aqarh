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
    selector: 30000,       // 30 segundos
    popup: 20000,          // 20 segundos para popup abrir
    pageLoad: 60000,       // 1 minuto para página carregar
    tableLoad: 45000       // 45 segundos para tabela
  },
  
  delays: {
    afterClick: 2000,      // 2 segundos após clicar
    betweenStudents: 1500, // 1.5 segundos entre estudantes
    beforeRetry: 2000      // 2 segundos antes de retry
  }
};

// ⚡⚡⚡ IDS CORRIGIDOS - VERIFICAR NO SITE REAL ⚡⚡⚡
const TABLE_IDS = [
  "idFormVisualizarGrupoPesquisa:j_idt277_data",
  "idFormVisualizarGrupoPesquisa:j_idt272_data",
  "idFormVisualizarGrupoPesquisa:j_idt271_data",
];

// ⚡⚡⚡ SELECTORS CORRIGIDOS ⚡⚡⚡
const SELECTORS = {
  link: "a[id*='idBtnVisualizarEspelhoPesquisador']",
  // Modal/iframe que provavelmente é aberto
  modal: "div.ui-dialog",
  modalContent: "div.ui-dialog-content",
  iframe: "iframe",
  // Tabela dentro do modal/iframe
  popupTable: "#formVisualizarRH\\:tblEspelhoRHLPAtuacao_data",
  popupTableAlt1: "table[id*='tblEspelhoRHLPAtuacao']",
  popupTableAlt2: "table.ui-datatable-data",
  popupTableAlt3: "tbody.ui-datatable-data",
  anyTable: "table",
  loadingIndicator: ".ui-datatable-loading",
  noDataText: "Nenhum registro",
  studentNameCell: "td:first-child",
  // Botão fechar modal
  closeButton: "button.ui-dialog-titlebar-close, span.ui-icon-closethick",
  // Linhas da tabela de estudantes
  studentRow: "tr:not(.ui-widget-content-empty)"
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
   FUNÇÃO PARA EXTRAIR DADOS DO MODAL/IFRAME NA MESMA PÁGINA
========================= */
async function extractDataFromModal(page, studentName) {
  console.log(`  🔍 Procurando dados do modal para ${studentName}...`);
  
  let linhas_pesquisa = [];
  
  try {
    // Opção 1: Verifica se há iframe
    const iframeHandle = await page.$('iframe').catch(() => null);
    
    if (iframeHandle) {
      console.log(`  🖼️  Iframe encontrado, acessando conteúdo...`);
      const frame = await iframeHandle.contentFrame();
      
      // Aguarda carregamento do iframe
      await frame.waitForSelector('body', { timeout: 15000 });
      await sleep(2000);
      
      // Tenta encontrar tabela no iframe
      const tableInFrame = await frame.$(SELECTORS.popupTableAlt1) || 
                          await frame.$(SELECTORS.anyTable);
      
      if (tableInFrame) {
        console.log(`  ✅ Tabela encontrada no iframe`);
        linhas_pesquisa = await extractTableData(frame);
      }
      
    } else {
      // Opção 2: Verifica se há modal/div de diálogo
      console.log(`  🔍 Procurando modal/dialog...`);
      
      // Aguarda modal aparecer
      try {
        await page.waitForSelector(SELECTORS.modal, { 
          visible: true, 
          timeout: 10000 
        });
        console.log(`  ✅ Modal encontrado`);
      } catch (e) {
        console.log(`  ℹ️  Modal não encontrado, verificando se abriu em nova aba...`);
        // Verifica se abriu nova aba
        const pages = await page.browser().pages();
        if (pages.length > 1) {
          const popupPage = pages[pages.length - 1];
          await popupPage.bringToFront();
          console.log(`  📄 Nova aba aberta, extraindo dados...`);
          
          // Aguarda carregamento
          await sleep(3000);
          
          // Extrai dados da nova aba
          linhas_pesquisa = await extractTableData(popupPage);
          
          // Fecha a aba
          await popupPage.close();
          await page.bringToFront();
          return linhas_pesquisa;
        }
      }
      
      // Tenta extrair dados diretamente da modal na mesma página
      linhas_pesquisa = await extractTableData(page);
    }
    
  } catch (error) {
    console.error(`  ❌ Erro ao extrair dados do modal: ${error.message}`);
    
    // Tenta capturar screenshot para debug
    try {
      const screenshotName = `debug-modal-error-${studentName.replace(/[^a-z0-9]/gi, '_')}.png`;
      await page.screenshot({ path: screenshotName });
      console.log(`  📸 Screenshot salvo: ${screenshotName}`);
    } catch (e) {}
  }
  
  console.log(`  ✅ ${linhas_pesquisa.length} linha(s) extraída(s) para ${studentName}`);
  return linhas_pesquisa;
}

/* =========================
   FUNÇÃO PARA EXTRAIR DADOS DA TABELA (REUTILIZÁVEL)
========================= */
async function extractTableData(pageOrFrame) {
  const tableSelectors = [
    SELECTORS.popupTable,
    SELECTORS.popupTableAlt1,
    SELECTORS.popupTableAlt2,
    SELECTORS.popupTableAlt3,
    SELECTORS.anyTable
  ];
  
  for (const selector of tableSelectors) {
    try {
      const table = await pageOrFrame.waitForSelector(selector, {
        visible: true,
        timeout: 10000
      });
      
      if (table) {
        console.log(`    ✅ Tabela encontrada com selector: ${selector}`);
        
        // Aguarda linhas carregarem
        await sleep(1500);
        
        const data = await pageOrFrame.evaluate((sel) => {
          const results = [];
          const table = document.querySelector(sel);
          
          if (!table) return results;
          
          // Encontra todas as linhas (ignora cabeçalho)
          let rows = [];
          if (table.tagName === 'TBODY') {
            rows = table.querySelectorAll('tr');
          } else if (table.tagName === 'TABLE') {
            const tbody = table.querySelector('tbody');
            rows = tbody ? tbody.querySelectorAll('tr') : table.querySelectorAll('tr');
          }
          
          rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 2) {
              const linha = cells[0]?.textContent?.trim() || '';
              const grupo = cells[1]?.textContent?.trim() || '';
              
              if (linha && grupo) {
                results.push({
                  linha_pesquisa: linha,
                  grupo: grupo
                });
              }
            }
          });
          
          return results;
        }, selector);
        
        return data;
      }
    } catch (error) {
      console.log(`    ❌ Não encontrado com ${selector}`);
      continue;
    }
  }
  
  return [];
}

/* =========================
   FUNÇÃO PARA FECHAR MODAL
========================= */
async function closeModal(page) {
  try {
    // Tenta vários métodos para fechar
    const closeSelectors = [
      SELECTORS.closeButton,
      'button:has(span.ui-icon-closethick)',
      'a.ui-dialog-titlebar-close',
      'button[aria-label="Close"]'
    ];
    
    for (const selector of closeSelectors) {
      const closeBtn = await page.$(selector).catch(() => null);
      if (closeBtn) {
        await closeBtn.click();
        console.log(`  ✖️  Modal fechado com selector: ${selector}`);
        await sleep(1000);
        return true;
      }
    }
    
    // Tenta fechar com ESC
    await page.keyboard.press('Escape');
    await sleep(1000);
    
    return false;
  } catch (error) {
    console.log(`  ⚠️  Não foi possível fechar modal: ${error.message}`);
    return false;
  }
}

/* =========================
   FUNÇÃO PARA PROCESSAR UM ESTUDANTE - VERSÃO CORRIGIDA
========================= */
async function processStudent(page, rowHandle, index, total) {
  const studentId = index + 1;
  console.log(`\n[${studentId}/${total}] Iniciando processamento...`);
  
  let studentName = `Estudante ${studentId}`;
  
  for (let attempt = 1; attempt <= CONFIG.retryAttempts; attempt++) {
    try {
      // Obtém nome do estudante
      studentName = await rowHandle.$eval(SELECTORS.studentNameCell, (td) => td.innerText.trim());
      console.log(`  👤 Nome: ${studentName} (Tentativa ${attempt}/${CONFIG.retryAttempts})`);
      
      // Verifica se é linha vazia
      const rowText = await rowHandle.evaluate(el => el.innerText);
      if (rowText.includes(SELECTORS.noDataText) || !studentName || studentName === '') {
        console.log(`  ⚠️  Linha vazia ou sem nome, pulando...`);
        return { nome: studentName || `Estudante ${studentId}`, linhas_pesquisa: [] };
      }
      
      // Localiza link
      const linkHandle = await rowHandle.$(SELECTORS.link).catch(() => null);
      
      if (!linkHandle) {
        console.warn(`  ⚠️  Link não encontrado para: ${studentName}`);
        return { nome: studentName, error: "link_not_found", linhas_pesquisa: [] };
      }
      
      // Clica no link para abrir modal/iframe
      console.log(`  🖱️  Clicando no link...`);
      
      // Salva o estado atual da página
      const originalUrl = page.url();
      
      // Clica no link
      await linkHandle.click({ delay: 100 });
      await sleep(CONFIG.delays.afterClick);
      
      // Aguarda algum tempo para modal/iframe carregar
      console.log(`  ⏳ Aguardando conteúdo carregar...`);
      await sleep(3000);
      
      // Extrai dados do modal/iframe
      const linhas_pesquisa = await extractDataFromModal(page, studentName);
      
      // Tenta fechar o modal/iframe se ainda estiver aberto
      await closeModal(page);
      
      // Volta para o contexto original se necessário
      if (page.url() !== originalUrl) {
        console.log(`  ↩️  Voltando para página principal...`);
        await page.goBack();
        await sleep(2000);
        
        // Aguarda tabela recarregar
        await page.waitForSelector(SELECTORS.studentRow, { timeout: 10000 });
      }
      
      // Aguarda um pouco para a página se estabilizar
      await sleep(1000);
      
      console.log(`  ✅ ${linhas_pesquisa.length} linha(s) coletada(s) para ${studentName}`);
      
      return {
        nome: studentName,
        linhas_pesquisa
      };
      
    } catch (error) {
      console.error(`  ❌ Tentativa ${attempt} falhou para ${studentName}:`, error.message);
      
      // Tenta fechar qualquer modal/iframe aberto
      await closeModal(page);
      
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
      
      // Tenta recarregar a página se houver muitos problemas
      if (attempt === 2) {
        console.log(`  🔄 Recarregando página após falhas...`);
        await page.reload();
        await sleep(5000);
      }
    }
  }
}

/* =========================
   FUNÇÃO PARA ENCONTRAR TABELA DE ESTUDANTES
========================= */
async function findMainTable(page) {
  console.log("[INFO] Procurando tabela de estudantes...");
  
  // Tenta cada ID na lista
  for (const tableId of TABLE_IDS) {
    const selector = escapeSelector(tableId);
    console.log(`  🔍 Tentando selector: ${selector}`);
    
    try {
      const table = await page.waitForSelector(selector, {
        timeout: 10000,
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
  
  // Fallback: procura por tabelas com links de estudantes
  console.log(`  🔍 Fallback: procurando tabelas com links de estudantes...`);
  const allTables = await page.$$('table');
  
  for (let i = 0; i < allTables.length; i++) {
    const hasStudentLinks = await allTables[i].$$eval(SELECTORS.link, links => links.length > 0);
    if (hasStudentLinks) {
      console.log(`  ✅ Tabela ${i} tem links de estudantes`);
      return allTables[i];
    }
  }
  
  return null;
}

/* =========================
   FUNÇÃO PRINCIPAL - VERSÃO SIMPLIFICADA
========================= */
export default async function scrapeLinhasEstudantes(browser) {
  console.log("🚀 INICIANDO SCRAPING DE LINHAS DE ESTUDANTES");
  console.log("=============================================\n");
  
  const resultados = [];
  let page = null;
  
  try {
    // 1. INICIALIZAÇÃO
    console.log("[1/4] Configurando página...");
    
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
    });
    
    // 2. NAVEGAÇÃO
    console.log("[2/4] Navegando para a página...");
    console.log(`   📍 URL: ${CONFIG.url}`);
    
    await page.goto(CONFIG.url, {
      waitUntil: 'networkidle0',
      timeout: CONFIG.timeouts.navigation
    });
    
    console.log("✅ Página carregada");
    await sleep(3000);
    
    // 3. LOCALIZAÇÃO DA TABELA
    console.log("[3/4] Localizando tabela de estudantes...");
    
    const tableHandle = await findMainTable(page);
    if (!tableHandle) {
      await page.screenshot({ path: 'debug-no-table-estudantes.png', fullPage: true });
      throw new Error("❌ Nenhuma tabela de estudantes encontrada");
    }
    
    // Obtém todas as linhas da tabela
    const rows = await tableHandle.$$(SELECTORS.studentRow);
    const totalRows = rows.length;
    console.log(`\n📊 ESTUDANTES PARA PROCESSAR: ${totalRows}`);
    
    if (totalRows === 0) {
      console.warn("⚠️  Nenhum estudante encontrado na tabela");
      await safeWrite([]);
      return [];
    }
    
    // 4. PROCESSAMENTO
    console.log("\n🔄 INICIANDO PROCESSAMENTO DOS ESTUDANTES");
    console.log("=========================================\n");
    
    for (let i = 0; i < totalRows; i++) {
      try {
        // Obtém a linha novamente (a referência pode ficar inválida)
        const currentRows = await tableHandle.$$(SELECTORS.studentRow);
        if (i >= currentRows.length) break;
        
        const result = await processStudent(page, currentRows[i], i, totalRows);
        resultados.push(result);
        
        // Salva checkpoint a cada 3 estudantes
        if ((i + 1) % 3 === 0 || i === totalRows - 1) {
          console.log(`\n💾 Checkpoint: Salvando ${i + 1}/${totalRows} estudantes...`);
          await safeWrite(resultados);
        }
        
        // Delay entre estudantes
        if (i < totalRows - 1) {
          await sleep(CONFIG.delays.betweenStudents);
        }
        
      } catch (error) {
        console.error(`\n💥 Erro crítico no estudante ${i + 1}:`, error.message);
        resultados.push({
          index: i + 1,
          error: error.message,
          linhas_pesquisa: []
        });
        
        await sleep(2000);
      }
    }
    
    // 5. FINALIZAÇÃO
    console.log("\n===========================================");
    console.log("✅ PROCESSAMENTO CONCLUÍDO");
    console.log("===========================================");
    
    await safeWrite(resultados);
    
    // Estatísticas
    const successful = resultados.filter(r => !r.error).length;
    const withData = resultados.filter(r => r.linhas_pesquisa?.length > 0).length;
    
    console.log(`\n📈 ESTATÍSTICAS:`);
    console.log(`   👥 Total processado: ${resultados.length}`);
    console.log(`   ✅ Sucesso: ${successful}`);
    console.log(`   📊 Com dados: ${withData}`);
    console.log(`   ❌ Erros: ${resultados.length - successful}`);
    
    return resultados;
    
  } catch (error) {
    console.error("\n💥 ERRO CRÍTICO NO SCRAPING:", error.message);
    
    if (resultados.length > 0) {
      console.log(`\n💾 Salvando resultados parciais (${resultados.length} registros)...`);
      await safeWrite(resultados);
    }
    
    throw error;
  } finally {
    console.log("\n🧹 Finalizando...");
    if (page && !page.isClosed()) {
      await page.close();
    }
    console.log("🎯 SCRAPING DE ESTUDANTES FINALIZADO");
  }
}