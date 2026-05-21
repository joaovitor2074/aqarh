import { db } from "../config/db.js";

export async function getQuantidadeMembros() {
    const [rows] = await db.query(`
        SELECT COUNT(*) AS total_membros FROM pesquisadores;
    `);
    return rows[0].total_membros;
}
