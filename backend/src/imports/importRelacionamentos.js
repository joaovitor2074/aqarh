import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, "../../data/resultado_final.json");

async function importarRelacionamentos() {
  try {
    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const pesquisadores = JSON.parse(rawData);

    console.log("🔗 Iniciando criação de relacionamentos...");
    let total = 0;

    for (const p of pesquisadores) {
      // buscar pesquisador
      const [pesqRows] = await db.query(
        "SELECT id FROM pesquisadores WHERE nome = ? LIMIT 1",
        [p.nome.trim()]
      );

      if (pesqRows.length === 0) {
        console.log(`⚠️ Pesquisador não encontrado: ${p.nome}`);
        continue;
      }

      const pesquisadorId = pesqRows[0].id;

      if (!p.linhas_pesquisa) continue;

      for (const lp of p.linhas_pesquisa) {
        const nomeLinha = lp.linha_pesquisa?.trim();
        const grupoLinha = lp.grupo?.trim() || null;

        if (!nomeLinha) continue;

        // buscar linha
        const [linhaRows] = await db.query(
          `
          SELECT id FROM linhas_pesquisa
          WHERE nome = ? AND grupo <=> ?
          LIMIT 1
          `,
          [nomeLinha, grupoLinha]
        );

        if (linhaRows.length === 0) {
          console.log(`⚠️ Linha não encontrada: ${nomeLinha}`);
          continue;
        }

        const linhaId = linhaRows[0].id;

        // inserir relacionamento
        await db.query(
          `
          INSERT IGNORE INTO pesquisador_linha_pesquisa
          (pesquisador_id, linha_pesquisa_id)
          VALUES (?, ?)
          `,
          [pesquisadorId, linhaId]
        );

        total++;
      }
    }

    console.log(`✅ Relacionamentos criados: ${total}`);
    process.exit();
  } catch (err) {
    console.error("❌ Erro ao criar relacionamentos:", err);
    process.exit(1);
  }
}

importarRelacionamentos();
