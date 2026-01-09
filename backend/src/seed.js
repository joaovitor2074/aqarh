import bcrypt from "bcrypt";
import { db } from "./config/db.js";

async function criarAdmin() {
  const senhaCriptografada = await bcrypt.hash("777", 10);

  await db.query(
    "INSERT INTO usuarios (nome, email, senha, cargo) VALUES (?, ?, ?, ?)",
    ["DESENVOLVEOR", "jv@ifma.com", senhaCriptografada, "admin"]
  );

  console.log("Administrador criado!");
  process.exit();
}

criarAdmin();
