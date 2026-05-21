// services/resolvers.service.js - REFATORADO
import { normalizarNome } from './normalizacao.service.js';

export async function resolverLinhaPorNome(conn, nomeLinha) {
  if (!nomeLinha) return null;
  
  const nomeNormalizado = normalizarNome(nomeLinha);
  
  const [[linha]] = await conn.query(
    `SELECT id FROM linhas_pesquisa 
     WHERE ativo = 1 
     AND UPPER(TRIM(nome)) = ?`,
    [nomeNormalizado]
  );

  return linha?.id || null;
}

export async function resolverPesquisadorPorNome(conn, nome) {
  if (!nome) return null;
  
  const nomeNormalizado = normalizarNome(nome);
  
  const [[pesquisador]] = await conn.query(
    `SELECT id FROM pesquisadores 
     WHERE ativo = 1 
     AND UPPER(TRIM(nome)) = ?`,
    [nomeNormalizado]
  );

  return pesquisador?.id || null;
}

export async function criarOuBuscarLinha(conn, linhaData) {
  if (!linhaData?.nome) return null;
  
  const nomeNormalizado = normalizarNome(linhaData.nome);
  const grupo = linhaData.grupo?.trim() || null;
  
  // Tenta encontrar existente
  const [[existente]] = await conn.query(
    `SELECT id FROM linhas_pesquisa 
     WHERE UPPER(TRIM(nome)) = ?`,
    [nomeNormalizado]
  );
  
  if (existente) {
    return existente.id;
  }
  
  // Cria nova linha
  const [result] = await conn.query(
    `INSERT INTO linhas_pesquisa (nome, grupo, ativo) 
     VALUES (?, ?, 1)`,
    [nomeNormalizado, grupo]
  );
  
  return result.insertId;
}

