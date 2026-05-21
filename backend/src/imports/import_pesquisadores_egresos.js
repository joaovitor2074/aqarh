// src/imports/import_egressos.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ajuste o caminho se necessário
const JSON_PATH = path.join(
  __dirname,
  "../../data/resultado_final_estudantes_egresos.json"
);

async function importarEgressos() {
  console.log("========================================");
  console.log("📥 Importando egressos");
  console.log("========================================");

  if (!fs.existsSync(JSON_PATH)) {
    console.error("❌ Arquivo JSON não encontrado:", JSON_PATH);
    process.exit(1);
  }

  const raw = fs.readFileSync(JSON_PATH, "utf-8");
  const dados = JSON.parse(raw);

  console.log(`📊 Registros encontrados: ${dados.length}`);

  let inseridos = 0;
  let ignorados = 0;
  let erros = 0;

  for (const [index, item] of dados.entries()) {
    console.log("----------------------------------------");
    console.log(`➡️ Registro ${index + 1}`);

    try {
      if (!item.nome || !item.nome.trim()) {
        console.warn("⚠️ Nome inválido, ignorado");
        ignorados++;
        continue;
      }

      const nome = item.nome.trim();

      const [result] = await db.query(
        `
        INSERT IGNORE INTO pesquisadores
        (nome, tipo_vinculo, ativo, created_at, updated_at)
        VALUES (?, 'estudante', 0, NOW(), NOW())
        `,
        [nome]
      );

      if (result.affectedRows === 0) {
        console.log(`🔁 Já existia: ${nome}`);
        ignorados++;
      } else {
        console.log(`✅ Inserido (egresso): ${nome}`);
        inseridos++;
      }

    } catch (err) {
      console.error(`❌ Erro no registro ${index + 1}`);
      console.error(err.message);
      erros++;
    }
  }

  console.log("========================================");
  console.log("🏁 Importação finalizada");
  console.log(`✅ Inseridos: ${inseridos}`);
  console.log(`🔁 Ignorados: ${ignorados}`);
  console.log(`❌ Erros: ${erros}`);
  console.log("========================================");

  process.exit();
}

importarEgressos();
