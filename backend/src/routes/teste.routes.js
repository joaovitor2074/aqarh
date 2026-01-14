// routes/teste.router.js
import { Router } from 'express';
import { buscarDadosCompletosPorNome } from '../services/arquivoBruto.service.js';

const router = Router();

// Rota para testar busca no arquivo bruto
router.get('/teste/buscar/:nome', async (req, res) => {
  try {
    const { nome } = req.params;
    const { tipo = 'pesquisador' } = req.query;
    
    const resultado = await buscarDadosCompletosPorNome(nome, tipo);
    
    if (!resultado) {
      return res.status(404).json({ 
        success: false, 
        message: `Pessoa "${nome}" não encontrada no arquivo bruto (${tipo})` 
      });
    }
    
    res.json({
      success: true,
      encontrado: true,
      pessoa: {
        nome: resultado.nome,
        espelhoUrl: resultado.espelhoUrl,
        totalLinhas: resultado.linhas_pesquisa?.length || 0
      },
      linhas: resultado.linhas_pesquisa || []
    });
    
  } catch (error) {
    console.error('Erro na busca:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;