// src/imports/import_estudantes.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ajuste se necessário
const JSON_PATH = path.join(
  __dirname,
  "../../data/resultado_final_estudantes.json"
);

async function importarEstudantes() {
  console.log("========================================");
  console.log("📥 Iniciando importação de ESTUDANTES");
  console.log("========================================");

  if (!fs.existsSync(JSON_PATH)) {
    console.error("❌ Arquivo JSON não encontrado:", JSON_PATH);
    process.exit(1);
  }

  const raw = fs.readFileSync(JSON_PATH, "utf-8");
  const estudantes = JSON.parse(raw);

  console.log(`📊 Registros encontrados no JSON: ${estudantes.length}`);

  let inseridos = 0;
  let ignorados = 0;
  let erros = 0;

  for (const [index, e] of estudantes.entries()) {
    console.log("----------------------------------------");
    console.log(`➡️ Registro ${index + 1}`);

    try {
      if (!e.nome) {
        console.warn("⚠️ Nome ausente, registro ignorado");
        ignorados++;
        continue;
      }

      const nome = e.nome.trim();
      const titulacao = e.titulacao_MAX || null;
      const dataInclusao = e.data_inclusao
        ? formatarData(e.data_inclusao)
        : null;

      const [result] = await db.query(
        `
        INSERT IGNORE INTO pesquisadores
        (nome, titulacao_maxima, data_inclusao, tipo_vinculo, ativo)
        VALUES (?, ?, ?, 'estudante', 1)
        `,
        [nome, titulacao, dataInclusao]
      );

      if (result.affectedRows === 0) {
        console.log(`🔁 Já existia: ${nome}`);
        ignorados++;
      } else {
        console.log(`✅ Inserido como estudante: ${nome}`);
        inseridos++;
      }

    } catch (err) {
      console.error(`❌ Erro no registro ${index + 1}`);
      console.error(err.message);
      erros++;
    }
  }

  console.log("========================================");
  console.log("📄 Importação finalizada");
  console.log(`✅ Inseridos: ${inseridos}`);
  console.log(`🔁 Ignorados: ${ignorados}`);
  console.log(`❌ Erros: ${erros}`);
  console.log("========================================");

  process.exit();
}

// converte dd/mm/yyyy → yyyy-mm-dd
function formatarData(data) {
  const [dia, mes, ano] = data.split("/");
  return `${ano}-${mes}-${dia}`;
}

importarEstudantes();
