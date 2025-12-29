import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JSON_PATH = path.join(
  __dirname,
  "../../data/resultado_final_estudantes.json"
);

async function importarLinhasPesquisa() {
  console.log("📥 Importando linhas de pesquisa...");

  const raw = fs.readFileSync(JSON_PATH, "utf-8");
  const pessoas = JSON.parse(raw);

  let inseridas = 0;

  for (const pessoa of pessoas) {
    if (!Array.isArray(pessoa.linhas_pesquisa)) continue;

    for (const lp of pessoa.linhas_pesquisa) {
      const nome = lp.linha_pesquisa?.trim();
      const grupo = lp.grupo?.trim() || null;

      if (!nome) continue;

      const [existe] = await db.query(
        `
        SELECT id FROM linhas_pesquisa
        WHERE nome = ? AND grupo <=> ?
        LIMIT 1
        `,
        [nome, grupo]
      );

      if (existe.length > 0) continue;

      await db.query(
        `
        INSERT INTO linhas_pesquisa (nome, grupo, ativo)
        VALUES (?, ?, 1)
        `,
        [nome, grupo]
      );

      inseridas++;
      console.log(`➕ ${nome}`);
    }
  }

  console.log(`✅ Linhas inseridas: ${inseridas}`);
  process.exit();
}

importarLinhasPesquisa();
