import { useState } from "react";
import "../styles/login.module.css"; // criaremos já já

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  return (
    <div className="loginContainer">
      <div className="loginBox">

        <h1 className="loginTitle">Acesso ao Painel</h1>
        <p className="loginSubtitle">Entre com suas credenciais</p>

        <form className="loginForm" onSubmit={(e) => e.preventDefault()}>
          <label>Email institucional</label>
          <input
            type="email"
            placeholder="seuemail@ifma.edu.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Senha</label>
          <input
            type="password"
            placeholder="••••••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <button className="loginButton">Entrar</button>
        </form>
      </div>
    </div>
  );
}
