// services/comunicados.service.js
import { db } from "../config/db.js";

export async function criarComunicado({
  tipo,
  titulo,
  descricao,
  imagem = null
}) {
  const [result] = await db.query(
    `
    INSERT INTO comunicados 
      (tipo, titulo, descricao, imagem, status)
    VALUES (?, ?, ?, ?, 'rascunho')
    `,
    [tipo, titulo, descricao, imagem]
  );

  return {
    id: result.insertId,
    status: "rascunho"
  };
}
