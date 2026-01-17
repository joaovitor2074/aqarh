import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../styles/Header.module.css";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");
  const location = useLocation();

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll);
    
    // Identificar a página ativa
    const path = location.pathname.split('/')[1] || 'inicio';
    setActiveMenu(path);
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);

  return (
    <>
      {/* HEADER */}
      <header
        className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}
      >
        <div className={styles.headerContainer}>
          {/* Logo com efeito moderno */}
          <div className={styles.logoContainer}>
            <div className={styles.logoWrapper}>
              <img
                src="/img/header.png"
                alt="Logo GIEPI"
                className={styles.logo}
              />
              <div className={styles.logoGlow}></div>
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoMain}>GIEPI</span>
              <span className={styles.logoSubtitle}>Grupo de Pesquisa</span>
            </div>
          </div>

          {/* Menu Desktop com indicador ativo */}
          <nav className={styles.navDesktop}>
            <ul className={styles.navList}>
              {[
                { path: "/", label: "Início", key: "inicio" },
                { path: "/pesquisas", label: "Pesquisas", key: "pesquisas" },
                { path: "/projetos", label: "Projetos", key: "projetos" },
                { path: "/publicacoes", label: "Publicações", key: "publicacoes" },
                { path: "/equipe", label: "Equipe", key: "equipe" },
              ].map((item) => (
                <li key={item.key} className={styles.navItem}>
                  <Link 
                    to={item.path}
                    className={`${styles.navLink} ${activeMenu === item.key ? styles.active : ""}`}
                  >
                    {item.label}
                    {activeMenu === item.key && <span className={styles.activeIndicator}></span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* CTA Desktop com gradiente */}
          <div className={styles.ctaContainer}>
            <Link
              to="/publicacoes"
              className={styles.ctaButton}
            >
              <span className={styles.ctaIcon}>📚</span>
              <span className={styles.ctaText}>Publicações</span>
            </Link>
          </div>

          {/* Hamburguer Menu Moderno */}
          <button
            className={styles.hamburger}
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
          >
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </button>
        </div>

        {/* Linha decorativa */}
        <div className={styles.headerLine}></div>
      </header>

      {/* OVERLAY */}
      {open && (
        <div
          className={styles.overlay}
          onClick={() => setOpen(false)}
        ></div>
      )}

      {/* MENU MOBILE Modernizado */}
      <aside
        className={`${styles.mobileMenu} ${open ? styles.menuOpen : styles.menuClosed}`}
      >
        <div className={styles.mobileHeader}>
          <div className={styles.mobileLogo}>
            <img
              src="/img/header.png"
              alt="Logo GIEPI"
              className={styles.mobileLogoImg}
            />
            <span className={styles.mobileLogoText}>GIEPI</span>
          </div>
          <button 
            className={styles.closeButton}
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          >
            <span className={styles.closeIcon}></span>
            <span className={styles.closeIcon}></span>
          </button>
        </div>

        <div className={styles.mobileContent}>
          <nav className={styles.mobileNav}>
            <ul className={styles.mobileList}>
              {[
                { path: "/", label: "Início", icon: "🏠" },
                { path: "/pesquisas", label: "Pesquisas", icon: "🔬" },
                { path: "/projetos", label: "Projetos", icon: "📋" },
                { path: "/publicacoes", label: "Publicações", icon: "📚" },
                { path: "/equipe", label: "Equipe", icon: "👥" },
              ].map((item, index) => (
                <li key={index} className={styles.mobileItem}>
                  <Link 
                    to={item.path}
                    className={`${styles.mobileLink} ${activeMenu === item.path.split('/')[1] ? styles.mobileActive : ""}`}
                    onClick={() => setOpen(false)}
                  >
                    <span className={styles.mobileIcon}>{item.icon}</span>
                    <span className={styles.mobileLabel}>{item.label}</span>
                    <span className={styles.mobileArrow}>→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.mobileFooter}>
            <Link
              to="/publicacoes"
              className={styles.mobileCta}
              onClick={() => setOpen(false)}
            >
              <div className={styles.mobileCtaIcon}>📖</div>
              <div className={styles.mobileCtaContent}>
                <div className={styles.mobileCtaTitle}>Acessar Publicações</div>
                <div className={styles.mobileCtaSubtitle}>Conheça nossas produções científicas</div>
              </div>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}