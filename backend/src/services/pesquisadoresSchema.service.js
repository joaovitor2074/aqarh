import { db } from "../config/db.js";

const PESQUISADORES_COLUMNS = {
  email: "VARCHAR(255) NULL",
  ativo: "TINYINT(1) NOT NULL DEFAULT 1",
  titulacao_maxima: "VARCHAR(255) NULL",
  data_inclusao: "DATE NULL",
  tipo_vinculo: "VARCHAR(50) NOT NULL DEFAULT 'pesquisador'",
  imagem: "VARCHAR(255) NULL",
  espelho_url: "VARCHAR(500) NULL",
  lattes_url: "VARCHAR(500) NULL",
  id_lattes: "VARCHAR(64) NULL",
  ultima_atualizacao_lattes: "VARCHAR(120) NULL",
  dados_lattes: "JSON NULL",
  orcid: "VARCHAR(32) NULL",
  instituicao: "VARCHAR(255) NULL",
  cargo: "VARCHAR(255) NULL",
};

const LINHAS_PESQUISA_COLUMNS = {
  nome: "VARCHAR(255) NOT NULL DEFAULT ''",
  grupo: "VARCHAR(255) NULL",
  ativo: "TINYINT(1) NOT NULL DEFAULT 1",
  created_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
};

const PESQUISADOR_LINHA_COLUMNS = {
  pesquisador_id: "INT NULL",
  linha_pesquisa_id: "INT NULL",
};

let schemaPromise = null;
let pesquisaSchemaPromise = null;

async function ensureColumns(tableName, columns) {
  const columnNames = Object.keys(columns);
  if (columnNames.length === 0) return;

  const placeholders = columnNames.map(() => "?").join(",");
  const [existing] = await db.query(
    `
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND COLUMN_NAME IN (${placeholders})
    `,
    [tableName, ...columnNames]
  );

  const existingColumns = new Set(existing.map((column) => column.COLUMN_NAME));

  for (const [columnName, definition] of Object.entries(columns)) {
    if (!existingColumns.has(columnName)) {
      await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
    }
  }
}

async function hasUniqueIndex(tableName, columnNames) {
  const [indexes] = await db.query(
    `
    SELECT
      INDEX_NAME,
      NON_UNIQUE,
      GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX SEPARATOR ',') AS columns_list
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
    GROUP BY INDEX_NAME, NON_UNIQUE
    `,
    [tableName]
  );

  const expectedColumns = columnNames.join(",");

  return indexes.some(
    (index) => Number(index.NON_UNIQUE) === 0 && index.columns_list === expectedColumns
  );
}

async function normalizePesquisadorLinhaRelacionamentos() {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();
    await conn.query("DROP TEMPORARY TABLE IF EXISTS tmp_pesquisador_linha_distinct");
    await conn.query(`
      CREATE TEMPORARY TABLE tmp_pesquisador_linha_distinct AS
      SELECT DISTINCT pesquisador_id, linha_pesquisa_id
      FROM pesquisador_linha_pesquisa
      WHERE pesquisador_id IS NOT NULL
        AND linha_pesquisa_id IS NOT NULL
    `);
    await conn.query("DELETE FROM pesquisador_linha_pesquisa");
    await conn.query(`
      INSERT INTO pesquisador_linha_pesquisa (pesquisador_id, linha_pesquisa_id)
      SELECT pesquisador_id, linha_pesquisa_id
      FROM tmp_pesquisador_linha_distinct
    `);
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    await conn.query("DROP TEMPORARY TABLE IF EXISTS tmp_pesquisador_linha_distinct").catch(() => {});
    conn.release();
  }
}

async function ensurePesquisadorLinhaUniqueIndex() {
  const tableName = "pesquisador_linha_pesquisa";
  const keyColumns = ["pesquisador_id", "linha_pesquisa_id"];

  if (await hasUniqueIndex(tableName, keyColumns)) return;

  try {
    await normalizePesquisadorLinhaRelacionamentos();
    await db.query(`
      ALTER TABLE pesquisador_linha_pesquisa
        MODIFY pesquisador_id INT NOT NULL,
        MODIFY linha_pesquisa_id INT NOT NULL
    `);
    await db.query(`
      ALTER TABLE pesquisador_linha_pesquisa
        ADD UNIQUE KEY uq_pesquisador_linha (pesquisador_id, linha_pesquisa_id)
    `);
  } catch (error) {
    console.warn(
      "Nao foi possivel criar indice unico em pesquisador_linha_pesquisa:",
      error.message
    );
  }
}

export async function getTableColumns(tableName) {
  const [columns] = await db.query(
    `
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
    `,
    [tableName]
  );

  return new Set(columns.map((column) => column.COLUMN_NAME));
}

export async function ensurePesquisadoresSchema() {
  if (schemaPromise) return schemaPromise;

  schemaPromise = (async () => {
    await db.query(
      `
      CREATE TABLE IF NOT EXISTS pesquisadores (
        id INT NOT NULL AUTO_INCREMENT,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NULL,
        ativo TINYINT(1) NOT NULL DEFAULT 1,
        titulacao_maxima VARCHAR(255) NULL,
        data_inclusao DATE NULL,
        tipo_vinculo VARCHAR(50) NOT NULL DEFAULT 'pesquisador',
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `
    );

    await ensureColumns("pesquisadores", PESQUISADORES_COLUMNS);
  })().catch((error) => {
    schemaPromise = null;
    throw error;
  });

  return schemaPromise;
}

export async function ensurePesquisaRelacionamentosSchema() {
  if (pesquisaSchemaPromise) return pesquisaSchemaPromise;

  pesquisaSchemaPromise = (async () => {
    await db.query(
      `
      CREATE TABLE IF NOT EXISTS linhas_pesquisa (
        id INT NOT NULL AUTO_INCREMENT,
        nome VARCHAR(255) NOT NULL,
        grupo VARCHAR(255) NULL,
        ativo TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `
    );

    await ensureColumns("linhas_pesquisa", LINHAS_PESQUISA_COLUMNS);

    await db.query(
      `
      CREATE TABLE IF NOT EXISTS pesquisador_linha_pesquisa (
        pesquisador_id INT NOT NULL,
        linha_pesquisa_id INT NOT NULL,
        PRIMARY KEY (pesquisador_id, linha_pesquisa_id),
        INDEX idx_pesquisador_linha_pesquisa_linha (linha_pesquisa_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `
    );

    await ensureColumns("pesquisador_linha_pesquisa", PESQUISADOR_LINHA_COLUMNS);
    await ensurePesquisadorLinhaUniqueIndex();
  })().catch((error) => {
    pesquisaSchemaPromise = null;
    throw error;
  });

  return pesquisaSchemaPromise;
}
