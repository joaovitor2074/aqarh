import { db } from "../config/db.js";

/**
 * Tipos possíveis de notificação (documentação interna)
 * - NOVO_PESQUISADOR
 * - NOVO_ESTUDANTE
 * - NOVA_LINHA
 * - NOVO_VINCULO
 */

/**
 * Cria notificações de scraping no banco
 * @param {string} tipo - Tipo da notificação
 * @param {Array<Object>} registros - Dados associados à notificação
 * @returns {Promise<number>} quantidade criada
 */
export async function criarNotificacoes(tipo, registros) {
  if (!registros || registros.length === 0) return 0;

  const values = registros.map(dados => [
    tipo,
    "pendente",
    JSON.stringify(dados)
  ]);

  const placeholders = values.map(() => "(?, ?, ?)").join(",");
  const flattened = values.flat();

  await db.query(
    `INSERT IGNORE INTO notificacoes_scraping
      (tipo, status, dados)
     VALUES ${placeholders}`,
    flattened
  );

  return registros.length;
}
