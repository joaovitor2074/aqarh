import React from "react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-col footer-brand">
          <h3>GIEPI</h3>
          <p>Grupo Interdisciplinar em Ensino, Pesquisa e Inovação.</p>
          <p>Instituto Federal do Maranhão - Campus Codó.</p>
        </div>

        <div className="footer-col">
          <h3>Navegação</h3>
          <ul>
            <li><a href="/">Início</a></li>
            <li><a href="/sobre">Sobre</a></li>
            <li><a href="/pesquisas">Pesquisas</a></li>
            <li><a href="/projetos">Projetos</a></li>
            <li><a href="/publicacoes">Publicações</a></li>
            <li><a href="/equipe">Equipe</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Institucional</h3>
          <p>IFMA Campus Codó</p>
          <p>Ensino, pesquisa, inovação e extensão.</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 GIEPI - IFMA Campus Codó</p>
        <p>Portal acadêmico do grupo de pesquisa.</p>
      </div>
    </footer>
  );
}
