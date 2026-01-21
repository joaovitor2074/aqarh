/**
 * =====================================================
 * ROTAS ADMINISTRATIVAS (ADMINJV)
 * =====================================================
 * Responsável por:
 * - Scraping manual
 * - Status do scraping
 * - Notificações de scraping
 * - Aprovação administrativa
 */

import { Router } from "express";

/**
 * =====================================================
 * CONTROLLERS
 * =====================================================
 */
import { runScrape } from "../controllers/scrape.controller.js";
import { scrapeStatus } from "../controllers/scrapeStatus.controller.js";
import {
  listarNotificacoes,
  AprovarNotificacao,
  AprovarNotificacaoLinha,
} from "../controllers/notificacoes.controller.js";

/**
 * =====================================================
 * SERVICES
 * =====================================================
 */
import { criarComunicado } from "../services/comunicados.service.js";
import { logger } from "../services/log.service.js";

/**
 * =====================================================
 * CONFIGURAÇÕES
 * =====================================================
 */
import { db } from "../config/db.js";

const router = Router();

/**
 * =====================================================
 * SCRAPING – EXECUÇÃO MANUAL
 * =====================================================
 * Dispara o scraping completo via painel admin
 */
router.post("/scrape/run", (req, res) => runScrape(req, res));

/**
 * =====================================================
 * SCRAPING – STATUS
 * =====================================================
 * Retorna se o scraping está rodando, parado ou com erro
 */
router.get("/scrape/status", scrapeStatus);

/**
 * =====================================================
 * SCRAPING – LISTAR NOTIFICAÇÕES
 * =====================================================
 * Exibe notificações pendentes de aprovação
 */
router.get("/scrape/notificacoes", listarNotificacoes);

/**
 * =====================================================
 * SCRAPING – LIMPAR CACHE (DEV)
 * =====================================================
 * Remove arquivos brutos salvos localmente
 * Usado apenas em desenvolvimento
 */
router.post("/scrape/limpar-cache", async (req, res) => {
  try {
    const modulo = await import("../services/arquivoBruto.service.js");
    await modulo.limparCache();

    res.json({
      success: true,
      message: "Cache limpo com sucesso",
    });
  } catch (error) {
    res.status(500).json({
      error: "Erro ao limpar cache",
    });
  }
});

/**
 * =====================================================
 * NOTIFICAÇÕES – APROVAÇÃO ADMINISTRATIVA
 * =====================================================
 * Aprova:
 * - Pesquisadores
 * - Estudantes
 * - Linhas de pesquisa
 */
router.post("/scrape/notificacao/aprovar/:id", async (req, res) => {
  try {
    const { id } = req.params;

    logger.info(`Iniciando aprovação da notificação ${id}`);

    /**
     * Busca notificação no banco
     */
    const [[notificacao]] = await db.query(
      "SELECT tipo, dados FROM notificacoes_scraping WHERE id = ?",
      [id]
    );

    if (!notificacao) {
      logger.warn(`Notificação ${id} não encontrada`);
      return res.status(404).json({
        error: "Notificação não encontrada",
      });
    }

    /**
     * Normaliza os dados (JSON ou objeto)
     */
    const dados =
      typeof notificacao.dados === "string"
        ? JSON.parse(notificacao.dados)
        : notificacao.dados;

    let resultado;

    /**
     * =====================================================
     * PROCESSAMENTO POR TIPO DE NOTIFICAÇÃO
     * =====================================================
     */
    switch (notificacao.tipo) {
      case "NOVO_PESQUISADOR": {
        logger.info(`Aprovando pesquisador: ${dados.nome}`);

        const pesquisadorId = await AprovarNotificacao(dados, "pesquisador");

        await criarComunicado({
          tipo: "pesquisador",
          titulo: "Novo pesquisador no grupo",
          descricao: `O pesquisador ${dados.nome} passou a integrar o grupo.`,
          dados: { pesquisador_id: pesquisadorId },
        });

        resultado = { pessoaId: pesquisadorId, tipo: "pesquisador" };
        break;
      }

      case "NOVO_ESTUDANTE": {
        logger.info(`Aprovando estudante: ${dados.nome}`);

        const estudanteId = await AprovarNotificacao(dados, "estudante");

        await criarComunicado({
          tipo: "estudante",
          titulo: "Novo estudante no grupo",
          descricao: `O estudante ${dados.nome} foi aprovado.`,
          dados: { estudante_id: estudanteId },
        });

        resultado = { pessoaId: estudanteId, tipo: "estudante" };
        break;
      }

      case "NOVA_LINHA": {
        logger.info(
          `Aprovando linha: ${dados.nome || dados.linha_pesquisa}`
        );

        const linhaId = await AprovarNotificacaoLinha(id);

        await criarComunicado({
          tipo: "linha",
          titulo: "Nova linha de pesquisa",
          descricao: `A linha "${
            dados.nome || dados.linha_pesquisa
          }" foi aprovada.`,
          dados: { linha_pesquisa_id: linhaId },
        });

        resultado = { linhaId, tipo: "linha" };
        break;
      }

      default:
        logger.error(
          `Tipo de notificação não suportado: ${notificacao.tipo}`
        );
        return res.status(400).json({
          error: "Tipo de notificação não suportado",
        });
    }

    /**
     * =====================================================
     * ATUALIZA STATUS DA NOTIFICAÇÃO
     * =====================================================
     */
    await db.query(
      `
      UPDATE notificacoes_scraping
      SET status = 'aprovado', avaliado_em = NOW()
      WHERE id = ?
    `,
      [id]
    );

    logger.success(`Notificação ${id} aprovada com sucesso`, resultado);

    res.json({
      success: true,
      message: "Notificação aprovada com sucesso",
      ...resultado,
    });
  } catch (error) {
    logger.error("Erro ao aprovar notificação", error);

    res.status(500).json({
      error: "Erro ao aprovar notificação",
      details: error.message,
      stack:
        process.env.NODE_ENV === "development"
          ? error.stack
          : undefined,
    });
  }
});

/**
 * =====================================================
 * EXPORTAÇÃO DO ROUTER
 * =====================================================
 */
export default router;
