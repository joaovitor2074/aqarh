import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_PATH = path.join(__dirname, "..", "..", "public");

const STATUS_LABELS = {
  planejado: "Planejado",
  planejamento: "Planejado",
  "em andamento": "Em andamento",
  andamento: "Em andamento",
  ativo: "Em andamento",
  finalizado: "Finalizado",
  concluido: "Finalizado",
};

let schemaReady = false;

export async function ensureProjetosSchema() {
  if (schemaReady) return;

  await db.query(`
    CREATE TABLE IF NOT EXISTS projetos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      titulo VARCHAR(255) NOT NULL,
      descricao TEXT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'Planejado',
      ano INT NULL,
      area VARCHAR(150) NULL,
      linha_pesquisa_id INT NULL,
      coordenador_id INT NULL,
      orcamento VARCHAR(100) NULL,
      mostrar_orcamento_publico TINYINT(1) NOT NULL DEFAULT 0,
      imagem VARCHAR(255) NULL,
      link_externo VARCHAR(500) NULL,
      resultados TEXT NULL,
      ativo TINYINT(1) NOT NULL DEFAULT 1,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS parceiros (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      tipo VARCHAR(100) NULL,
      logo VARCHAR(255) NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_parceiro_nome (nome)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS projeto_estudantes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      projeto_id INT NOT NULL,
      estudante_id INT NOT NULL,
      UNIQUE KEY uq_projeto_estudante (projeto_id, estudante_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS projeto_parceiros (
      id INT AUTO_INCREMENT PRIMARY KEY,
      projeto_id INT NOT NULL,
      parceiro_id INT NOT NULL,
      UNIQUE KEY uq_projeto_parceiro (projeto_id, parceiro_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  schemaReady = true;
}

function normalizeKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function normalizeStatus(value, fallback = "Planejado") {
  const key = normalizeKey(value);
  return STATUS_LABELS[key] || fallback;
}

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;

  const normalized = String(value).trim().toLowerCase();
  return ["1", "true", "sim", "on", "yes"].includes(normalized);
}

function optionalId(value) {
  if (value === undefined || value === null || value === "") return null;
  const id = Number.parseInt(value, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function optionalYear(value) {
  if (value === undefined || value === null || value === "") return null;
  const year = Number.parseInt(value, 10);
  return Number.isFinite(year) ? year : null;
}

function cleanText(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
}

function parseArrayField(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return [];

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return trimmed.split(",");
      }
    }

    return trimmed.split(",");
  }

  return [value];
}

function parseIdList(value) {
  return parseArrayField(value)
    .map((item) => optionalId(typeof item === "object" ? item?.id : item))
    .filter(Boolean);
}

function parseParceiros(value) {
  const items = parseArrayField(value);
  const byName = new Map();

  items.forEach((item) => {
    const parceiro =
      typeof item === "object" && item !== null
        ? {
            nome: cleanText(item.nome || item.name),
            tipo: cleanText(item.tipo || item.type),
            logo: cleanText(item.logo),
          }
        : {
            nome: cleanText(item),
            tipo: null,
            logo: null,
          };

    if (!parceiro.nome) return;
    const key = normalizeKey(parceiro.nome);
    if (!byName.has(key)) byName.set(key, parceiro);
  });

  return Array.from(byName.values());
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

function deleteLocalImage(imagePath) {
  if (!imagePath || !imagePath.startsWith("/uploads/")) return;

  const fullPath = path.join(PUBLIC_PATH, imagePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

function parsePeopleList(value) {
  if (!value) return [];

  return String(value)
    .split("||")
    .map((item) => {
      const [id, nome] = item.split("::");
      return {
        id: Number(id),
        nome,
      };
    })
    .filter((item) => item.id && item.nome);
}

function parsePartnersList(value) {
  if (!value) return [];

  return String(value)
    .split("||")
    .map((item) => {
      const [id, nome, tipo, logo] = item.split("::");
      return {
        id: Number(id),
        nome,
        tipo: tipo || null,
        logo: logo || null,
      };
    })
    .filter((item) => item.id && item.nome);
}

function formatProjeto(row, req) {
  const estudantes = parsePeopleList(row.estudantes_lista);
  const parceiros = parsePartnersList(row.parceiros_lista);

  return {
    id: row.id,
    titulo: row.titulo,
    descricao: row.descricao,
    status: row.status,
    ano: row.ano,
    area: row.area,
    linha_pesquisa_id: row.linha_pesquisa_id,
    linha_nome: row.linha_nome,
    linha_grupo: row.linha_grupo,
    coordenador_id: row.coordenador_id,
    coordenador_nome: row.coordenador_nome,
    orcamento: row.orcamento,
    mostrar_orcamento_publico: Boolean(row.mostrar_orcamento_publico),
    imagem: row.imagem,
    imagem_url: getImageUrl(row.imagem, req),
    link_externo: row.link_externo,
    resultados: row.resultados,
    ativo: Boolean(row.ativo),
    criado_em: row.criado_em,
    atualizado_em: row.atualizado_em,
    total_estudantes: Number(row.total_estudantes || estudantes.length || 0),
    total_parceiros: Number(row.total_parceiros || parceiros.length || 0),
    estudantes,
    parceiros,
  };
}

function getSelectProjetosSql(whereClause = "") {
  return `
    SELECT
      p.*,
      coord.nome AS coordenador_nome,
      lp.nome AS linha_nome,
      lp.grupo AS linha_grupo,
      (
        SELECT COUNT(*)
        FROM projeto_estudantes pe
        WHERE pe.projeto_id = p.id
      ) AS total_estudantes,
      (
        SELECT GROUP_CONCAT(CONCAT(est.id, '::', est.nome) ORDER BY est.nome ASC SEPARATOR '||')
        FROM projeto_estudantes pe
        INNER JOIN pesquisadores est ON est.id = pe.estudante_id
        WHERE pe.projeto_id = p.id
      ) AS estudantes_lista,
      (
        SELECT COUNT(*)
        FROM projeto_parceiros pp
        WHERE pp.projeto_id = p.id
      ) AS total_parceiros,
      (
        SELECT GROUP_CONCAT(
          CONCAT(par.id, '::', par.nome, '::', COALESCE(par.tipo, ''), '::', COALESCE(par.logo, ''))
          ORDER BY par.nome ASC
          SEPARATOR '||'
        )
        FROM projeto_parceiros pp
        INNER JOIN parceiros par ON par.id = pp.parceiro_id
        WHERE pp.projeto_id = p.id
      ) AS parceiros_lista
    FROM projetos p
    LEFT JOIN pesquisadores coord ON coord.id = p.coordenador_id
    LEFT JOIN linhas_pesquisa lp ON lp.id = p.linha_pesquisa_id
    ${whereClause}
  `;
}

async function fetchProjetos(req, options = {}) {
  await ensureProjetosSchema();

  const where = [];
  const params = [];

  if (!options.includeInactive) {
    where.push("p.ativo = 1");
  }

  if (options.id) {
    where.push("p.id = ?");
    params.push(options.id);
  }

  const { status, area, ano, linha_pesquisa_id } = options.filters || {};

  if (status && status !== "todos") {
    where.push("p.status = ?");
    params.push(normalizeStatus(status, status));
  }

  if (area && area !== "todos") {
    where.push("p.area = ?");
    params.push(area);
  }

  if (ano && ano !== "todos") {
    where.push("p.ano = ?");
    params.push(ano);
  }

  if (linha_pesquisa_id && linha_pesquisa_id !== "todos") {
    where.push("p.linha_pesquisa_id = ?");
    params.push(linha_pesquisa_id);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [rows] = await db.query(
    `
    ${getSelectProjetosSql(whereClause)}
    ORDER BY COALESCE(p.ano, 0) DESC, p.criado_em DESC
    `,
    params
  );

  return rows.map((row) => formatProjeto(row, req));
}

function buildProjetoPayload(body, file, current = {}) {
  const titulo = cleanText(body.titulo ?? current.titulo);

  return {
    titulo,
    descricao: cleanText(body.descricao ?? current.descricao),
    status: normalizeStatus(body.status ?? current.status, current.status || "Planejado"),
    ano: optionalYear(body.ano ?? current.ano),
    area: cleanText(body.area ?? current.area),
    linha_pesquisa_id: optionalId(body.linha_pesquisa_id ?? current.linha_pesquisa_id),
    coordenador_id: optionalId(body.coordenador_id ?? current.coordenador_id),
    orcamento: cleanText(body.orcamento ?? current.orcamento),
    mostrar_orcamento_publico: parseBoolean(
      body.mostrar_orcamento_publico,
      Boolean(current.mostrar_orcamento_publico)
    ),
    imagem: file?.filename ? getImagePath(file.filename) : current.imagem || null,
    link_externo: cleanText(body.link_externo ?? current.link_externo),
    resultados: cleanText(body.resultados ?? current.resultados),
    ativo: parseBoolean(body.ativo, current.ativo !== undefined ? Boolean(current.ativo) : true),
  };
}

async function syncEstudantes(connection, projetoId, estudanteIds) {
  await connection.query("DELETE FROM projeto_estudantes WHERE projeto_id = ?", [projetoId]);

  for (const estudanteId of estudanteIds) {
    await connection.query(
      `
      INSERT IGNORE INTO projeto_estudantes (projeto_id, estudante_id)
      VALUES (?, ?)
      `,
      [projetoId, estudanteId]
    );
  }
}

async function syncParceiros(connection, projetoId, parceiros) {
  await connection.query("DELETE FROM projeto_parceiros WHERE projeto_id = ?", [projetoId]);

  for (const parceiro of parceiros) {
    await connection.query(
      `
      INSERT INTO parceiros (nome, tipo, logo)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        tipo = COALESCE(VALUES(tipo), tipo),
        logo = COALESCE(VALUES(logo), logo)
      `,
      [parceiro.nome, parceiro.tipo, parceiro.logo]
    );

    const [[row]] = await connection.query("SELECT id FROM parceiros WHERE nome = ?", [
      parceiro.nome,
    ]);

    if (row?.id) {
      await connection.query(
        `
        INSERT IGNORE INTO projeto_parceiros (projeto_id, parceiro_id)
        VALUES (?, ?)
        `,
        [projetoId, row.id]
      );
    }
  }
}

export async function listarProjetosPublicos(req, res) {
  try {
    const projetos = await fetchProjetos(req, {
      includeInactive: false,
      filters: req.query,
    });

    return res.json({
      total: projetos.length,
      projetos,
    });
  } catch (error) {
    console.error("Erro ao listar projetos publicos:", error);
    return res.status(500).json({ message: "Erro ao listar projetos." });
  }
}

export async function listarProjetosAdmin(req, res) {
  try {
    const projetos = await fetchProjetos(req, {
      includeInactive: true,
      filters: req.query,
    });

    return res.json({
      total: projetos.length,
      projetos,
    });
  } catch (error) {
    console.error("Erro ao listar projetos admin:", error);
    return res.status(500).json({ message: "Erro ao listar projetos." });
  }
}

export async function detalharProjetoPublico(req, res) {
  try {
    const [projeto] = await fetchProjetos(req, {
      id: req.params.id,
      includeInactive: false,
    });

    if (!projeto) {
      return res.status(404).json({ message: "Projeto nao encontrado." });
    }

    return res.json(projeto);
  } catch (error) {
    console.error("Erro ao detalhar projeto:", error);
    return res.status(500).json({ message: "Erro ao detalhar projeto." });
  }
}

export async function quantidadeProjetos(req, res) {
  try {
    await ensureProjetosSchema();

    const [[stats]] = await db.query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN ativo = 1 THEN 1 ELSE 0 END) AS ativos,
        SUM(CASE WHEN ativo = 1 AND status = 'Em andamento' THEN 1 ELSE 0 END) AS em_andamento,
        SUM(CASE WHEN ativo = 1 AND status = 'Finalizado' THEN 1 ELSE 0 END) AS finalizados,
        SUM(CASE WHEN ativo = 1 AND status = 'Planejado' THEN 1 ELSE 0 END) AS planejados
      FROM projetos
    `);

    return res.json({
      total: Number(stats.total || 0),
      ativos: Number(stats.ativos || 0),
      em_andamento: Number(stats.em_andamento || 0),
      finalizados: Number(stats.finalizados || 0),
      planejados: Number(stats.planejados || 0),
    });
  } catch (error) {
    console.error("Erro ao buscar quantidade de projetos:", error);
    return res.status(500).json({ message: "Erro ao buscar quantidade de projetos." });
  }
}

export async function criarProjeto(req, res) {
  const connection = await db.getConnection();

  try {
    await ensureProjetosSchema();

    const payload = buildProjetoPayload(req.body, req.file);
    const estudanteIds = parseIdList(req.body.estudante_ids ?? req.body.estudantes);
    const parceiros = parseParceiros(req.body.parceiros);

    if (!payload.titulo) {
      return res.status(400).json({ message: "Titulo e obrigatorio." });
    }

    await connection.beginTransaction();

    const [result] = await connection.query(
      `
      INSERT INTO projetos (
        titulo,
        descricao,
        status,
        ano,
        area,
        linha_pesquisa_id,
        coordenador_id,
        orcamento,
        mostrar_orcamento_publico,
        imagem,
        link_externo,
        resultados,
        ativo
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        payload.titulo,
        payload.descricao,
        payload.status,
        payload.ano,
        payload.area,
        payload.linha_pesquisa_id,
        payload.coordenador_id,
        payload.orcamento,
        payload.mostrar_orcamento_publico ? 1 : 0,
        payload.imagem,
        payload.link_externo,
        payload.resultados,
        payload.ativo ? 1 : 0,
      ]
    );

    await syncEstudantes(connection, result.insertId, estudanteIds);
    await syncParceiros(connection, result.insertId, parceiros);

    await connection.commit();

    const [projeto] = await fetchProjetos(req, {
      id: result.insertId,
      includeInactive: true,
    });

    return res.status(201).json({
      message: "Projeto criado com sucesso.",
      projeto,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Erro ao criar projeto:", error);
    return res.status(500).json({ message: "Erro ao criar projeto." });
  } finally {
    connection.release();
  }
}

export async function atualizarProjeto(req, res) {
  const connection = await db.getConnection();

  try {
    await ensureProjetosSchema();

    const [[current]] = await db.query("SELECT * FROM projetos WHERE id = ?", [req.params.id]);

    if (!current) {
      return res.status(404).json({ message: "Projeto nao encontrado." });
    }

    const payload = buildProjetoPayload(req.body, req.file, current);
    const estudanteIds = parseIdList(req.body.estudante_ids ?? req.body.estudantes);
    const parceiros = parseParceiros(req.body.parceiros);

    if (!payload.titulo) {
      return res.status(400).json({ message: "Titulo e obrigatorio." });
    }

    await connection.beginTransaction();

    await connection.query(
      `
      UPDATE projetos
      SET
        titulo = ?,
        descricao = ?,
        status = ?,
        ano = ?,
        area = ?,
        linha_pesquisa_id = ?,
        coordenador_id = ?,
        orcamento = ?,
        mostrar_orcamento_publico = ?,
        imagem = ?,
        link_externo = ?,
        resultados = ?,
        ativo = ?
      WHERE id = ?
      `,
      [
        payload.titulo,
        payload.descricao,
        payload.status,
        payload.ano,
        payload.area,
        payload.linha_pesquisa_id,
        payload.coordenador_id,
        payload.orcamento,
        payload.mostrar_orcamento_publico ? 1 : 0,
        payload.imagem,
        payload.link_externo,
        payload.resultados,
        payload.ativo ? 1 : 0,
        req.params.id,
      ]
    );

    if ("estudante_ids" in req.body || "estudantes" in req.body) {
      await syncEstudantes(connection, req.params.id, estudanteIds);
    }

    if ("parceiros" in req.body) {
      await syncParceiros(connection, req.params.id, parceiros);
    }

    await connection.commit();

    if (req.file?.filename && current.imagem && current.imagem !== payload.imagem) {
      deleteLocalImage(current.imagem);
    }

    const [projeto] = await fetchProjetos(req, {
      id: req.params.id,
      includeInactive: true,
    });

    return res.json({
      message: "Projeto atualizado com sucesso.",
      projeto,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Erro ao atualizar projeto:", error);
    return res.status(500).json({ message: "Erro ao atualizar projeto." });
  } finally {
    connection.release();
  }
}

export async function alterarVisibilidadeProjeto(req, res) {
  try {
    await ensureProjetosSchema();

    const ativo = parseBoolean(req.body.ativo, true);
    await db.query("UPDATE projetos SET ativo = ? WHERE id = ?", [
      ativo ? 1 : 0,
      req.params.id,
    ]);

    return res.json({
      message: ativo ? "Projeto publicado com sucesso." : "Projeto ocultado com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao alterar visibilidade do projeto:", error);
    return res.status(500).json({ message: "Erro ao alterar visibilidade do projeto." });
  }
}

export async function deletarProjeto(req, res) {
  const connection = await db.getConnection();

  try {
    await ensureProjetosSchema();

    const [[current]] = await db.query("SELECT imagem FROM projetos WHERE id = ?", [req.params.id]);

    if (!current) {
      return res.status(404).json({ message: "Projeto nao encontrado." });
    }

    await connection.beginTransaction();
    await connection.query("DELETE FROM projeto_estudantes WHERE projeto_id = ?", [req.params.id]);
    await connection.query("DELETE FROM projeto_parceiros WHERE projeto_id = ?", [req.params.id]);
    await connection.query("DELETE FROM projetos WHERE id = ?", [req.params.id]);
    await connection.commit();

    deleteLocalImage(current.imagem);

    return res.json({ message: "Projeto excluido com sucesso." });
  } catch (error) {
    await connection.rollback();
    console.error("Erro ao excluir projeto:", error);
    return res.status(500).json({ message: "Erro ao excluir projeto." });
  } finally {
    connection.release();
  }
}
