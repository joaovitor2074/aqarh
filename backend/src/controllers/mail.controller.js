// src/controllers/mail.controller.js

import { db } from "../config/db.js";
import { randomUUID } from "node:crypto";
import {
  enviarEmail,
  enviarEmailEmMassa,
  mensagemErroEmail,
  obterDiagnosticoEmail,
} from "../modules/mail/mail.service.js";

function obterRequestId(req) {
  return req.headers["x-railway-request-id"] || randomUUID();
}

/**
 * POST /api/mail/enviar-em-massa
 *
 * Body:
 * {
 *   assunto: string,
 *   corpo: string,
 *   filtro: "todos" | "pesquisador" | "estudante" | "colaborador",
 *   personalizar: boolean   (opcional, padrão: true)
 * }
 */
export async function enviarEmMassa(req, res) {
  const requestId = obterRequestId(req);

  try {
    const { assunto, corpo, filtro = "todos", personalizar = true } = req.body;

    if (!assunto?.trim()) {
      return res.status(400).json({ message: "O assunto é obrigatório." });
    }
    if (!corpo?.trim()) {
      return res.status(400).json({ message: "O corpo do email é obrigatório." });
    }

    // Buscar destinatários com email cadastrado
    const condicoes = ["email IS NOT NULL", "email != ''", "ativo = 1"];
    const params = [];

    if (filtro !== "todos") {
      condicoes.push("tipo_vinculo = ?");
      params.push(filtro);
    }

    const where = `WHERE ${condicoes.join(" AND ")}`;

    const [destinatarios] = await db.query(
      `SELECT id, nome, email, tipo_vinculo FROM pesquisadores ${where} ORDER BY nome ASC`,
      params
    );

    if (destinatarios.length === 0) {
      return res.status(404).json({
        message: "Nenhum membro com email cadastrado encontrado para os filtros selecionados.",
      });
    }

    const resultados = await enviarEmailEmMassa({
      destinatarios,
      assunto,
      corpo,
      personalizar,
      requestId,
    });

    if (resultados.enviados === 0) {
      return res.status(502).json({
        message:
          resultados.falhas[0]?.erro ||
          "Nenhum email foi enviado. Verifique a configuração do serviço de email.",
        ...resultados,
      });
    }

    return res.json({
      message: `Campanha concluída: ${resultados.enviados} de ${resultados.total} emails enviados.`,
      ...resultados,
    });
  } catch (err) {
    console.error("[MAIL] Erro ao enviar em massa:", {
      requestId,
      code: err?.code,
      message: mensagemErroEmail(err),
    });
    return res.status(500).json({ message: "Erro interno ao enviar emails." });
  }
}

/**
 * POST /api/mail/enviar-individual
 *
 * Body:
 * {
 *   membroId: number,   (opcional — se informado, busca email do banco)
 *   para: string,       (opcional — email direto, se não informar membroId)
 *   nome: string,       (opcional)
 *   assunto: string,
 *   corpo: string
 * }
 */
export async function enviarIndividual(req, res) {
  const requestId = obterRequestId(req);

  try {
    const { membroId, para, nome, assunto, corpo } = req.body;

    if (!assunto?.trim()) {
      return res.status(400).json({ message: "O assunto é obrigatório." });
    }
    if (!corpo?.trim()) {
      return res.status(400).json({ message: "O corpo do email é obrigatório." });
    }

    let emailDestino = para;
    let nomeDestino = nome;

    // Se informou ID, busca os dados do banco
    if (membroId) {
      const [[membro]] = await db.query(
        "SELECT nome, email FROM pesquisadores WHERE id = ?",
        [membroId]
      );

      if (!membro) {
        return res.status(404).json({ message: "Membro não encontrado." });
      }
      if (!membro.email) {
        return res.status(400).json({ message: "Este membro não possui email cadastrado." });
      }

      emailDestino = membro.email;
      nomeDestino = membro.nome;
    }

    if (!emailDestino) {
      return res.status(400).json({ message: "Email de destino é obrigatório." });
    }

    await enviarEmail({
      para: emailDestino,
      assunto,
      corpo,
      nomeDestinatario: nomeDestino,
      requestId,
    });

    return res.json({
      message: `Email enviado com sucesso para ${nomeDestino || emailDestino}.`,
    });
  } catch (err) {
    console.error("[MAIL] Erro ao enviar individual:", {
      requestId,
      code: err?.code,
      providerStatus: err?.responseCode,
      message: mensagemErroEmail(err),
    });
    const status = err?.code === "MAIL_CONFIGURATION_ERROR" ? 503 : 502;
    return res.status(status).json({
      message: mensagemErroEmail(err),
      requestId,
    });
  }
}

export function statusEmail(req, res) {
  return res.json({
    ...obterDiagnosticoEmail(),
    requestId: obterRequestId(req),
  });
}

/**
 * GET /api/mail/destinatarios?filtro=todos
 *
 * Retorna preview da lista de destinatários antes de enviar.
 */
export async function listarDestinatarios(req, res) {
  try {
    const { filtro = "todos" } = req.query;

    const condicoes = ["email IS NOT NULL", "email != ''", "ativo = 1"];
    const params = [];

    if (filtro !== "todos") {
      condicoes.push("tipo_vinculo = ?");
      params.push(filtro);
    }

    const where = `WHERE ${condicoes.join(" AND ")}`;

    const [destinatarios] = await db.query(
      `SELECT id, nome, email, tipo_vinculo FROM pesquisadores ${where} ORDER BY nome ASC`,
      params
    );

    return res.json({
      total: destinatarios.length,
      destinatarios,
    });
  } catch (err) {
    console.error("[MAIL] Erro ao listar destinatários:", err);
    return res.status(500).json({ message: "Erro ao listar destinatários." });
  }
}
