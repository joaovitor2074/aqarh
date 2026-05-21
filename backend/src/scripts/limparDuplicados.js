// scripts/limparDuplicados.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env")
});

import { db } from "../config/db.js";



async function limparDuplicados() {
  console.log("🧹 Limpando dados duplicados...");
  
  // 1. Pesquisadores com mesmo nome (case-insensitive)
  const [pesquisadoresDuplicados] = await db.query(`
    SELECT LOWER(TRIM(nome)) as nome_lower, COUNT(*) as count
    FROM pesquisadores
    GROUP BY LOWER(TRIM(nome))
    HAVING count > 1
  `);
  
  console.log(`📊 ${pesquisadoresDuplicados.length} pesquisadores duplicados encontrados`);
  
  // 2. Linhas de pesquisa com mesmo nome
  const [linhasDuplicadas] = await db.query(`
    SELECT LOWER(TRIM(nome)) as nome_lower, COUNT(*) as count
    FROM linhas_pesquisa
    GROUP BY LOWER(TRIM(nome))
    HAVING count > 1
  `);
  
  console.log(`📊 ${linhasDuplicadas.length} linhas duplicadas encontradas`);
  
  // 3. Relacionamentos duplicados
  const [relacionamentosDuplicados] = await db.query(`
    SELECT pesquisador_id, linha_pesquisa_id, COUNT(*) as count
    FROM pesquisador_linha_pesquisa
    GROUP BY pesquisador_id, linha_pesquisa_id
    HAVING count > 1
  `);
  
  console.log(`📊 ${relacionamentosDuplicados.length} relacionamentos duplicados encontrados`);
  
  // Para limpar relacionamentos duplicados:
  await db.query(`
    CREATE TEMPORARY TABLE temp_relacionamentos AS
    SELECT MIN(id) as id_min
    FROM pesquisador_linha_pesquisa
    GROUP BY pesquisador_id, linha_pesquisa_id;
    
    DELETE FROM pesquisador_linha_pesquisa
    WHERE id NOT IN (SELECT id_min FROM temp_relacionamentos);
    
    DROP TEMPORARY TABLE temp_relacionamentos;
  `);
  
  console.log("✅ Limpeza de duplicados concluída");
}

limparDuplicados();