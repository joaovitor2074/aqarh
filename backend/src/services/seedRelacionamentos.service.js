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
let relationshipMaps = null;

function fixMojibake(value) {
  if (typeof value !== "string") return value;
  if (!/[\u00c3\u00c2\u00e2][\u0080-\u00bf]/.test(value)) return value;

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

function getLineName(linha) {
  return fixMojibake(linha?.linha_pesquisa || linha?.nome || "").trim();
}

function getLineGroup(linha) {
  return fixMojibake(linha?.grupo || "").trim();
}

function lineKey(nome, grupo) {
  return `${normalizeKey(nome)}|${normalizeKey(grupo)}`;
}

export function getSeedRelationshipMaps() {
  if (relationshipMaps) return relationshipMaps;

  const byLine = new Map();
  const byPerson = new Map();

  for (const person of readSeedPeople()) {
    const personName = fixMojibake(person.nome || "").trim();
    const personKey = normalizeKey(personName);
    if (!personName || !personKey || !Array.isArray(person.linhas_pesquisa)) {
      continue;
    }

    const personEntry = byPerson.get(personKey) || {
      linhas: new Map(),
      grupos: new Set(),
    };

    for (const linha of person.linhas_pesquisa) {
      const nome = getLineName(linha);
      const grupo = getLineGroup(linha);
      if (!nome) continue;

      const key = lineKey(nome, grupo);
      const lineEntry = byLine.get(key) || {
        pesquisadores: new Set(),
      };

      lineEntry.pesquisadores.add(personName);
      byLine.set(key, lineEntry);
      personEntry.linhas.set(key, nome);
      if (grupo) personEntry.grupos.add(grupo);
    }

    byPerson.set(personKey, personEntry);
  }

  relationshipMaps = { byLine, byPerson };
  return relationshipMaps;
}

export function getSeedPesquisadoresForLinha(nome, grupo) {
  const { byLine } = getSeedRelationshipMaps();
  const entry = byLine.get(lineKey(nome, grupo));
  return entry ? Array.from(entry.pesquisadores).sort((a, b) => a.localeCompare(b)) : [];
}

export function getSeedLinhasForPessoa(nome) {
  const { byPerson } = getSeedRelationshipMaps();
  const entry = byPerson.get(normalizeKey(nome));

  return {
    linhas: entry ? Array.from(entry.linhas.values()).sort((a, b) => a.localeCompare(b)) : [],
    grupos: entry ? Array.from(entry.grupos.values()).sort((a, b) => a.localeCompare(b)) : [],
  };
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
  const nome = getLineName(linha);
  const grupo = getLineGroup(linha);
  if (!nome) return null;

  const key = lineKey(nome, grupo);
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
