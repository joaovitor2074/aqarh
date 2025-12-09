import React from 'react'


export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">


                <div className="footer-col">
                    <h3>Sobre o Grupo</h3>
                    <p>IFMA – Campus Codó</p>
                    <p>Grupo Interdisciplinar em Ensino, Pesquisa e Inovação- GIEPI</p>
                </div>


                <div className="footer-col">
                    <h3>Navegação</h3>
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/projetos">Projetos</a></li>
                        <li><a href="/pesquisas">Pesquisas</a></li>
                    </ul>
                </div>


                <div className="footer-col">
                    <h3>Contato</h3>
                    <p>Email: exemplo@ifma.edu.br</p>
                    <p>Localização: IFMA – Campus Codó</p>
                </div>


            </div>


            <div className="footer-bottom">
                <p>© 2025 GIEPI – IFMA – Campus Codó</p>
                <p>Desenvolvido por JV – Iniciação Científica 2025/26</p>
            </div>
        </footer>
    )
}