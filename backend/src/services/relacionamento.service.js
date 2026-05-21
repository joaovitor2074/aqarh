// services/relacionamentos.service.js - UNIFICADO
import { db } from '../config/db.js';
import { criarOuBuscarLinha } from './resolvers.service.js';

export async function criarRelacionamentoPessoaLinha(
  pessoaId, 
  linhaId, 
  tipo = 'pesquisador'
) {
  if (!pessoaId || !linhaId) return false;
  
  const conn = await db.getConnection();
  try {
    await conn.query(
      `INSERT IGNORE INTO pesquisador_linha_pesquisa 
       (pesquisador_id, linha_pesquisa_id) 
       VALUES (?, ?)`,
      [pessoaId, linhaId]
    );
    return true;
  } catch (error) {
    console.error('Erro ao criar relacionamento:', error);
    return false;
  } finally {
    conn.release();
  }
}

export async function criarRelacionamentosCompletos(
  pessoaId,
  linhasPesquisa, // Array de objetos {nome, grupo}
  tipoPessoa = 'pesquisador'
) {
  if (!pessoaId || !Array.isArray(linhasPesquisa)) return;
  
  const conn = await db.getConnection();
  try {
    for (const linha of linhasPesquisa) {
      const linhaId = await criarOuBuscarLinha(conn, linha);
      if (linhaId) {
        await criarRelacionamentoPessoaLinha(pessoaId, linhaId, tipoPessoa);
      }
    }
  } catch (error) {
    console.error('Erro ao criar relacionamentos completos:', error);
    throw error;
  } finally {
    conn.release();
  }
}