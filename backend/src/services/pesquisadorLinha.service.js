import { db } from "../config/db.js";

export async function criarRelacionamentosPesquisadorLinhas(pesquisadorId, linhasPesquisa) {
  try {
    console.log("🟡 Criando relacionamentos para pesquisador:", pesquisadorId, "com linhas:", linhasPesquisa);

    if (!linhasPesquisa || !Array.isArray(linhasPesquisa) || linhasPesquisa.length === 0) {
      console.log("⚠️ Nenhuma linha de pesquisa fornecida");
      return;
    }

    for (const linha of linhasPesquisa) {
      // Primeiro, tente encontrar a linha pelo nome
      const [[linhaDb]] = await db.query(
        `SELECT id FROM linhas_pesquisa WHERE nome = ? AND ativo = 1`,
        [linha]
      );

      if (linhaDb) {
        // Insere o relacionamento
        await db.query(
          `INSERT INTO pesquisador_linha_pesquisa (pesquisador_id, linha_pesquisa_id)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE pesquisador_id = pesquisador_id`,
          [pesquisadorId, linhaDb.id]
        );
        console.log(`✅ Relacionamento criado: pesquisador ${pesquisadorId} -> linha ${linhaDb.id} (${linha})`);
      } else {
        console.log(`⚠️ Linha não encontrada: ${linha}`);
      }
    }

    console.log("✅ Todos os relacionamentos criados com sucesso");
  } catch (error) {
    console.error("🔥 Erro ao criar relacionamentos:", error);
    throw error;
  }
}
