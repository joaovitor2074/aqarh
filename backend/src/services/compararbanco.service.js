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

/* =====================================================
   PESQUISADORES
===================================================== */
export async function processarScrapePesquisador() {
  const brutos = await scrapePesquisadores1();
  const normalizados = normalizarPesquisadores(brutos);

  const [rows] = await db.query(`
    SELECT nome FROM pesquisadores WHERE tipo_vinculo = 'pesquisador'
  `);

  const novos = detectarNovosPesquisadores(normalizados, rows);

  // 🔥 INSERÇÃO
  for (const p of novos) {
    await db.query(
      `INSERT INTO pesquisadores (nome, titulacao_max, tipo_vinculo)
       VALUES (?, ?, 'pesquisador')`,
      [p.nome, p.titulacao_max]
    );
  }

  return {
    total_lattes: normalizados.length,
    total_banco: rows.length,
    novos_encontrados: novos.length
  };
}

/* =====================================================
   ESTUDANTES
===================================================== */
export async function processarEstudantes() {
  const brutos = await scrapeEstudantes();
  const normalizados = normalizarPesquisadores(brutos);

  const [rows] = await db.query(`
    SELECT nome FROM pesquisadores WHERE tipo_vinculo = 'estudante'
  `);

  const novos = detectarNovosPesquisadores(normalizados, rows);

  for (const e of novos) {
    await db.query(
      `INSERT INTO pesquisadores (nome, tipo_vinculo)
       VALUES (?, 'estudante')`,
      [e.nome]
    );
  }

  return {
    total_lattes: normalizados.length,
    total_banco: rows.length,
    novos_encontrados: novos.length
  };
}

/* =====================================================
   LINHAS DE PESQUISA (PESQUISADORES)
===================================================== */
export async function processarScrapeLinhas() {
  const brutos = await scrapeLinhas();
  const normalizados = normalizarLinhasPesquisa(brutos);
  const unicos = deduplicarLinhas(normalizados);

  const [rows] = await db.query(`
    SELECT nome, grupo FROM linhas_pesquisa
  `);

  const novas = detectarNovasLinhas(unicos, rows);



  for (const l of novas) {
    await db.query(
      `INSERT IGNORE INTO linhas_pesquisa (nome, grupo, ativo)
       VALUES (?, ?, 1)`,
      [l.nome, l.grupo]
    );
  }
  const vinculos = normalizarVinculos(brutos);

  await vincularPesquisadorLinhas(vinculos);

  return {
    total_lattes: unicos.length,
    total_banco: rows.length,
    novos_encontrados: novas.length
  };
}

/* =====================================================
   LINHAS DE PESQUISA (ESTUDANTES)
===================================================== */
export async function processarScrapeLinhasEstudantes() {
  const brutos = await scrapeLinhasEstudantes();
  const normalizados = normalizarLinhasPesquisa(brutos);
  const unicos = deduplicarLinhas(normalizados);

  const [rows] = await db.query(`
    SELECT nome, grupo FROM linhas_pesquisa
  `);

  const novas = detectarNovasLinhas(unicos, rows);

  for (const l of novas) {
    await db.query(
      `INSERT IGNORE INTO linhas_pesquisa (nome, grupo, ativo)
       VALUES (?, ?, 1)`,
      [l.nome, l.grupo]
    );
  }

  
  const vinculos = normalizarVinculos(brutos);

  await vincularPesquisadorLinhas(vinculos);

  return {
    total_lattes: unicos.length,
    total_banco: rows.length,
    novos_encontrados: novas.length
  };
}
