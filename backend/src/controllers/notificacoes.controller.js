// controllers/notificacoes.controller.js - REFATORADO
import { db } from '../config/db.js';
import { normalizarNome } from '../services/normalizacao.service.js';
import { obterLinhasDePessoa } from '../services/arquivoBruto.service.js';
import { aprovarPessoa } from '../services/aprovacao.service.js';
import { criarOuBuscarLinha } from '../services/resolvers.service.js';
import { logger } from '../services/log.service.js';

export async function listarNotificacoes(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT id, tipo, status, dados, criado_em
       FROM notificacoes_scraping
       WHERE status = 'pendente'
       ORDER BY criado_em DESC`
    );

    const notificacoesFormatadas = await Promise.all(
      rows.map(async (notificacao) => {
        const dados = typeof notificacao.dados === 'string' 
          ? JSON.parse(notificacao.dados) 
          : notificacao.dados;
        
        let descricao = '';
        
        switch (notificacao.tipo) {
          case 'NOVO_PESQUISADOR': {
            const nome = dados.nome || 'Nome não informado';
            const titulacao = dados.titulacao_max || 'Titulação não informada';
            
            // Busca linhas no arquivo bruto para mostrar preview
            const linhasBrutas = await obterLinhasDePessoa(nome, 'pesquisador');
            const qtdLinhas = linhasBrutas.length;
            
            if (qtdLinhas > 0) {
              const nomesLinhas = linhasBrutas.map(l => l.linha_pesquisa);
              descricao = `${nome} (${titulacao}) - ${qtdLinhas} linha(s): ${nomesLinhas.join(', ')}`;
            } else {
              descricao = `${nome} (${titulacao}) - Sem linhas de pesquisa associadas`;
            }
            break;
          }
          
          case 'NOVO_ESTUDANTE': {
            const nome = dados.nome || 'Nome não informado';
            const linhasBrutas = await obterLinhasDePessoa(nome, 'estudante');
            const qtdLinhas = linhasBrutas.length;
            
            if (qtdLinhas > 0) {
              const nomesLinhas = linhasBrutas.map(l => l.linha_pesquisa);
              descricao = `${nome} - ${qtdLinhas} linha(s): ${nomesLinhas.join(', ')}`;
            } else {
              descricao = `${nome} - Sem linhas de pesquisa associadas`;
            }
            break;
          }
          
          case 'NOVA_LINHA': {
            const nomeLinha = dados.nome || dados.linha_pesquisa || 'Linha não informada';
            const grupo = dados.grupo || 'Grupo não informado';
            descricao = `Nova linha: ${nomeLinha} (${grupo})`;
            break;
          }
          
          default:
            descricao = 'Notificação sem descrição específica';
        }
        
        return {
          id: notificacao.id,
          tipo: notificacao.tipo,
          status: notificacao.status,
          descricao,
          criado_em: notificacao.criado_em,
          dados // Inclui dados completos para referência
        };
      })
    );
    
    res.json(notificacoesFormatadas);
    
  } catch (error) {
    console.error('Erro ao listar notificações:', error);
    res.status(500).json({ error: 'Erro ao listar notificações' });
  }
}

export async function AprovarNotificacao(dados, tipoVinculo = 'pesquisador') {
  const conn = await db.getConnection();
  
  try {
    await conn.beginTransaction();
    
    logger.info(`Iniciando aprovação de ${tipoVinculo}`, { nome: dados.nome });
    
    if (!dados || !dados.nome) {
      throw new Error('Dados da pessoa são obrigatórios');
    }
    
    const dadosParseados = typeof dados === 'string' ? JSON.parse(dados) : dados;
    const { nome, titulacao_max, data_inclusao, email, espelho_url } = dadosParseados;
    
    if (!nome) {
      throw new Error('Nome da pessoa é obrigatório');
    }
    
    const nomeNormalizado = normalizarNome(nome);
    
    // 1. Verifica se já existe
    const [[pessoaExistente]] = await conn.query(
      `SELECT id, nome FROM pesquisadores WHERE UPPER(TRIM(nome)) = ?`,
      [nomeNormalizado]
    );
    
    let pessoaId;
    
    if (pessoaExistente) {
      pessoaId = pessoaExistente.id;
      logger.debug('Pessoa já existe, atualizando dados', { 
        id: pessoaId, 
        nome: pessoaExistente.nome 
      });
      
      // Atualiza dados básicos
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
      
      logger.success('Dados da pessoa atualizados', { pessoaId });
    } else {
      // Cria nova pessoa
      const [result] = await conn.query(
        `INSERT INTO pesquisadores 
         (nome, titulacao_maxima, data_inclusao, email, espelho_url, tipo_vinculo, ativo) 
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [nomeNormalizado, titulacao_max, data_inclusao, email, espelho_url, tipoVinculo]
      );
      
      pessoaId = result.insertId;
      logger.success('Nova pessoa criada', { pessoaId, nome: nomeNormalizado });
    }
    
    // 2. Busca linhas no arquivo bruto
    logger.debug('Buscando linhas no arquivo bruto', { nome, tipoVinculo });
    const linhasBrutas = await obterLinhasDePessoa(nome, tipoVinculo);
    
    if (linhasBrutas.length > 0) {
      logger.info(`Encontradas ${linhasBrutas.length} linhas para ${nome}`, linhasBrutas);
      
      // 3. Para cada linha, criar ou buscar e criar relacionamento
      for (const linha of linhasBrutas) {
        const nomeLinha = linha.linha_pesquisa;
        const grupo = linha.grupo;
        
        // Busca ou cria linha
        const [[linhaExistente]] = await conn.query(
          `SELECT id FROM linhas_pesquisa WHERE UPPER(TRIM(nome)) = ?`,
          [normalizarNome(nomeLinha)]
        );
        
        let linhaId;
        
        if (linhaExistente) {
          linhaId = linhaExistente.id;
          logger.debug('Linha já existe', { linhaId, nomeLinha });
        } else {
          const [resultLinha] = await conn.query(
            `INSERT INTO linhas_pesquisa (nome, grupo, ativo) VALUES (?, ?, 1)`,
            [nomeLinha, grupo]
          );
          linhaId = resultLinha.insertId;
          logger.success('Nova linha criada', { linhaId, nomeLinha, grupo });
        }
        
        // Cria relacionamento
        await conn.query(
          `INSERT IGNORE INTO pesquisador_linha_pesquisa 
           (pesquisador_id, linha_pesquisa_id) 
           VALUES (?, ?)`,
          [pessoaId, linhaId]
        );
        
        logger.debug('Relacionamento criado', { 
          pessoaId, 
          linhaId, 
          nomeLinha 
        });
      }
      
      logger.success(`Relacionamentos criados para ${nome}: ${linhasBrutas.length} linhas`);
    } else {
      logger.warn(`Nenhuma linha encontrada para ${nome} no arquivo bruto`);
    }
    
    await conn.commit();
    logger.success(`${tipoVinculo} aprovado com sucesso`, { 
      pessoaId, 
      nome: nomeNormalizado,
      totalLinhas: linhasBrutas.length 
    });
    
    return pessoaId;
    
  } catch (error) {
    await conn.rollback();
    logger.error(`Erro ao aprovar ${tipoVinculo}`, error);
    throw error;
  } finally {
    conn.release();
  }
}

// Mantenha as outras funções (listarNotificacoes, AprovarNotificacaoLinha) conforme você já tem
// ... restante do código ...
export async function AprovarNotificacaoLinha(idNotificacao) {
  const conn = await db.getConnection();
  
  try {
    const [[notificacao]] = await conn.query(
      `SELECT dados FROM notificacoes_scraping WHERE id = ?`,
      [idNotificacao]
    );
    
    if (!notificacao) {
      throw new Error('Notificação não encontrada');
    }
    
    const dados = typeof notificacao.dados === 'string' 
      ? JSON.parse(notificacao.dados) 
      : notificacao.dados;
    
    // Linha isolada - apenas cria/atualiza a linha
    // O relacionamento será feito quando o pesquisador for aprovado
    const linhaId = await criarOuBuscarLinha(conn, {
      nome: dados.nome || dados.linha_pesquisa,
      grupo: dados.grupo
    });
    
    await conn.query(
      `UPDATE notificacoes_scraping 
       SET status = 'aprovado', avaliado_em = NOW() 
       WHERE id = ?`,
      [idNotificacao]
    );
    
    return linhaId;
    
  } catch (error) {
    console.error('Erro ao aprovar notificação de linha:', error);
    throw error;
  } finally {
    conn.release();
  }
}