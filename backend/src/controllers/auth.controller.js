import bcrypt from "bcrypt";
import { db } from "../config/db.js";
import { generateToken } from "../utils/generateToken.js";

export async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: "Informe email e senha." });
    }

    // Busca usuário
    const [rows] = await db.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Usuário não encontrado." });
    }

    const user = rows[0];

    // Compara senha criptografada
    const senhaCorreta = await bcrypt.compare(senha, user.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ message: "Senha incorreta." });
    }

    // Gera token
    const token = generateToken(user.id, user.cargo);

    res.json({
      message: "Login realizado com sucesso!",
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
      },
    });

  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
}
