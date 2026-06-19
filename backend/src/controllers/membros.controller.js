import { db } from "../config/db.js";

export async function quantMembros(req, res) {
  try {
    const [[stats]] = await db.query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN ativo = 1 THEN 1 ELSE 0 END) AS ativos,
        SUM(CASE WHEN tipo_vinculo = 'pesquisador' THEN 1 ELSE 0 END) AS pesquisadores,
        SUM(CASE WHEN tipo_vinculo = 'estudante' THEN 1 ELSE 0 END) AS estudantes,
        SUM(CASE WHEN tipo_vinculo = 'colaborador' THEN 1 ELSE 0 END) AS colaboradores
      FROM pesquisadores
    `);

    return res.json({
      total: Number(stats.total || 0),
      ativos: Number(stats.ativos || 0),
      pesquisadores: Number(stats.pesquisadores || 0),
      estudantes: Number(stats.estudantes || 0),
      colaboradores: Number(stats.colaboradores || 0),
    });
  } catch (err) {
    console.error("Erro ao buscar estatisticas de membros:", err);
    return res.status(500).json({ message: "Erro interno" });
  }
}

export async function listarMembros(req, res) {
  try {
    const filtros = [];
    const params = [];

    if (req.query.ativo === "true" || req.query.ativo === "false") {
      filtros.push("p.ativo = ?");
      params.push(req.query.ativo === "true" ? 1 : 0);
    }

    if (req.query.tipo_vinculo) {
      filtros.push("p.tipo_vinculo = ?");
      params.push(req.query.tipo_vinculo);
    }

    if (req.query.titulacao_maxima) {
      filtros.push("p.titulacao_maxima = ?");
      params.push(req.query.titulacao_maxima);
    }

    const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";

    const [rows] = await db.query(
      `
      SELECT
        p.id,
        p.nome,
        p.email,
        p.ativo,
        p.titulacao_maxima,
        p.data_inclusao,
        p.tipo_vinculo,
        MIN(lp.id) AS linha_pesquisa_id,
        GROUP_CONCAT(lp.nome SEPARATOR ', ') AS linhas_pesquisa
      FROM pesquisadores p
      LEFT JOIN pesquisador_linha_pesquisa plp
        ON p.id = plp.pesquisador_id
      LEFT JOIN linhas_pesquisa lp
        ON lp.id = plp.linha_pesquisa_id
      ${where}
      GROUP BY p.id
      ORDER BY p.nome ASC
      `,
      params
    );

    res.json(rows);
  } catch (err) {
    console.error("Erro ao listar membros:", err);
    res.status(500).json({ message: "Erro ao listar membros" });
  }
}

export async function criarMembro(req, res) {
  try {
    const {
      nome,
      titulacao_maxima,
      data_inclusao,
      email,
      tipo_vinculo = "pesquisador",
      ativo = true,
      linha_pesquisa_id,
    } = req.body;

    if (!nome) {
      return res.status(400).json({ message: "Nome e obrigatorio." });
    }

    const [result] = await db.query(
      `
      INSERT INTO pesquisadores (
        nome,
        titulacao_maxima,
        data_inclusao,
        email,
        tipo_vinculo,
        ativo
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        nome.trim(),
        titulacao_maxima?.trim() || null,
        data_inclusao || null,
        email || null,
        tipo_vinculo || "pesquisador",
        ativo ? 1 : 0,
      ]
    );

    if (linha_pesquisa_id) {
      await db.query(
        `
        INSERT IGNORE INTO pesquisador_linha_pesquisa
          (pesquisador_id, linha_pesquisa_id)
        VALUES (?, ?)
        `,
        [result.insertId, linha_pesquisa_id]
      );
    }

    res.status(201).json({ message: "Membro cadastrado com sucesso!" });
  } catch (error) {
    console.error("Erro ao criar membro:", error);
    res.status(500).json({ message: "Erro ao criar membro." });
  }
}
