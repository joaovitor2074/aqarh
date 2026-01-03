import scrapePesquisadores from "./scrapePesquisadores.service.js";
import scrapePesquisadores1 from "./scrapepesquisador1.service.js";
import scrapeEstudantes from "./scrapeestudantes.service.js";
import { normalizarLinhasPesquisa,normalizarPesquisadores, } from "./normalizarPesquisadores.service.js";
import { detectarNovosPesquisadores } from "./compararpesquisadores.service.js";
import { db } from "../config/db.js";


import scrapeLinhas from "./scrapeLinhas.service.js";
import scrapeLinhasEstudantes from "./scrapelinhasestudantes.service.js";


export async function processarScrapePesquisador() {
  // 1️⃣ SCRAPE
  const brutos = await scrapePesquisadores1();

  // 2️⃣ NORMALIZA
  const normalizados = normalizarPesquisadores(brutos);

  // 3️⃣ BUSCA NO BANCO
  const [rows] = await db.query(`
    SELECT nome
    FROM pesquisadores
    WHERE tipo_vinculo = 'pesquisador'
  `);

  // 4️⃣ COMPARA
  const novos = detectarNovosPesquisadores(normalizados, rows);

  return {
    total_lattes: normalizados.length,
    total_banco: rows.length,
    novos_encontrados: novos.length,
    novos_pesquisadores: novos
  };
}


export async function processarEstudantes(){
  const brutos = await scrapeEstudantes();

  const normalizados  = normalizarPesquisadores(brutos);

  // 3️⃣ BUSCA NO BANCO
  const [rows] = await db.query(`
    SELECT nome
    FROM pesquisadores
    WHERE tipo_vinculo = 'estudante'
  `);

  // 4️⃣ COMPARA
  const novos = detectarNovosPesquisadores(normalizados, rows);

  return {
    total_lattes: normalizados.length,
    total_banco: rows.length,
    novos_encontrados: novos.length,
    novos_estudantes: novos
  };
  

}

export async function processarScrapeLinhas() {
  // 1️⃣ SCRAPE
  const brutos = await scrapeLinhas();

  // 2️⃣ NORMALIZA
  const normalizados = normalizarLinhasPesquisa(brutos);

  // 3️⃣ BUSCA NO BANCO
  const [rows] = await db.query(`
    SELECT nome
    FROM linhas_pesquisa
  `);

  // 4️⃣ COMPARA (reutilizando a mesma função)
  const novas = detectarNovosPesquisadores(normalizados, rows);

  return {
    total_lattes: normalizados.length,
    total_banco: rows.length,
    novos_encontrados: novas.length,
    novas_linhas: novas
  };
}


export async function processarScrapelinhasEstudantes() {
  // 1️⃣ SCRAPE
  const brutos = await scrapeLinhasEstudantes();

  // 2️⃣ NORMALIZA
  const normalizados = normalizarLinhasPesquisa(brutos);

  // 3️⃣ BUSCA NO BANCO
  const [rows] = await db.query(`
    SELECT nome
    FROM linhas_pesquisa
  `);

  // 4️⃣ COMPARA
  const novas = detectarNovosPesquisadores(normalizados, rows);

  return {
    total_lattes: normalizados.length,
    total_banco: rows.length,
    novos_encontrados: novas.length,
    novas_linhas_estudantes: novas
  };
}

