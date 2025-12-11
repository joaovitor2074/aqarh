import bcrypt from "bcrypt";

async function gerar() {
  const senha = "777"; // coloque a senha que você quer usar
  const hash = await bcrypt.hash(senha, 10);
  console.log("HASH GERADO:", hash);
}

gerar();
