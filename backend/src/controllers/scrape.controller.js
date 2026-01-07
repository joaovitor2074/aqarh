import {
  processarScrapePesquisador,
  processarEstudantes,
  processarScrapeLinhas,
  processarScrapeLinhasEstudantes
} from "../services/compararbanco.service.js";

import { scrapeEmitter } from "../utils/scrapeEmitter.js";

// Controle de execução
let isScraping = false;
let currentScrapeId = null;

// Classe para gerenciar o scraping
class ScrapeManager {
  constructor() {
    this.results = {
      pesquisador: null,
      estudantes: null,
      linhas: null,
      linhasEstudantes: null
    };
    this.errors = [];
    this.startTime = null;
    this.scrapeId = null;
  }

  start() {
    this.startTime = Date.now();
    this.scrapeId = `scrape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    currentScrapeId = this.scrapeId;
    
    scrapeEmitter.emit("status", {
      scrapeId: this.scrapeId,
      etapa: "inicio",
      status: "iniciando",
      timestamp: new Date().toISOString()
    });
    
    return this.scrapeId;
  }

  logEtapa(etapa, status, mensagem, dados = {}) {
    scrapeEmitter.emit("status", {
      scrapeId: this.scrapeId,
      etapa,
      status,
      mensagem,
      timestamp: new Date().toISOString(),
      ...dados
    });
  }

  addResult(tipo, resultado) {
    this.results[tipo] = resultado;
    
    if (resultado.error) {
      this.errors.push(`${tipo}: ${resultado.error}`);
    }
  }

  addError(tipo, error) {
    const errorObj = {
      tipo,
      mensagem: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    
    this.errors.push(errorObj);
    this.results[tipo] = { error: error.message };
    
    this.logEtapa(tipo, "erro", `Erro em ${tipo}: ${error.message}`);
  }

  getDuration() {
    return ((Date.now() - this.startTime) / 1000).toFixed(1);
  }

  finalize() {
    const duration = this.getDuration();
    const hasErrors = this.errors.length > 0;
    
    const statusPayload = {
      scrapeId: this.scrapeId,
      etapa: "final",
      status: hasErrors ? "erro_parcial" : "sucesso",
      mensagem: hasErrors ? "Scraping parcialmente concluído" : "Scraping concluído com sucesso",
      timestamp: new Date().toISOString(),
      duracao: `${duration}s`,
      resumo: {
        pesquisadores: this.results.pesquisador?.total_lattes || 0,
        estudantes: this.results.estudantes?.total_lattes || 0,
        linhas: this.results.linhas?.total_lattes || 0,
        linhasEstudantes: this.results.linhasEstudantes?.total_lattes || 0
      },
      erros: this.errors
    };
    
    scrapeEmitter.emit("status", statusPayload);
    
    return {
      success: !hasErrors,
      message: hasErrors ? "Scraping parcialmente concluído" : "Scraping concluído com sucesso",
      duration: `${duration}s`,
      timestamp: new Date().toISOString(),
      data: this.results,
      errors: hasErrors ? this.errors : undefined
    };
  }
}

// Função wrapper para executar tarefas com timeout
async function executeTask(taskFn, taskName, timeout = 300000) {
  return Promise.race([
    taskFn(),
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Timeout na tarefa: ${taskName} (${timeout}ms)`));
      }, timeout);
    })
  ]);
}

// Execução otimizada e simplificada
export async function runScrape(req, res) {
  // Verifica se já está rodando
  if (isScraping) {
    return res.status(429).json({
      success: false,
      error: "Scraping já em execução",
      message: "Aguarde a conclusão da execução atual",
      timestamp: new Date().toISOString(),
      currentScrapeId
    });
  }

  isScraping = true;
  const manager = new ScrapeManager();
  const scrapeId = manager.start();

  try {
    // 🔹 ETAPA 1: Tarefas independentes (podem rodar em paralelo)
    manager.logEtapa("inicio_paralelo", "iniciando", 
      "Iniciando tarefas independentes em paralelo...");

    // Pesquisadores e Estudantes são independentes e podem rodar juntos
    const [pesquisadorResult, estudantesResult] = await Promise.allSettled([
      executeTask(async () => {
        manager.logEtapa("pesquisadores", "iniciando", "Processando pesquisadores...");
        const result = await processarScrapePesquisador();
        manager.logEtapa("pesquisadores", "sucesso", 
          `Pesquisadores concluídos: ${result.novos_encontrados || 0} novos`);
        return result;
      }, "processarScrapePesquisador", 180000),

      executeTask(async () => {
        manager.logEtapa("estudantes", "iniciando", "Processando estudantes...");
        const result = await processarEstudantes();
        manager.logEtapa("estudantes", "sucesso", 
          `Estudantes concluídos: ${result.novos_encontrados || 0} novos`);
        return result;
      }, "processarEstudantes", 240000)
    ]);

    // Processa resultados das tarefas paralelas
    if (pesquisadorResult.status === 'fulfilled') {
      manager.addResult('pesquisador', pesquisadorResult.value);
    } else {
      manager.addError('pesquisador', pesquisadorResult.reason);
    }

    if (estudantesResult.status === 'fulfilled') {
      manager.addResult('estudantes', estudantesResult.value);
    } else {
      manager.addError('estudantes', estudantesResult.reason);
    }

    // 🔹 ETAPA 2: Tarefas com popups (rodam sequencialmente para evitar conflitos)
    manager.logEtapa("linhas_inicio", "iniciando", 
      "Iniciando processamento de linhas de pesquisa...");

    // Linhas de pesquisadores
    try {
      manager.logEtapa("linhas_pesquisadores", "iniciando", 
        "Processando linhas de pesquisadores...");
      
      const linhasResult = await executeTask(async () => {
        return await processarScrapeLinhas();
      }, "processarScrapeLinhas", 300000);
      
      manager.logEtapa("linhas_pesquisadores", "sucesso", 
        `Linhas de pesquisadores concluídas: ${linhasResult.novos_encontrados || 0} novas`);
      manager.addResult('linhas', linhasResult);
    } catch (error) {
      manager.addError('linhas', error);
    }

    // Pequena pausa entre scrapes de linhas
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Linhas de estudantes
    try {
      manager.logEtapa("linhas_estudantes", "iniciando", 
        "Processando linhas de estudantes...");
      
      const linhasEstudantesResult = await executeTask(async () => {
        return await processarScrapeLinhasEstudantes();
      }, "processarScrapeLinhasEstudantes", 300000);
      
      manager.logEtapa("linhas_estudantes", "sucesso", 
        `Linhas de estudantes concluídas: ${linhasEstudantesResult.novos_encontrados || 0} novas`);
      manager.addResult('linhasEstudantes', linhasEstudantesResult);
    } catch (error) {
      manager.addError('linhasEstudantes', error);
    }

    // 🔹 ETAPA 3: Finalização
    const finalResult = manager.finalize();
    
    return res.status(finalResult.errors ? 207 : 200).json({
      ...finalResult,
      scrapeId
    });

  } catch (error) {
    // Erro crítico inesperado
    const duration = manager.getDuration();
    
    scrapeEmitter.emit("status", {
      scrapeId,
      etapa: "erro_critico",
      status: "erro",
      mensagem: `Erro crítico: ${error.message}`,
      timestamp: new Date().toISOString(),
      duracao: `${duration}s`,
      stack: error.stack
    });

    console.error("Erro crítico no scraping:", error);
    
    return res.status(500).json({
      success: false,
      error: "Erro crítico no scraping",
      message: error.message,
      duration: `${duration}s`,
      timestamp: new Date().toISOString(),
      scrapeId
    });

  } finally {
    isScraping = false;
    currentScrapeId = null;
  }
}

// Versão sequencial simplificada
export async function runScrapeSequential(req, res) {
  if (isScraping) {
    return res.status(429).json({
      success: false,
      error: "Scraping já em execução",
      message: "Aguarde a conclusão da execução atual",
      timestamp: new Date().toISOString()
    });
  }

  isScraping = true;
  const manager = new ScrapeManager();
  const scrapeId = manager.start();

  try {
    // Executa uma tarefa por vez
    const tarefas = [
      { 
        nome: "pesquisadores", 
        fn: processarScrapePesquisador, 
        timeout: 180000,
        mensagem: "Processando pesquisadores..." 
      },
      { 
        nome: "estudantes", 
        fn: processarEstudantes, 
        timeout: 240000,
        mensagem: "Processando estudantes..." 
      },
      { 
        nome: "linhas_pesquisadores", 
        fn: processarScrapeLinhas, 
        timeout: 300000,
        mensagem: "Processando linhas de pesquisadores...",
        delayAntes: 2000 
      },
      { 
        nome: "linhas_estudantes", 
        fn: processarScrapeLinhasEstudantes, 
        timeout: 300000,
        mensagem: "Processando linhas de estudantes...",
        delayAntes: 3000 
      }
    ];

    for (const tarefa of tarefas) {
      // Delay antes da tarefa, se especificado
      if (tarefa.delayAntes) {
        manager.logEtapa("delay", "aguardando", 
          `Aguardando ${tarefa.delayAntes/1000}s antes de ${tarefa.nome}...`);
        await new Promise(resolve => setTimeout(resolve, tarefa.delayAntes));
      }

      manager.logEtapa(tarefa.nome, "iniciando", tarefa.mensagem);

      try {
        const resultado = await executeTask(tarefa.fn, tarefa.nome, tarefa.timeout);
        
        const tipo = tarefa.nome === 'linhas_pesquisadores' ? 'linhas' : 
                    tarefa.nome === 'linhas_estudantes' ? 'linhasEstudantes' : tarefa.nome;
        
        manager.addResult(tipo, resultado);
        
        const novos = resultado.novos_encontrados || 0;
        manager.logEtapa(tarefa.nome, "sucesso", 
          `${tarefa.mensagem.replace('Processando', 'Concluído')} - ${novos} novos`);
      } catch (error) {
        const tipo = tarefa.nome === 'linhas_pesquisadores' ? 'linhas' : 
                    tarefa.nome === 'linhas_estudantes' ? 'linhasEstudantes' : tarefa.nome;
        
        manager.addError(tipo, error);
      }
    }

    const finalResult = manager.finalize();
    
    return res.status(finalResult.errors ? 207 : 200).json({
      ...finalResult,
      scrapeId
    });

  } catch (error) {
    const duration = manager.getDuration();
    
    scrapeEmitter.emit("status", {
      scrapeId,
      etapa: "erro_critico",
      status: "erro",
      mensagem: `Erro crítico: ${error.message}`,
      timestamp: new Date().toISOString(),
      duracao: `${duration}s`
    });

    return res.status(500).json({
      success: false,
      error: "Erro crítico no scraping",
      message: error.message,
      duration: `${duration}s`,
      timestamp: new Date().toISOString(),
      scrapeId
    });

  } finally {
    isScraping = false;
    currentScrapeId = null;
  }
}

// Versão otimizada para performance (execução paralela inteligente)
export async function runScrapeOptimized(req, res) {
  if (isScraping) {
    return res.status(429).json({
      success: false,
      error: "Scraping já em execução",
      message: "Aguarde a conclusão da execução atual",
      timestamp: new Date().toISOString()
    });
  }

  isScraping = true;
  const manager = new ScrapeManager();
  const scrapeId = manager.start();

  try {
    manager.logEtapa("estrategia", "iniciando", 
      "Usando estratégia otimizada: tarefas independentes em paralelo, tarefas popup sequencial");

    // Grupo 1: Tarefas independentes (paralelo)
    const grupoIndependente = [
      { nome: "pesquisadores", fn: processarScrapePesquisador, timeout: 180000 },
      { nome: "estudantes", fn: processarEstudantes, timeout: 240000 }
    ];

    manager.logEtapa("grupo_independente", "iniciando", 
      "Executando tarefas independentes em paralelo...");

    const resultadosIndependentes = await Promise.allSettled(
      grupoIndependente.map(tarefa => 
        executeTask(async () => {
          manager.logEtapa(tarefa.nome, "iniciando", `Processando ${tarefa.nome}...`);
          const resultado = await tarefa.fn();
          manager.logEtapa(tarefa.nome, "sucesso", 
            `${tarefa.nome} concluído: ${resultado.novos_encontrados || 0} novos`);
          return { nome: tarefa.nome, resultado };
        }, tarefa.nome, tarefa.timeout)
      )
    );

    // Processa resultados do grupo independente
    resultadosIndependentes.forEach((resultado, index) => {
      const nome = grupoIndependente[index].nome;
      if (resultado.status === 'fulfilled') {
        manager.addResult(nome, resultado.value.resultado);
      } else {
        manager.addError(nome, resultado.reason);
      }
    });

    // Pequena pausa
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Grupo 2: Tarefas com popups (sequencial)
    const grupoPopup = [
      { 
        nome: "linhas_pesquisadores", 
        fn: processarScrapeLinhas, 
        timeout: 300000,
        tipo: 'linhas'
      },
      { 
        nome: "linhas_estudantes", 
        fn: processarScrapeLinhasEstudantes, 
        timeout: 300000,
        tipo: 'linhasEstudantes'
      }
    ];

    for (const tarefa of grupoPopup) {
      manager.logEtapa(tarefa.nome, "iniciando", 
        `Processando ${tarefa.nome.replace('_', ' de ')}...`);

      try {
        const resultado = await executeTask(tarefa.fn, tarefa.nome, tarefa.timeout);
        manager.addResult(tarefa.tipo, resultado);
        manager.logEtapa(tarefa.nome, "sucesso", 
          `${tarefa.nome.replace('_', ' de ')} concluído: ${resultado.novos_encontrados || 0} novas`);
      } catch (error) {
        manager.addError(tarefa.tipo, error);
      }

      // Pausa entre tarefas popup
      if (tarefa.nome !== grupoPopup[grupoPopup.length - 1].nome) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    const finalResult = manager.finalize();
    
    return res.status(finalResult.errors ? 207 : 200).json({
      ...finalResult,
      scrapeId
    });

  } catch (error) {
    const duration = manager.getDuration();
    
    scrapeEmitter.emit("status", {
      scrapeId,
      etapa: "erro_critico",
      status: "erro",
      mensagem: `Erro crítico: ${error.message}`,
      timestamp: new Date().toISOString(),
      duracao: `${duration}s`,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      error: "Erro crítico no scraping",
      message: error.message,
      duration: `${duration}s`,
      timestamp: new Date().toISOString(),
      scrapeId
    });

  } finally {
    isScraping = false;
    currentScrapeId = null;
  }
}

// Status atual do scraping
export async function getScrapeStatus(req, res) {
  return res.json({
    isScraping,
    currentScrapeId,
    timestamp: new Date().toISOString()
  });
}

// Health check simplificado
export async function checkScrapeHealth(req, res) {
  try {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      isScraping,
      currentScrapeId,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
      },
      uptime: process.uptime()
    };

    // Verifica Chrome
    const CHROME_PATH = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    const fs = await import('fs');
    
    health.chrome = {
      available: fs.existsSync(CHROME_PATH),
      path: CHROME_PATH
    };

    return res.json(health);
  } catch (error) {
    return res.status(500).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Cancelar scraping atual (se possível)
export async function cancelScrape(req, res) {
  if (!isScraping) {
    return res.json({
      success: true,
      message: "Nenhum scraping em execução para cancelar",
      timestamp: new Date().toISOString()
    });
  }

  scrapeEmitter.emit("status", {
    scrapeId: currentScrapeId,
    etapa: "cancelamento",
    status: "cancelando",
    mensagem: "Solicitação de cancelamento recebida",
    timestamp: new Date().toISOString()
  });

  // Nota: Cancelamento real requer implementação adicional
  return res.json({
    success: true,
    message: "Solicitação de cancelamento enviada",
    currentScrapeId,
    timestamp: new Date().toISOString()
  });
}