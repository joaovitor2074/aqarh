import React, { useMemo, useState } from "react";
import styles from "../styles/publicacoes.module.css";
import PUBLICACOES from "../data/publicacoes";

const CATEGORIES = ["Todos", ...Array.from(new Set(PUBLICACOES.map(p => p.category)))];

export default function Publicacoes() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const byCat = activeCategory === "Todos"
      ? PUBLICACOES
      : PUBLICACOES.filter(p => p.category === activeCategory);

    if (!search.trim()) return byCat;
    const q = search.toLowerCase();
    return byCat.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      String(p.year).includes(q)
    );
  }, [activeCategory, search]);

  return (
    <div className={styles.page}>
      {/* HERO */}
      <header className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Publicações Científicas</h1>
          <p className={styles.heroSubtitle}>
            Artigos, relatórios e documentos produzidos pelo Grupo GIEPI — IFMA Campus Codó.
          </p>
        </div>
      </header>

      <main className={styles.container}>
        {/* filtros / busca */}
        <div className={styles.controls}>
          <div className={styles.buttons}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`${styles.filterBtn} ${activeCategory === cat ? styles.active : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={styles.searchWrap}>
            <input
              type="search"
              placeholder="Pesquisar título, resumo ou ano..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* grid de publicações */}
        <section className={styles.grid}>
          {filtered.map(pub => (
            <article key={pub.id} className={styles.card}>
              <div className={styles.cardImgWrap}>
                <img src={pub.image} alt={pub.title} className={styles.cardImg} loading="lazy" />
              </div>

              <div className={styles.cardBody}>
                <div className={styles.meta}>
                  <span className={styles.category}>{pub.category}</span>
                  <span className={styles.year}>{pub.year}</span>
                </div>

                <h3 className={styles.cardTitle}>{pub.title}</h3>
                <p className={styles.cardExcerpt}>{pub.excerpt}</p>

                <div className={styles.cardActions}>
                  {/* Para modal futuramente: comente a linha abaixo e implemente modal */}
                  <a href={pub.file} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
                    Ver PDF
                  </a>

                  {/* Exemplo de botão para futura página interna */}
                  <button className={styles.btnSecondary} onClick={()=>{/* abrir página interna / modal */}}>
                    Detalhes
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
