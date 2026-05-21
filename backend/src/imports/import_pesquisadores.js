// src/imports/import_pesquisadores.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ajuste o caminho se necessário
const JSON_PATH = path.join(
  __dirname,
  "../../data/resultado_final_pesquisadores.json"
);

async function importarPesquisadores() {
  console.log("========================================");
  console.log("📥 Iniciando importação de pesquisadores");
  console.log("========================================");

  if (!fs.existsSync(JSON_PATH)) {
    console.error("❌ Arquivo JSON não encontrado:", JSON_PATH);
    process.exit(1);
  }

  const raw = fs.readFileSync(JSON_PATH, "utf-8");
  const pesquisadores = JSON.parse(raw);

  console.log(`📊 Registros encontrados no JSON: ${pesquisadores.length}`);

  let inseridos = 0;
  let ignorados = 0;
  let erros = 0;

  for (const [index, p] of pesquisadores.entries()) {
    console.log("----------------------------------------");
    console.log(`➡️ Registro ${index + 1}`);

    try {
      if (!p.nome) {
        console.warn("⚠️ Nome ausente, registro ignorado");
        ignorados++;
        continue;
      }

      const nome = p.nome.trim();
      const titulacao = p.titulacao_MAX || null;
      const dataInclusao = p.data_inclusao
        ? formatarData(p.data_inclusao)
        : null;

      const [result] = await db.query(
        `INSERT IGNORE INTO pesquisadores
         (nome, titulacao_maxima, data_inclusao)
         VALUES (?, ?, ?)`,
        [nome, titulacao, dataInclusao]
      );

      if (result.affectedRows === 0) {
        console.log(`🔁 Já existia: ${nome}`);
        ignorados++;
      } else {
        console.log(`✅ Inserido: ${nome}`);
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

importarPesquisadores();
