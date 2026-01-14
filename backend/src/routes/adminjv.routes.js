// routes/adminjv.router.js - ATUALIZADO
import { Router } from 'express';
import { runScrape } from '../controllers/scrape.controller.js';
import { scrapeStatus } from '../controllers/scrapeStatus.controller.js';
import { 
  listarNotificacoes, 
  AprovarNotificacao, 
  AprovarNotificacaoLinha 
} from '../controllers/notificacoes.controller.js';
import { criarComunicado } from '../services/comunicados.service.js';
import { db } from '../config/db.js';
import { logger } from '../services/log.service.js';

const router = Router();

router.post('/scrape/run', (req, res) => runScrape(req, res));
router.get('/scrape/status', scrapeStatus);
router.get('/scrape/notificacoes', listarNotificacoes);

// Rota para limpar cache de arquivos brutos (para desenvolvimento)
router.post('/scrape/limpar-cache', (req, res) => {
  import('../services/arquivoBruto.service.js').then(modulo => {
    modulo.limparCache();
    res.json({ success: true, message: 'Cache limpo' });
  }).catch(error => {
    res.status(500).json({ error: 'Erro ao limpar cache' });
  });
});

router.post('/scrape/notificacao/aprovar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info(`Processando aprovação da notificação ${id}`);
    
    const [[notificacao]] = await db.query(
      'SELECT tipo, dados FROM notificacoes_scraping WHERE id = ?',
      [id]
    );
    
    if (!notificacao) {
      logger.warn(`Notificação ${id} não encontrada`);
      return res.status(404).json({ error: 'Notificação não encontrada' });
    }
    
    const dados = typeof notificacao.dados === 'string' 
      ? JSON.parse(notificacao.dados) 
      : notificacao.dados;
    
    let resultado;
    
    switch (notificacao.tipo) {
      case 'NOVO_PESQUISADOR': {
        logger.info(`Aprovando pesquisador: ${dados.nome}`);
        const pesquisadorId = await AprovarNotificacao(dados, 'pesquisador');
        
        await criarComunicado({
          tipo: 'pesquisador',
          titulo: 'Novo pesquisador no grupo',
          descricao: `O pesquisador ${dados.nome} passou a integrar o grupo.`,
          dados: { pesquisador_id: pesquisadorId }
        });
        
        resultado = { pessoaId: pesquisadorId, tipo: 'pesquisador' };
        break;
      }
      
      case 'NOVO_ESTUDANTE': {
        logger.info(`Aprovando estudante: ${dados.nome}`);
        const estudanteId = await AprovarNotificacao(dados, 'estudante');
        
        await criarComunicado({
          tipo: 'estudante',
          titulo: 'Novo estudante no grupo',
          descricao: `O estudante ${dados.nome} foi aprovado.`,
          dados: { estudante_id: estudanteId }
        });
        
        resultado = { pessoaId: estudanteId, tipo: 'estudante' };
        break;
      }
      
      case 'NOVA_LINHA': {
        logger.info(`Aprovando linha isolada: ${dados.nome || dados.linha_pesquisa}`);
        const linhaId = await AprovarNotificacaoLinha(id);
        
        await criarComunicado({
          tipo: 'linha',
          titulo: 'Nova linha de pesquisa',
          descricao: `A linha "${dados.nome || dados.linha_pesquisa}" foi aprovada.`,
          dados: { linha_pesquisa_id: linhaId }
        });
        
        resultado = { linhaId, tipo: 'linha' };
        break;
      }
      
      default:
        logger.error(`Tipo de notificação não suportado: ${notificacao.tipo}`);
        return res.status(400).json({ error: 'Tipo de notificação não suportado' });
    }
    
    // Atualiza status da notificação
    await db.query(
      `UPDATE notificacoes_scraping 
       SET status = 'aprovado', avaliado_em = NOW() 
       WHERE id = ?`,
      [id]
    );
    
    logger.success(`Notificação ${id} aprovada com sucesso`, resultado);
    
    res.json({ 
      success: true, 
      message: 'Notificação aprovada com sucesso',
      ...resultado
    });
    
  } catch (error) {
    logger.error('Erro ao aprovar notificação', error);
    res.status(500).json({ 
      error: 'Erro ao aprovar notificação', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;