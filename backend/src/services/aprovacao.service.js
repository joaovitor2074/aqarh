// services/aprovacao.service.js - REFATORADO
import { db } from '../config/db.js';
import { normalizarNome } from './normalizacao.service.js';
import { obterLinhasDePessoa } from './arquivoBruto.service.js';
import { criarRelacionamentosCompletos } from './relacionamento.service.js';

export async function aprovarPessoa(dados, tipoVinculo = 'pesquisador') {
  const conn = await db.getConnection();
  
  try {
    await conn.beginTransaction();
    
    const { nome, titulacao_max, data_inclusao, email, espelho_url } = dados;
    
    if (!nome) {
      throw new Error('Nome da pessoa é obrigatório');
    }
    
    const nomeNormalizado = normalizarNome(nome);
    
    // Verifica se já existe
    const [[existente]] = await conn.query(
      `SELECT id FROM pesquisadores 
       WHERE UPPER(TRIM(nome)) = ?`,
      [nomeNormalizado]
    );
    
    let pessoaId;
    
    if (existente) {
      pessoaId = existente.id;
      // Atualiza dados
      await conn.query(
        `UPDATE pesquisadores 
         SET titulacao_maxima = ?,
             data_inclusao = ?,
             email = ?,
             espelho_url = ?,
             tipo_vinculo = ?,
             ativo = 1,
             updated_at = NOW()
         WHERE id = ?`,
        [titulacao_max, data_inclusao, email, espelho_url, tipoVinculo, pessoaId]
      );
    } else {
      // Cria nova pessoa
      const [result] = await conn.query(
        `INSERT INTO pesquisadores 
         (nome, titulacao_maxima, data_inclusao, email, espelho_url, tipo_vinculo, ativo) 
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [nomeNormalizado, titulacao_max, data_inclusao, email, espelho_url, tipoVinculo]
      );
      pessoaId = result.insertId;
    }
    
    // Busca linhas no arquivo bruto
    const linhasBrutas = await obterLinhasDePessoa(nome, tipoVinculo);
    
    if (linhasBrutas.length > 0) {
      // Cria relacionamentos com as linhas
      await criarRelacionamentosCompletos(
        pessoaId,
        linhasBrutas.map(l => ({
          nome: l.linha_pesquisa,
          grupo: l.grupo
        })),
        tipoVinculo
      );
    }
    
    await conn.commit();
    return pessoaId;
    
  } catch (error) {
    await conn.rollback();
    console.error('Erro ao aprovar pessoa:', error);
    throw error;
  } finally {
    conn.release();
  }
}

export async function aprovarLinhaIsolada(dadosLinha) {
  const conn = await db.getConnection();
  
  try {
    await conn.beginTransaction();
    
    const linhaId = await criarOuBuscarLinha(conn, dadosLinha);
    
    await conn.commit();
    return linhaId;
    
  } catch (error) {
    await conn.rollback();
    console.error('Erro ao aprovar linha:', error);
    throw error;
  } finally {
    conn.release();
  }
}