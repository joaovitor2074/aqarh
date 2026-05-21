import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();
  
  async function handleLogin(e) {
    e.preventDefault();
    
    try {
      const response = await axios.post("http://localhost:3000/api/login", {
        email,
        senha
      });

      const { cargo } = response.data.user;

      // Salva token
      localStorage.setItem("token", response.data.token);

      // Redireciona dependendo do cargo
      if (cargo === "admin") {
        navigate("/admin/adelton");
      } else if (cargo === "pesquisador") {
        navigate("/admin/pesquisador");
      }

    } catch (err) {
      alert("Email ou senha inválidos.");
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        
        <input
          type="email"
          placeholder="Email"
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          onChange={e => setSenha(e.target.value)}
        />

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}
