import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../config/db.js";

// corrigir __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// caminho correto do JSON
const jsonPath = path.join(__dirname, "../../data/resultado_final.json");

async function importarLinhasPesquisa() {
  try {
    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const pesquisadores = JSON.parse(rawData);

    console.log(`📥 Iniciando importação de linhas de pesquisa...`);
    let totalInseridas = 0;

    for (const pesquisador of pesquisadores) {
      if (!pesquisador.linhas_pesquisa) continue;

      for (const lp of pesquisador.linhas_pesquisa) {
        const nomeLinha = lp.linha_pesquisa?.trim();
        const grupoLinha = lp.grupo?.trim() || null;

        if (!nomeLinha) {
          console.log("⚠️ Linha ignorada (sem nome)");
          continue;
        }

        // evita duplicação
        const [existe] = await db.query(
          `
          SELECT id FROM linhas_pesquisa
          WHERE nome = ? AND grupo <=> ?
          LIMIT 1
          `,
          [nomeLinha, grupoLinha]
        );

        if (existe.length > 0) {
          continue;
        }

        await db.query(
          `
          INSERT INTO linhas_pesquisa (nome, grupo, ativo)
          VALUES (?, ?, 1)
          `,
          [nomeLinha, grupoLinha]
        );

        totalInseridas++;
        console.log(`➕ Linha inserida: ${nomeLinha}`);
      }
    }

    console.log(`\n✅ Importação finalizada!`);
    console.log(`📊 Total de linhas inseridas: ${totalInseridas}`);
    process.exit();
  } catch (error) {
    console.error("❌ Erro ao importar linhas de pesquisa:", error);
    process.exit(1);
  }
}

importarLinhasPesquisa();
