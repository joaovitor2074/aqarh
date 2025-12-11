import bcrypt from "bcrypt";
import { db } from "./config/db.js";

async function criarAdmin() {
  const senhaCriptografada = await bcrypt.hash("123456", 10);

  await db.query(
    "INSERT INTO usuarios (nome, email, senha, cargo) VALUES (?, ?, ?, ?)",
    ["Administrador", "admin@ifma.com", senhaCriptografada, "admin"]
  );

  console.log("Administrador criado!");
  process.exit();
}

criarAdmin();
