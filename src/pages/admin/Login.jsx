import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoaderCircle, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { api } from "../../utils/api";
import styles from "../../styles/login.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const response = await api.post("/login", { email, senha });

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setErro(err?.message || "Email ou senha invalidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.loginContainer}>
      <section className={styles.loginShell}>
        <div className={styles.loginPanel}>
          <div className={styles.brandRow}>
            <div className={styles.brandIcon}>
              <ShieldCheck size={26} aria-hidden="true" />
            </div>

            <div>
              <span>GIEPI</span>
              <strong>Painel institucional</strong>
            </div>
          </div>

          <div className={styles.heading}>
            <p>Area administrativa</p>
            <h1>Acesso seguro</h1>
          </div>

          <form className={styles.loginForm} onSubmit={handleLogin}>
            <label className={styles.field}>
              <span>Email</span>
              <div className={styles.inputWrap}>
                <Mail size={18} aria-hidden="true" />
                <input
                  type="email"
                  placeholder="seu.email@instituicao.br"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <label className={styles.field}>
              <span>Senha</span>
              <div className={styles.inputWrap}>
                <LockKeyhole size={18} aria-hidden="true" />
                <input
                  type="password"
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>
            </label>

            {erro && <div className={styles.errorBox}>{erro}</div>}

            <button type="submit" className={styles.loginButton} disabled={loading}>
              {loading ? <LoaderCircle className={styles.spinner} size={18} /> : null}
              {loading ? "Entrando..." : "Entrar no painel"}
            </button>
          </form>
        </div>

        <aside className={styles.infoPanel} aria-label="Resumo institucional">
          <span className={styles.infoKicker}>Sistema GIEPI</span>
          <h2>Gestao academica integrada.</h2>

          <div className={styles.infoGrid}>
            <div>
              <strong>Pesquisa</strong>
              <span>Linhas, membros e projetos em um unico ambiente.</span>
            </div>
            <div>
              <strong>Atualizacoes</strong>
              <span>Scraping monitorado com fila de revisao.</span>
            </div>
            <div>
              <strong>Comunicacao</strong>
              <span>Comunicados e email institucional integrados.</span>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
