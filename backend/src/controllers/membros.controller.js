import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../config/db.js";
import {
  ensurePesquisaRelacionamentosSchema,
  ensurePesquisadoresSchema,
  getTableColumns,
} from "../services/pesquisadoresSchema.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_PATH = path.join(__dirname, "..", "..", "public");

async function ensureMembrosSchema() {
  await ensurePesquisadoresSchema();
  await ensurePesquisaRelacionamentosSchema();
}

function getImagePath(filename) {
  if (!filename) return null;
  return `/uploads/${filename}`;
}

function getImageUrl(imagePath, req) {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${baseUrl}${cleanPath}`;
}

function withImageUrl(row, req) {
  return {
    ...row,
    dados_lattes: parseJsonValue(row.dados_lattes),
    imagem_url: getImageUrl(row.imagem, req),
  };
}

function parseJsonValue(value) {
  if (!value) return null;
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function deleteLocalImage(imagePath) {
  if (!imagePath || !imagePath.startsWith("/uploads/")) return;

  const fullPath = path.join(PUBLIC_PATH, imagePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

function parseBoolean(value, fallback = true) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;

  return ["1", "true", "sim", "on", "yes"].includes(
    String(value).trim().toLowerCase()
  );
}

async function listarMembrosPublicosBasicos() {
  const columns = await getTableColumns("pesquisadores");
  const publicColumns = [
    "id",
    "nome",
    "email",
    "imagem",
    "espelho_url",
    "lattes_url",
    "id_lattes",
    "ultima_atualizacao_lattes",
    "dados_lattes",
    "orcid",
    "instituicao",
    "cargo",
    "ativo",
    "titulacao_maxima",
    "data_inclusao",
    "tipo_vinculo",
  ].filter((column) => columns.has(column));
  const selectedColumns = publicColumns.length
    ? publicColumns.map((column) => `p.${column}`).join(", ")
    : "p.*";
  const where = columns.has("ativo") ? "WHERE p.ativo = 1" : "";
  const orderBy = columns.has("nome")
    ? "ORDER BY p.nome ASC"
    : columns.has("id")
      ? "ORDER BY p.id ASC"
      : "";

  const [rows] = await db.query(`
    SELECT ${selectedColumns}
    FROM pesquisadores p
    ${where}
    ${orderBy}
  `);

  return rows;
}

export async function quantMembros(req, res) {
  try {
    await ensureMembrosSchema();

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
    await ensureMembrosSchema();

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
        p.imagem,
        p.espelho_url,
        p.lattes_url,
        p.id_lattes,
        p.ultima_atualizacao_lattes,
        p.dados_lattes,
        p.orcid,
        p.instituicao,
        p.cargo,
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

    res.json(rows.map((row) => withImageUrl(row, req)));
  } catch (err) {
    console.error("Erro ao listar membros:", err);
    res.status(500).json({ message: "Erro ao listar membros" });
  }
}

export async function listarMembrosPublicos(req, res) {
  try {
    try {
      await ensureMembrosSchema();
    } catch (schemaError) {
      console.warn("Nao foi possivel garantir schema de membros:", schemaError.message);
    }

    try {
      const [rows] = await db.query(`
        SELECT
          p.id,
          p.nome,
          p.email,
          p.imagem,
          p.espelho_url,
          p.lattes_url,
          p.id_lattes,
          p.ultima_atualizacao_lattes,
          p.dados_lattes,
          p.orcid,
          p.instituicao,
          p.cargo,
          p.ativo,
          p.titulacao_maxima,
          p.data_inclusao,
          p.tipo_vinculo,
          GROUP_CONCAT(DISTINCT lp.nome ORDER BY lp.nome ASC SEPARATOR '||') AS linhas_pesquisa,
          GROUP_CONCAT(DISTINCT lp.grupo ORDER BY lp.grupo ASC SEPARATOR '||') AS grupos_pesquisa
        FROM pesquisadores p
        LEFT JOIN pesquisador_linha_pesquisa plp
          ON p.id = plp.pesquisador_id
        LEFT JOIN linhas_pesquisa lp
          ON lp.id = plp.linha_pesquisa_id AND lp.ativo = 1
        WHERE p.ativo = 1
        GROUP BY p.id
        ORDER BY p.nome ASC
      `);

      return res.json(
        rows.map((row) => ({
          ...withImageUrl(row, req),
          linhas_pesquisa: row.linhas_pesquisa
            ? row.linhas_pesquisa.split("||").filter(Boolean)
            : [],
          grupos_pesquisa: row.grupos_pesquisa
            ? row.grupos_pesquisa.split("||").filter(Boolean)
            : [],
        }))
      );
    } catch (queryError) {
      console.warn("Fallback para membros publicos basicos:", queryError.message);
      const rows = await listarMembrosPublicosBasicos();

      return res.json(
        rows.map((row) => ({
          ...withImageUrl(row, req),
          linhas_pesquisa: [],
          grupos_pesquisa: [],
        }))
      );
    }
  } catch (err) {
    console.error("Erro ao listar membros publicos:", err);
    res.status(500).json({ message: "Erro ao listar membros" });
  }
}

export async function criarMembro(req, res) {
  try {
    await ensureMembrosSchema();

    const {
      nome,
      titulacao_maxima,
      data_inclusao,
      email,
      lattes_url,
      id_lattes,
      ultima_atualizacao_lattes,
      orcid,
      instituicao,
      cargo,
      tipo_vinculo = "pesquisador",
      ativo = true,
      linha_pesquisa_id,
    } = req.body;
    const imagem = getImagePath(req.file?.filename);

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
        imagem,
        lattes_url,
        id_lattes,
        ultima_atualizacao_lattes,
        orcid,
        instituicao,
        cargo,
        tipo_vinculo,
        ativo
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        nome.trim(),
        titulacao_maxima?.trim() || null,
        data_inclusao || null,
        email || null,
        imagem,
        lattes_url || null,
        id_lattes || null,
        ultima_atualizacao_lattes || null,
        orcid || null,
        instituicao || null,
        cargo || null,
        tipo_vinculo || "pesquisador",
        parseBoolean(ativo, true) ? 1 : 0,
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

export async function atualizarMembro(req, res) {
  try {
    await ensureMembrosSchema();

    const { id } = req.params;
    const {
      nome,
      titulacao_maxima,
      data_inclusao,
      email,
      lattes_url,
      id_lattes,
      ultima_atualizacao_lattes,
      orcid,
      instituicao,
      cargo,
      tipo_vinculo = "pesquisador",
      ativo = true,
      linha_pesquisa_id,
    } = req.body;

    if (!nome) {
      return res.status(400).json({ message: "Nome e obrigatorio" });
    }

    const [[membroAtual]] = await db.query(
      "SELECT imagem FROM pesquisadores WHERE id = ?",
      [id]
    );

    if (!membroAtual) {
      return res.status(404).json({ message: "Membro nao encontrado" });
    }

    const imagemFinal = req.file?.filename
      ? getImagePath(req.file.filename)
      : membroAtual.imagem || null;

    await db.query(
      `
      UPDATE pesquisadores
      SET nome = ?,
          titulacao_maxima = ?,
          data_inclusao = ?,
          email = ?,
          imagem = ?,
          lattes_url = ?,
          id_lattes = ?,
          ultima_atualizacao_lattes = ?,
          orcid = ?,
          instituicao = ?,
          cargo = ?,
          tipo_vinculo = ?,
          ativo = ?
      WHERE id = ?
      `,
      [
        nome,
        titulacao_maxima || null,
        data_inclusao || null,
        email || null,
        imagemFinal,
        lattes_url || null,
        id_lattes || null,
        ultima_atualizacao_lattes || null,
        orcid || null,
        instituicao || null,
        cargo || null,
        tipo_vinculo || "pesquisador",
        parseBoolean(ativo, true) ? 1 : 0,
        id,
      ]
    );

    if (linha_pesquisa_id !== undefined) {
      await db.query(
        "DELETE FROM pesquisador_linha_pesquisa WHERE pesquisador_id = ?",
        [id]
      );

      if (linha_pesquisa_id) {
        await db.query(
          `
          INSERT IGNORE INTO pesquisador_linha_pesquisa
            (pesquisador_id, linha_pesquisa_id)
          VALUES (?, ?)
          `,
          [id, linha_pesquisa_id]
        );
      }
    }

    if (req.file?.filename && membroAtual.imagem && membroAtual.imagem !== imagemFinal) {
      deleteLocalImage(membroAtual.imagem);
    }

    res.json({ message: "Membro atualizado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar membro" });
  }
}

export async function alterarStatusMembro(req, res) {
  try {
    await ensureMembrosSchema();

    const { id } = req.params;
    const { ativo } = req.body;

    await db.query("UPDATE pesquisadores SET ativo = ? WHERE id = ?", [
      parseBoolean(ativo, true) ? 1 : 0,
      id,
    ]);

    res.json({ message: "Status do membro atualizado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar status do membro" });
  }
}

export async function deletarMembro(req, res) {
  try {
    await ensureMembrosSchema();

    const { id } = req.params;
    const [[membro]] = await db.query("SELECT imagem FROM pesquisadores WHERE id = ?", [id]);

    if (!membro) {
      return res.status(404).json({ message: "Membro nao encontrado" });
    }

    await db.query("DELETE FROM pesquisador_linha_pesquisa WHERE pesquisador_id = ?", [id]);
    await db.query("DELETE FROM pesquisadores WHERE id = ?", [id]);

    deleteLocalImage(membro.imagem);

    res.json({ message: "Membro excluido com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao excluir membro" });
  }
}
