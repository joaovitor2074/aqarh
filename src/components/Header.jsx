import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Header.module.css";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* HEADER */}
      <header
        className={`
    fixed top-0 left-0 w-full z-50 
    flex items-center justify-between 
    transition-all duration-300 
    px-4 md:px-6 
    py-3 md:py-4
    ${styles.headerBackground}
  `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          

          <img
            src="../public/img/header.png"
            alt="Logo GIEPI"
            className={`${styles.logoimg} w-9 h-9 md:w-11 md:h-11 object-contain`}
            
          />
        </div>

        {/* Menu Desktop */}
        <nav className="hidden md:flex">
          <ul className="flex gap-8 text-lg text-white font-medium">
            <li className={styles.navItem}><Link to="/">Início</Link></li>
            <li className={styles.navItem}><Link to="/pesquisas">Pesquisas</Link></li>
            <li className={styles.navItem}><Link to="/projetos">Projetos</Link></li>
            <li className={styles.navItem}><Link to="/publicacoes">Publicações</Link></li>
            <li className={styles.navItem}><Link to="/equipe">Equipe</Link></li>
          </ul>
        </nav>

        {/* CTA desktop */}
        <Link
          to="/publicacoes"
          className={`hidden md:inline-block ${styles.ctaSmooth}`}
        >
          Acessar Publicações
        </Link>

        {/* Hamburguer */}
        <button
          className= {`${styles.hamburguer} md:hidden text-3xl text-white `}
          onClick={() => setOpen(true)}
        >
          ☰
        </button>
      </header>


      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 animate-fadeIn"
          onClick={() => setOpen(false)}
        ></div>
      )}

      {/* MENU MOBILE */}
      <aside
        className={`
          fixed top-0 right-0 w-64 h-full bg-white shadow-xl z-50 p-6 
          transition-transform duration-300 md:hidden
          ${open ? styles.menuSlideIn : styles.menuSlideOut}
          ${styles.fadeIn}
        `}
      >
        <button className="text-3xl mb-6" onClick={() => setOpen(false)}>✕</button>

        <ul className="flex flex-col gap-4 text-lg text-gray-800">
          <li><Link to="/" onClick={() => setOpen(false)}>Início</Link></li>
          <li><Link to="/pesquisas" onClick={() => setOpen(false)}>Pesquisas</Link></li>
          <li><Link to="/projetos" onClick={() => setOpen(false)}>Projetos</Link></li>
          <li><Link to="/publicacoes" onClick={() => setOpen(false)}>Publicações</Link></li>
          <li><Link to="/equipe" onClick={() => setOpen(false)}>Equipe</Link></li>
        </ul>

        <Link
          to="/publicacoes"
          onClick={() => setOpen(false)}
          className={`block mt-8 bg-[#006A4E] text-center text-white py-2 rounded-md hover:bg-[#00996E] transition ${styles.ctaSmooth}`}
        >
          Acessar Publicações
        </Link>
      </aside>
    </>
  );
}
