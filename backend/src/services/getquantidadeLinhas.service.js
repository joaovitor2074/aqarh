import { db } from "../config/db.js";

export async function getQuantidadeLinhas() {
    const [rows] = await db.query(`
        SELECT COUNT(*) AS total_linhas FROM linhas_pesquisa;
    `);
    return rows[0].total_linhas;
}