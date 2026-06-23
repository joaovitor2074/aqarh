import { db } from "../config/db.js";
import { getQuantidadeLinhas } from "../services/getquantidadeLinhas.service.js";
import {
  ensurePesquisaRelacionamentosSchema,
  getTableColumns,
} from "../services/pesquisadoresSchema.service.js";

function formatLinhasPublicas(rows) {
  return rows.map((row) => ({
    ...row,
    total_pesquisadores: Number(row.total_pesquisadores || 0),
    pesquisadores_lista: row.pesquisadores_lista
      ? row.pesquisadores_lista.split("||").filter(Boolean)
      : [],
  }));
}

async function listarLinhasPublicasBasicas() {
  const columns = await getTableColumns("linhas_pesquisa");
  const availableColumns = ["id", "nome", "grupo", "ativo"].filter((column) =>
    columns.has(column)
  );
  const selectedColumns = availableColumns.length
    ? availableColumns.map((column) => `lp.${column}`).join(", ")
    : "lp.*";
  const where = columns.has("ativo") ? "WHERE lp.ativo = 1" : "";
  const orderBy = columns.has("nome")
    ? "ORDER BY lp.nome ASC"
    : columns.has("id")
      ? "ORDER BY lp.id ASC"
      : "";

  const [rows] = await db.query(`
    SELECT
      ${selectedColumns},
      0 AS total_pesquisadores,
      NULL AS pesquisadores_lista
    FROM linhas_pesquisa lp
    ${where}
    ${orderBy}
  `);

  return rows;
}

export async function quantLinhas(req, res) {
  try {
    const total = await getQuantidadeLinhas();
    return res.json({ total });
  } catch (err) {
    return res.status(500).json({ message: "Erro interno" });
  }
}
export async function listarLinhasPesquisa(req, res) {
  try {
    await ensurePesquisaRelacionamentosSchema();

    const [rows] = await db.query(`
      SELECT 
  lp.id,
  lp.nome,
  lp.grupo,
  lp.ativo,

  COALESCE(
    GROUP_CONCAT(
      CASE 
        WHEN p.ativo = 1 THEN p.nome
      END
      SEPARATOR ', '
    ),
    'Nenhum pesquisador relacionado'
  ) AS pesquisadores

FROM linhas_pesquisa lp

LEFT JOIN pesquisador_linha_pesquisa plp
  ON plp.linha_pesquisa_id = lp.id

LEFT JOIN pesquisadores p
  ON p.id = plp.pesquisador_id

GROUP BY lp.id
ORDER BY lp.nome ASC;

    `);

    res.json(rows);
  } catch (error) {
    console.error("Erro ao listar linhas de pesquisa:", error);
    res.status(500).json({ message: "Erro ao listar linhas de pesquisa." });
  }
}

export async function listarLinhasPesquisaPublicas(req, res) {
  try {
    try {
      await ensurePesquisaRelacionamentosSchema();
    } catch (schemaError) {
      console.warn("Nao foi possivel garantir schema de linhas:", schemaError.message);
    }

    try {
      const [rows] = await db.query(`
        SELECT
          lp.id,
          lp.nome,
          lp.grupo,
          lp.ativo,
          COUNT(DISTINCT CASE WHEN p.ativo = 1 THEN p.id END) AS total_pesquisadores,
          GROUP_CONCAT(
            DISTINCT CASE
              WHEN p.ativo = 1 THEN p.nome
            END
            ORDER BY p.nome ASC
            SEPARATOR '||'
          ) AS pesquisadores_lista
        FROM linhas_pesquisa lp
        LEFT JOIN pesquisador_linha_pesquisa plp
          ON plp.linha_pesquisa_id = lp.id
        LEFT JOIN pesquisadores p
          ON p.id = plp.pesquisador_id
        WHERE lp.ativo = 1
        GROUP BY lp.id
        ORDER BY lp.nome ASC
      `);

      return res.json(formatLinhasPublicas(rows));
    } catch (queryError) {
      console.warn("Fallback para linhas publicas basicas:", queryError.message);
      const rows = await listarLinhasPublicasBasicas();
      return res.json(formatLinhasPublicas(rows));
    }
  } catch (error) {
    console.error("Erro ao listar linhas publicas:", error);
    res.status(500).json({ message: "Erro ao listar linhas de pesquisa." });
  }
}


export async function ultimasLinha(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM linhas_pesquisa
      ORDER BY created_at DESC
      LIMIT 3
    `);

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao buscar últimas linhas:", error);
    return res.status(500).json({
      message: "Erro ao buscar as últimas linhas de pesquisa"
    });
  }
}


