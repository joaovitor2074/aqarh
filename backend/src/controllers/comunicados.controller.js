import { db } from "../config/db.js";

export async function MostrarComunicados(req, res) {
  try {
    const { status, tipo } = req.query;

    // filtros dinâmicos
    const filtros = [];
    const valores = [];

    if (status) {
      filtros.push("status = ?");
      valores.push(status);
    }

    if (tipo) {
      filtros.push("tipo = ?");
      valores.push(tipo);
    }

    const whereClause =
      filtros.length > 0 ? `WHERE ${filtros.join(" AND ")}` : "";

    const [rows] = await db.query(
      `
      SELECT 
        id,
        tipo,
        titulo,
        descricao,
        imagem,
        status,
        criado_em
      FROM comunicados
      ${whereClause}
      ORDER BY criado_em DESC
      `,
      valores
    );

    return res.status(200).json({
      total: rows.length,
      comunicados: rows
    });
  } catch (error) {
    console.error("Erro ao listar comunicados:", error);
    return res.status(500).json({
      error: "Erro interno ao listar comunicados"
    });
  }
}


export async function AtivarComunicado(req, res) {
  try {
    const { id } = req.params;

    // 1️⃣ Verifica se o comunicado existe e qual o status atual
    const [rows] = await db.query(
      `
      SELECT status 
      FROM comunicados 
      WHERE id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Comunicado não encontrado"
      });
    }

    const statusAtual = rows[0].status;

    // 2️⃣ Valida regra de negócio
    if (statusAtual !== "rascunho") {
      return res.status(400).json({
        error: "Apenas comunicados em rascunho podem ser ativados"
      });
    }

    // 3️⃣ Atualiza status para ativo
    await db.query(
      `
      UPDATE comunicados
      SET status = 'ativo'
      WHERE id = ?
      `,
      [id]
    );

    return res.status(200).json({
      message: "Comunicado ativado com sucesso"
    });
  } catch (error) {
    console.error("Erro ao ativar comunicado:", error);
    return res.status(500).json({
      error: "Erro interno ao ativar comunicado"
    });
  }
}

export async function ArquivarComunicado(req, res) {
  console.log("📦 CHEGOU NO CONTROLLER ARQUIVAR", req.params);

  try {
    const { id } = req.params;

    // 1️⃣ Verifica se o comunicado existe
    const [rows] = await db.query(
      `
      SELECT status 
      FROM comunicados 
      WHERE id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Comunicado não encontrado"
      });
    }

    const statusAtual = rows[0].status;

    // 2️⃣ Regra de negócio
    if (statusAtual !== "ativo") {
      return res.status(400).json({
        error: "Apenas comunicados ativos podem ser arquivados"
      });
    }

    // 3️⃣ Atualiza para arquivado
    await db.query(
      `
      UPDATE comunicados
      SET status = 'arquivado'
      WHERE id = ?
      `,
      [id]
    );

    return res.status(200).json({
      message: "Comunicado arquivado com sucesso"
    });
  } catch (error) {
    console.error("Erro ao arquivar comunicado:", error);
    return res.status(500).json({
      error: "Erro interno ao arquivar comunicado"
    });
  }
}

export async function ReativarComunicado(req, res) {
  console.log("♻️ CHEGOU NO CONTROLLER REATIVAR", req.params);

  try {
    const { id } = req.params;

    // 1️⃣ Verifica se existe
    const [rows] = await db.query(
      `
      SELECT status
      FROM comunicados
      WHERE id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Comunicado não encontrado"
      });
    }

    const statusAtual = rows[0].status;

    // 2️⃣ Regra de negócio
    if (statusAtual !== "arquivado") {
      return res.status(400).json({
        error: "Apenas comunicados arquivados podem ser reativados"
      });
    }

    // 3️⃣ Atualiza para ativo
    await db.query(
      `
      UPDATE comunicados
      SET status = 'ativo'
      WHERE id = ?
      `,
      [id]
    );

    return res.status(200).json({
      message: "Comunicado reativado com sucesso"
    });
  } catch (error) {
    console.error("Erro ao reativar comunicado:", error);
    return res.status(500).json({
      error: "Erro interno ao reativar comunicado"
    });
  }
}


