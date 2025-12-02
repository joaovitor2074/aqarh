import React from 'react'
import { Link } from 'react-router-dom'


export default function Header() {
    return (
        <header className="header">
            <div className="header-left">
                <h1 className="logo-title">AQARH</h1>
                <img src="/images/logo.png" alt="Logo AQARH" className="logo-img" />
            </div>


            <nav className="nav-menu">
                <ul>
                    <li><Link to="/">Início</Link></li>
                    <li><Link to="/pesquisas">Pesquisas</Link></li>
                    <li><Link to="/projetos">Projetos</Link></li>
                    <li><Link to="/publicacoes">Publicações</Link></li>
                </ul>
            </nav>


            <Link to="/publicacoes" className="btn cta">Acessar Publicações</Link>
        </header>
    )
}