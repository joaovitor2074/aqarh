import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../styles/Header.module.css";

const menuItems = [
  { path: "/", label: "Início", key: "inicio" },
  { path: "/pesquisas", label: "Pesquisas", key: "pesquisas" },
  { path: "/projetos", label: "Projetos", key: "projetos" },
  { path: "/publicacoes", label: "Publicações", key: "publicacoes" },
  { path: "/equipe", label: "Equipe", key: "equipe" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const activeMenu = location.pathname.split("/")[1] || "inicio";

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.headerContainer}>
          <Link to="/" className={styles.logoContainer} onClick={() => setOpen(false)}>
            <div className={styles.logoWrapper}>
              <img src="/img/logohead.png" alt="GIEPI" className={styles.logo} />
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoMain}>GIEPI</span>
              <span className={styles.logoSubtitle}>IFMA Campus Codó</span>
            </div>
          </Link>

          <nav className={styles.navDesktop} aria-label="Navegação principal">
            <ul className={styles.navList}>
              {menuItems.map((item) => (
                <li key={item.key} className={styles.navItem}>
                  <Link
                    to={item.path}
                    className={`${styles.navLink} ${activeMenu === item.key ? styles.active : ""}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.ctaContainer}>
            <Link to="/publicacoes" className={styles.ctaButton}>
              Produção científica
            </Link>
          </div>

          <button
            className={styles.hamburger}
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={open}
          >
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </button>
        </div>
      </header>

      {open && <div className={styles.overlay} onClick={() => setOpen(false)}></div>}

      <aside
        className={`${styles.mobileMenu} ${open ? styles.menuOpen : styles.menuClosed}`}
        aria-hidden={!open}
      >
        <div className={styles.mobileHeader}>
          <div className={styles.mobileLogo}>
            <img src="/img/logohead.png" alt="GIEPI" className={styles.mobileLogoImg} />
            <div>
              <span className={styles.mobileLogoText}>GIEPI</span>
              <span className={styles.mobileLogoSub}>IFMA Campus Codó</span>
            </div>
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
          <nav className={styles.mobileNav} aria-label="Navegação mobile">
            <ul className={styles.mobileList}>
              {menuItems.map((item) => (
                <li key={item.key} className={styles.mobileItem}>
                  <Link
                    to={item.path}
                    className={`${styles.mobileLink} ${
                      activeMenu === item.key ? styles.mobileActive : ""
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    <span className={styles.mobileLabel}>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <Link to="/publicacoes" className={styles.mobileCta} onClick={() => setOpen(false)}>
            <div className={styles.mobileCtaTitle}>Produção científica</div>
            <div className={styles.mobileCtaSubtitle}>Artigos, relatórios e documentos do grupo</div>
          </Link>
        </div>
      </aside>
    </>
  );
}
