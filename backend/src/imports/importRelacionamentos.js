import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../config/db.js";

// suporte a ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JSON
const jsonPath = path.join(
  __dirname,
  "../../data/resultado_linhas_estudantes_espelho.json"
);

// async function importarRelacionamentos() {
//   console.log("🔗 Criando relacionamentos pesquisador ↔ linha...");
//   let total = 0;
//   let pessoasNaoEncontradas = 0;

//   const rawData = fs.readFileSync(jsonPath, "utf-8");
//   const pessoas = JSON.parse(rawData);

//   for (const pessoa of pessoas) {
//     if (!pessoa.nome || !Array.isArray(pessoa.linhas_pesquisa)) continue;

//     const nomePessoa = pessoa.nome.trim();

//     // 🔍 buscar pesquisador (tolerante)
//     const [pessoaRows] = await db.query(
//       `
//       SELECT id
//       FROM pesquisadores
//       WHERE TRIM(nome) LIKE ?
//       LIMIT 1
//       `,
//       [`%${nomePessoa}%`]
//     );

//     if (pessoaRows.length === 0) {
//       console.warn(`⚠️ Pesquisador não encontrado: ${nomePessoa}`);
//       pessoasNaoEncontradas++;
//       continue;
//     }

//     const pesquisadorId = pessoaRows[0].id;

//     for (const lp of pessoa.linhas_pesquisa) {
//       const nomeLinha = lp.linha_pesquisa?.trim();
//       const grupoLinha = lp.grupo?.trim() || null;

//       if (!nomeLinha) continue;

//       // 🔍 buscar linha
//       const [linhaRows] = await db.query(
//         `
//         SELECT id
//         FROM linhas_pesquisa
//         WHERE TRIM(nome) LIKE ?
//           AND grupo <=> ?
//         LIMIT 1
//         `,
//         [`%${nomeLinha}%`, grupoLinha]
//       );

//       if (linhaRows.length === 0) {
//         console.warn(`⚠️ Linha não encontrada: ${nomeLinha}`);
//         continue;
//       }

//       const linhaId = linhaRows[0].id;

//       // 🔗 inserir relacionamento
//       const [result] = await db.query(
//         `
//         INSERT IGNORE INTO pesquisador_linha_pesquisa
//         (pesquisador_id, linha_pesquisa_id)
//         VALUES (?, ?)
//         `,
//         [pesquisadorId, linhaId]
//       );

//       if (result.affectedRows > 0) {
//         total++;
//       }
//     }
//   }

//   console.log("========================================");
//   console.log(`✅ Relacionamentos criados: ${total}`);
//   console.log(`⚠️ Pesquisadores não encontrados: ${pessoasNaoEncontradas}`);
//   console.log("========================================");

//   process.exit(0);
// }

// importarRelacionamentos();
