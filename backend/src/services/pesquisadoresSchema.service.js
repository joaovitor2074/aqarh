import { db } from "../config/db.js";

const PESQUISADORES_COLUMNS = {
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

let schemaPromise = null;

export async function ensurePesquisadoresSchema() {
  if (schemaPromise) return schemaPromise;

  schemaPromise = (async () => {
    const columnNames = Object.keys(PESQUISADORES_COLUMNS);
    const placeholders = columnNames.map(() => "?").join(",");
    const [columns] = await db.query(
      `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'pesquisadores'
        AND COLUMN_NAME IN (${placeholders})
      `,
      columnNames
    );

    const existingColumns = new Set(columns.map((column) => column.COLUMN_NAME));

    for (const [columnName, definition] of Object.entries(PESQUISADORES_COLUMNS)) {
      if (!existingColumns.has(columnName)) {
        await db.query(`ALTER TABLE pesquisadores ADD COLUMN ${columnName} ${definition}`);
      }
    }
  })().catch((error) => {
    schemaPromise = null;
    throw error;
  });

  return schemaPromise;
}
