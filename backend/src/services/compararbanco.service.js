import scrapePesquisadores1 from "./scrapepesquisador1.service.js";
import scrapeEstudantes from "./scrapeestudantes.service.js";
import {
  normalizarPesquisadores,
  normalizarLinhasPesquisa,
  normalizarVinculos,
  deduplicarLinhas,
  detectarNovasLinhas,
  vincularPesquisadorLinhas,
} from "./normalizarPesquisadores.service.js";
import { detectarNovosPesquisadores } from "./compararpesquisadores.service.js";
import { db } from "../config/db.js";
import scrapeLinhas from "./scrapeLinhas.service.js";
import scrapeLinhasEstudantes from "./scrapelinhasestudantes.service.js";
import { scrapeEmitter } from "../utils/scrapeEmitter.js";

import { criarNotificacoes } from "./notificacao.service.js";

// Cache para reduzir queries repetidas
const cache = {
  pesquisadores: null,
  estudantes: null,
  linhasPesquisa: null,
  lastUpdated: null
};

// Limpa cache após 5 minutos
const CACHE_TTL = 5 * 60 * 1000;

async function getCachedPesquisadores(tipo = 'pesquisador') {
  const now = Date.now();
  if (!cache.pesquisadores || !cache.lastUpdated || (now - cache.lastUpdated) > CACHE_TTL) {
    const [rows] = await db.query(
      `SELECT nome FROM pesquisadores WHERE tipo_vinculo = ?`,
      [tipo]
    );
    cache.pesquisadores = rows;
    cache.lastUpdated = now;
  }
  return cache.pesquisadores;
}

async function getCachedLinhasPesquisa() {
  const now = Date.now();
  if (!cache.linhasPesquisa || !cache.lastUpdated || (now - cache.lastUpdated) > CACHE_TTL) {
    const [rows] = await db.query(`SELECT nome, grupo FROM linhas_pesquisa`);
    cache.linhasPesquisa = rows;
    cache.lastUpdated = now;
  }
  return cache.linhasPesquisa;
}

// Função para inserção em batch (muito mais rápido)
async function batchInsertPesquisadores(pesquisadores, tipoVinculo) {
  if (pesquisadores.length === 0) return 0;

  const values = pesquisadores.map(p =>
    [p.nome, p.titulacao_max || null, tipoVinculo]
  );

  const placeholders = values.map(() => '(?, ?, ?)').join(',');
  const flattenedValues = values.flat();

  try {
    const [result] = await db.query(
      `INSERT INTO pesquisadores (nome, titulacao_maxima, tipo_vinculo) 
       VALUES ${placeholders} 
       ON DUPLICATE KEY UPDATE 
         titulacao_maxima = COALESCE(VALUES(titulacao_maxima), titulacao_maxima),
         updated_at = CURRENT_TIMESTAMP`,
      flattenedValues
    );

    return result.affectedRows;
  } catch (error) {
    // Fallback para inserção individual em caso de erro
    console.warn('Batch insert falhou, usando inserção individual:', error.message);
    let successCount = 0;

    for (const p of pesquisadores) {
      try {
        await db.query(
          `INSERT INTO pesquisadores (nome, titulacao_maxima, tipo_vinculo)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE 
             titulacao_maxima = COALESCE(?, titulacao_maxima)`,
          [p.nome, p.titulacao_max || null, tipoVinculo, p.titulacao_max || null]
        );
        successCount++;
      } catch (err) {
        console.error(`Erro ao inserir pesquisador ${p.nome}:`, err.message);
      }
    }

    return successCount;
  }
}

//faltando verificacao dos dados como as notificacooes etc 
async function batchInsertLinhasPesquisa(linhas) {
  if (linhas.length === 0) return 0;

  const values = linhas.map(l => [l.nome, l.grupo, 1]);
  const placeholders = values.map(() => '(?, ?, ?)').join(',');
  const flattenedValues = values.flat();

  try {
    const [result] = await db.query(
      `INSERT IGNORE INTO linhas_pesquisa (nome, grupo, ativo) 
       VALUES ${placeholders}`,
      flattenedValues
    );

    return result.affectedRows;
  } catch (error) {
    console.warn('Batch insert de linhas falhou, usando individual:', error.message);
    let successCount = 0;

    for (const l of linhas) {
      try {
        await db.query(
          `INSERT IGNORE INTO linhas_pesquisa (nome, grupo, ativo)
           VALUES (?, ?, 1)`,
          [l.nome, l.grupo]
        );
        successCount++;
      } catch (err) {
        console.error(`Erro ao inserir linha ${l.nome}:`, err.message);
      }
    }

    return successCount;
  }
}

// Limpa cache
function clearCache() {
  cache.pesquisadores = null;
  cache.estudantes = null;
  cache.linhasPesquisa = null;
  cache.lastUpdated = null;
}

/* =====================================================
   PESQUISADORES (OTIMIZADO)
===================================================== */
export async function processarScrapePesquisador(browser = null) {
  try {
    scrapeEmitter.emit("status", {
      etapa: "pesquisadores_scrape",
      status: "iniciando",
      mensagem: "Iniciando scraping de pesquisadores..."
    });

    const brutos = await scrapePesquisadores1(browser);

    scrapeEmitter.emit("status", {
      etapa: "pesquisadores_normalizacao",
      status: "iniciando",
      mensagem: `Normalizando ${brutos.length} pesquisadores...`
    });

    const normalizados = normalizarPesquisadores(brutos);
    const dbPesquisadores = await getCachedPesquisadores('pesquisador');

    const novos = detectarNovosPesquisadores(normalizados, dbPesquisadores);


    console.log("DB CACHE:", dbPesquisadores.length);
    console.log("NORMALIZADOS:", normalizados.length);

    scrapeEmitter.emit("status", {
      etapa: "pesquisadores_insercao",
      status: "iniciando",
      mensagem: `Inserindo ${novos.length} novos pesquisadores...`
    });

    const notificacoesCriadas = await criarNotificacoes(
      "NOVO_PESQUISADOR",
      novos
    );


    // Limpa cache após inserção
    clearCache();

    scrapeEmitter.emit("status", {
      etapa: "pesquisadores",
      status: "sucesso",
      mensagem: `Pesquisadores processados: ${notificacoesCriadas} novas notificacoes`
    });

    return {
      total_lattes: normalizados.length,
      total_banco: dbPesquisadores.length,
      novos_encontrados: novos.length,
      novos_inseridos: notificacoesCriadas,
      duplicados_ignorados: novos.length - notificacoesCriadas
    };

  } catch (error) {
    scrapeEmitter.emit("status", {
      etapa: "pesquisadores",
      status: "erro",
      mensagem: `Erro: ${error.message}`
    });
    throw error;
  }
}

/* =====================================================
   ESTUDANTES (OTIMIZADO)
===================================================== */
export async function processarEstudantes(browser = null) {
  try {
    scrapeEmitter.emit("status", {
      etapa: "estudantes_scrape",
      status: "iniciando",
      mensagem: "Iniciando scraping de estudantes..."
    });

    clearCache();
    const brutos = await scrapeEstudantes(browser);

    scrapeEmitter.emit("status", {
      etapa: "estudantes_normalizacao",
      status: "iniciando",
      mensagem: `Normalizando ${brutos.length} estudantes...`
    });

    const normalizados = normalizarPesquisadores(brutos);
    const dbEstudantes = await getCachedPesquisadores('estudante');
    const novos = detectarNovosPesquisadores(normalizados, dbEstudantes);


    scrapeEmitter.emit("status", {
      etapa: "estudantes_insercao",
      status: "iniciando",
      mensagem: `Inserindo ${novos.length} novos estudantes...`
    });

    const notificacoesCriadas = await criarNotificacoes(
      "NOVO_ESTUDANTE",
      novos
    );



    scrapeEmitter.emit("status", {
      etapa: "estudantes",
      status: "sucesso",
      mensagem: `Estudantes processados: ${notificacoesCriadas} novos pendentes`
    });

    return {
      total_lattes: normalizados.length,
      total_banco: dbEstudantes.length, // não mudou
      novos_encontrados: novos.length,
      novos_pendentes: notificacoesCriadas,
      duplicados_ignorados: normalizados.length - novos.length
    };

  } catch (error) {
    scrapeEmitter.emit("status", {
      etapa: "estudantes",
      status: "erro",
      mensagem: `Erro: ${error.message}`
    });
    throw error;
  }
}

/* =====================================================
   LINHAS DE PESQUISA - FUNÇÃO BASE REUTILIZÁVEL
===================================================== */
async function processarLinhasBase(scrapeFunction, tipo, browser = null, chunkOptions = null) {
  try {
    scrapeEmitter.emit("status", {
      etapa: `linhas_${tipo}_scrape`,
      status: "iniciando",
      mensagem: `Iniciando scraping de linhas (${tipo})...`,
      chunk: chunkOptions
    });

    // Se temos opções de chunk, passa para a função de scrape
    const brutos = chunkOptions
      ? await scrapeFunction(browser, chunkOptions)
      : await scrapeFunction(browser);

    if (!brutos || brutos.length === 0) {
      scrapeEmitter.emit("status", {
        etapa: `linhas_${tipo}`,
        status: "vazio",
        mensagem: `Nenhum dado encontrado para ${tipo}`
      });
      return {
        total_lattes: 0,
        total_banco: 0,
        novos_encontrados: 0,
        novos_inseridos: 0
      };
    }

    scrapeEmitter.emit("status", {
      etapa: `linhas_${tipo}_normalizacao`,
      status: "iniciando",
      mensagem: `Processando ${brutos.length} registros de ${tipo}...`
    });

    const normalizados = normalizarLinhasPesquisa(brutos);
    const unicos = deduplicarLinhas(normalizados);
    const dbLinhas = await getCachedLinhasPesquisa();
    const novas = detectarNovasLinhas(unicos, dbLinhas);

    scrapeEmitter.emit("status", {
      etapa: `linhas_${tipo}_insercao`,
      status: "iniciando",
      mensagem: `Inserindo ${novas.length} novas linhas...`
    });
    const notificacoesCriadas = await criarNotificacoes(
      "NOVA_LINHA",
      novas
    );
    console.log(notificacoesCriadas)


    scrapeEmitter.emit("status", {
      etapa: `linhas_${tipo}_vinculos`,
      status: "iniciando",
      mensagem: "Processando vínculos..."
    });

    const vinculos = normalizarVinculos(brutos);
    const vinculosProcessados = await vincularPesquisadorLinhas(vinculos);

    clearCache();

    scrapeEmitter.emit("status", {
      etapa: `linhas_${tipo}`,
      status: "sucesso",
      mensagem: `Linhas ${tipo} processadas: ${notificacoesCriadas} novas notificacoes, ${vinculosProcessados} vínculos`
    });

    return {
      total_lattes: unicos.length,
      total_banco: dbLinhas.length,
      novos_encontrados: novas.length,
      novas_notificacao: notificacoesCriadas,
      vinculos_processados: vinculosProcessados,
      chunk: chunkOptions
    };

  } catch (error) {
    scrapeEmitter.emit("status", {
      etapa: `linhas_${tipo}`,
      status: "erro",
      mensagem: `Erro: ${error.message}`,
      chunk: chunkOptions
    });
    throw error;
  }
}

/* =====================================================
   LINHAS DE PESQUISA (PESQUISADORES) - VERSÃO PARALELA
===================================================== */
export async function processarScrapeLinhas(browser = null, chunkOptions = null) {
  return await processarLinhasBase(scrapeLinhas, 'pesquisadores', browser, chunkOptions);
}

/* =====================================================
   LINHAS DE PESQUISA (ESTUDANTES) - VERSÃO PARALELA
===================================================== */
export async function processarScrapeLinhasEstudantes(browser = null, chunkOptions = null) {
  return await processarLinhasBase(scrapeLinhasEstudantes, 'estudantes', browser, chunkOptions);
}

/* =====================================================
   VERSÃO PARALELA PARA 2 EXECUÇÕES SIMULTÂNEAS
===================================================== */
export async function processarScrapeLinhasParalelo(browser = null, maxWorkers = 2) {
  try {
    scrapeEmitter.emit("status", {
      etapa: "linhas_paralelo",
      status: "iniciando",
      mensagem: `Iniciando processamento paralelo com ${maxWorkers} workers...`
    });

    // Primeiro, precisamos saber quantos itens temos para dividir
    // Isso requer uma função auxiliar no scrape
    const totalItems = await estimarTotalLinhas(browser);
    const itemsPorWorker = Math.ceil(totalItems / maxWorkers);

    const workers = [];
    const results = [];

    for (let i = 0; i < maxWorkers; i++) {
      const startIndex = i * itemsPorWorker;
      const endIndex = Math.min(startIndex + itemsPorWorker - 1, totalItems - 1);

      if (startIndex >= totalItems) break;

      workers.push(
        processarLinhasBase(
          scrapeLinhas,
          'pesquisadores_paralelo',
          browser,
          { workerId: i, startIndex, endIndex, totalItems }
        ).then(result => {
          results.push(result);
          return result;
        })
      );
    }

    const workerResults = await Promise.allSettled(workers);

    // Combina resultados
    const combinedResult = {
      total_lattes: 0,
      total_banco: 0,
      novos_encontrados: 0,
      novos_inseridos: 0,
      vinculos_processados: 0,
      workers: []
    };

    workerResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        combinedResult.total_lattes += result.value.total_lattes || 0;
        combinedResult.novos_encontrados += result.value.novos_encontrados || 0;
        combinedResult.novos_inseridos += result.value.novos_inseridos || 0;
        combinedResult.vinculos_processados += result.value.vinculos_processados || 0;
        combinedResult.workers.push({
          worker: index,
          success: true,
          ...result.value
        });
      } else {
        combinedResult.workers.push({
          worker: index,
          success: false,
          error: result.reason?.message
        });
      }
    });

    // Pega total do banco uma vez
    const [dbRows] = await db.query(`SELECT COUNT(*) as total FROM linhas_pesquisa`);
    combinedResult.total_banco = dbRows[0].total;

    scrapeEmitter.emit("status", {
      etapa: "linhas_paralelo",
      status: "sucesso",
      mensagem: `Processamento paralelo concluído: ${combinedResult.novos_inseridos} novas linhas`
    });

    return combinedResult;

  } catch (error) {
    scrapeEmitter.emit("status", {
      etapa: "linhas_paralelo",
      status: "erro",
      mensagem: `Erro no processamento paralelo: ${error.message}`
    });
    throw error;
  }
}

// Função auxiliar para estimar total (precisa ser implementada no scrape)
async function estimarTotalLinhas(browser) {
  // Esta função deve ser implementada no seu serviço de scrape
  // para retornar o total de itens sem processar tudo
  // Por enquanto, retorna um valor padrão ou faz uma query estimada
  try {
    // Exemplo: contar pesquisadores no banco
    const [rows] = await db.query(`SELECT COUNT(*) as total FROM pesquisadores WHERE tipo_vinculo = 'pesquisador'`);
    return rows[0].total || 100;
  } catch {
    return 100; // Fallback
  }
}

/* =====================================================
   FUNÇÃO PARA EXECUTAR TODOS OS PROCESSAMENTOS
===================================================== */
export async function executarProcessamentoCompleto(options = {}) {
  const {
    pesquisadores = true,
    estudantes = true,
    linhasPesquisadores = true,
    linhasEstudantes = true,
    paralelo = false,
    maxWorkers = 2
  } = options;

  const resultados = {};
  const startTime = Date.now();

  try {
    scrapeEmitter.emit("status", {
      etapa: "processamento_completo",
      status: "iniciando",
      mensagem: "Iniciando processamento completo...",
      options
    });

    // Limpa cache no início
    clearCache();

    if (pesquisadores) {
      resultados.pesquisadores = await processarScrapePesquisador();
    }

    if (estudantes) {
      resultados.estudantes = await processarEstudantes();
    }

    if (linhasPesquisadores) {
      if (paralelo) {
        resultados.linhasPesquisadores = await processarScrapeLinhasParalelo(null, maxWorkers);
      } else {
        resultados.linhasPesquisadores = await processarScrapeLinhas();
      }
    }

    if (linhasEstudantes) {
      resultados.linhasEstudantes = await processarScrapeLinhasEstudantes();
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

    scrapeEmitter.emit("status", {
      etapa: "processamento_completo",
      status: "sucesso",
      mensagem: `Processamento completo concluído em ${totalTime}s`,
      duracao: totalTime,
      resultados
    });

    return {
      success: true,
      duracao: `${totalTime}s`,
      resultados
    };

  } catch (error) {
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

    scrapeEmitter.emit("status", {
      etapa: "processamento_completo",
      status: "erro",
      mensagem: `Erro após ${totalTime}s: ${error.message}`,
      duracao: totalTime
    });

    return {
      success: false,
      duracao: `${totalTime}s`,
      error: error.message,
      resultados_parciais: resultados
    };
  }
}

// Função para limpeza periódica
export async function limparRegistrosAntigos(dias = 30) {
  try {
    const [result] = await db.query(
      `DELETE FROM pesquisadores 
       WHERE updated_at < DATE_SUB(NOW(), INTERVAL ? DAY) 
       AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [dias, dias]
    );

    console.log(`Limpeza: ${result.affectedRows} registros antigos removidos`);
    clearCache();

    return {
      registros_removidos: result.affectedRows,
      dias_retidos: dias
    };
  } catch (error) {
    console.error('Erro na limpeza:', error);
    throw error;
  }
}

