import scrapePesquisadores from "./scrapePesquisadores.service.js";
import scrapeEstudantes from "./scrapeestudantes.service.js";
import { normalizarLinhasPesquisa,normalizarPesquisadores } from "./normalizarPesquisadores.service.js";
import { detectarNovosPesquisadores } from "./compararpesquisadores.service.js";
import { db } from "../config/db.js";


import scrapeLinhas from "./scrapeLinhas.service.js";
import scrapeLinhasEstudantes from "./scrapelinhasestudantes.service.js";


export async function processarScrapePesquisador() {
  // 1️⃣ SCRAPE
  const brutos = await scrapePesquisadores();

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
  console.log(brutos)

}


export async function processarScrapeLinhas(){
  // 1️⃣ SCRAPE
  const brutos = await scrapeLinhas();
  
  const normalizados = normalizarLinhasPesquisa(brutos)
  console.log(brutos)
  console.log(normalizados)
  




}

export async function processarScrapelinhasEstudantes(){
  const brutos = scrapeLinhasEstudantes()
  console.log(brutos)
}

