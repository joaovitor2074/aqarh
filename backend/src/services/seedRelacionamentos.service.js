import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../config/db.js";
import { ensurePesquisaRelacionamentosSchema } from "./pesquisadoresSchema.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DATA_FILES = [
  "resultado_linha_pesquisadores.json",
  "resultado_linha_estudantes.json",
];

let seedPromise = null;

function fixMojibake(value) {
  if (typeof value !== "string") return value;
  if (!/[\u00c3\u00c2\u00e2]/.test(value)) return value;

  try {
    return Buffer.from(value, "latin1").toString("utf8");
  } catch {
    return value;
  }
}

function normalizeKey(value) {
  return fixMojibake(String(value || ""))
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toUpperCase();
}

function readSeedPeople() {
  return DATA_FILES.flatMap((filename) => {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return [];

    const people = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return Array.isArray(people) ? people : [];
  });
}

async function getRelacionamentosCount() {
  const [[row]] = await db.query(
    `
    SELECT COUNT(*) AS total
    FROM pesquisador_linha_pesquisa plp
    INNER JOIN pesquisadores p
      ON p.id = plp.pesquisador_id
    INNER JOIN linhas_pesquisa lp
      ON lp.id = plp.linha_pesquisa_id
    `
  );

  return Number(row?.total || 0);
}

async function buildPesquisadoresIndex() {
  const [rows] = await db.query("SELECT id, nome FROM pesquisadores");
  return new Map(rows.map((row) => [normalizeKey(row.nome), row.id]));
}

async function buildLinhasIndex() {
  const [rows] = await db.query("SELECT id, nome, grupo FROM linhas_pesquisa");
  return new Map(
    rows.map((row) => [
      `${normalizeKey(row.nome)}|${normalizeKey(row.grupo)}`,
      row.id,
    ])
  );
}

async function findOrCreateLinha(conn, linhasIndex, linha) {
  const nome = fixMojibake(linha.linha_pesquisa || linha.nome || "").trim();
  const grupo = fixMojibake(linha.grupo || "").trim();
  if (!nome) return null;

  const key = `${normalizeKey(nome)}|${normalizeKey(grupo)}`;
  if (linhasIndex.has(key)) return linhasIndex.get(key);

  const [result] = await conn.query(
    `
    INSERT INTO linhas_pesquisa (nome, grupo, ativo)
    VALUES (?, ?, 1)
    `,
    [nome, grupo || null]
  );

  linhasIndex.set(key, result.insertId);
  return result.insertId;
}

export async function seedRelacionamentosIfEmpty() {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    await ensurePesquisaRelacionamentosSchema();

    const currentTotal = await getRelacionamentosCount();
    if (currentTotal > 0) {
      return { inserted: 0, skipped: true, reason: "already_seeded" };
    }

    const people = readSeedPeople();
    if (people.length === 0) {
      return { inserted: 0, skipped: true, reason: "missing_seed_files" };
    }

    const pesquisadoresIndex = await buildPesquisadoresIndex();
    const linhasIndex = await buildLinhasIndex();
    const conn = await db.getConnection();
    let inserted = 0;

    try {
      for (const person of people) {
        const pesquisadorId = pesquisadoresIndex.get(normalizeKey(person.nome));
        if (!pesquisadorId || !Array.isArray(person.linhas_pesquisa)) continue;

        for (const linha of person.linhas_pesquisa) {
          const linhaId = await findOrCreateLinha(conn, linhasIndex, linha);
          if (!linhaId) continue;

          const [result] = await conn.query(
            `
            INSERT IGNORE INTO pesquisador_linha_pesquisa
              (pesquisador_id, linha_pesquisa_id)
            VALUES (?, ?)
            `,
            [pesquisadorId, linhaId]
          );

          inserted += result.affectedRows || 0;
        }
      }

      console.log(`[seed] Relacionamentos pesquisador/linha criados: ${inserted}`);
      return { inserted, skipped: false };
    } finally {
      conn.release();
    }
  })().catch((error) => {
    seedPromise = null;
    throw error;
  });

  return seedPromise;
}
