import React, { useMemo, useState } from "react";
import styles from "../styles/Projetos.module.css";

const PROJECTS_SAMPLE = [
  {
    id: 1,
    title: "Análise da Qualidade da Água em Comunidades Rurais",
    category: "Científicos",
    excerpt:
      "Estudo sobre parâmetros físico-químicos e microbiológicos da água consumida em povoados da região de Codó.",
    image: "/images/placeholder-1.jpg",
  },
  {
    id: 2,
    title: "Avaliação Nutricional de Alimentos Regionais",
    category: "Científicos",
    excerpt:
      "Pesquisa com foco na composição nutricional e aplicações tecnológicas de alimentos maranhenses.",
    image: "/images/placeholder-2.jpg",
  },
  {
    id: 3,
    title: "Relatório Técnico – Feira de Ciências do IFMA",
    category: "Acadêmicos",
    excerpt:
      "Projeto apresentado na Feira de Ciências com foco em sustentabilidade e inovação.",
    image: "/images/placeholder-3.jpg",
  },
  {
    id: 4,
    title: "Monitoramento de Recursos Hídricos",
    category: "Científicos",
    excerpt:
      "Projeto contínuo de análise de rios locais e impactos ambientais.",
    image: "/images/placeholder-4.jpg",
  },
  {
    id: 5,
    title: "Práticas de Laboratório – Química Geral",
    category: "Acadêmicos",
    excerpt:
      "Registro dos experimentos realizados na disciplina de Química do IFMA.",
    image: "/images/placeholder-5.jpg",
  },
];

const CATEGORIES = ["Todos", "Acadêmicos", "Científicos"];

export default function Projetos() {
  const [activeCategory, setActiveCategory] = useState("Todos");

  const filtered = useMemo(() => {
    if (activeCategory === "Todos") return PROJECTS_SAMPLE;
    return PROJECTS_SAMPLE.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className={styles.page}>
      {/* HERO */}
      <header className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Projetos Científicos</h1>
          <p className={styles.heroSubtitle}>
            Pesquisa, desenvolvimento e inovação no IFMA – Campus Codó.
          </p>
        </div>
      </header>

      <main className={styles.container}>
        {/* Filters: desktop buttons + mobile select */}
        <div className={styles.filters}>
          <div className={styles.buttons}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`${styles.filterBtn} ${
                  activeCategory === cat ? styles.active : ""
                }`}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Mobile select */}
          <div className={styles.mobileSelect}>
            <label htmlFor="categorySelect" className={styles.srOnly}>
              Selecionar categoria
            </label>
            <select
              id="categorySelect"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid of projects */}
        <section className={styles.grid}>
          {filtered.map((p) => (
            <article key={p.id} className={styles.card}>
              <div className={styles.cardImgWrap}>
                <img
                  src={p.image}
                  alt={p.title}
                  className={styles.cardImg}
                  loading="lazy"
                />
              </div>

              <div className={styles.cardBody}>
                <span className={styles.category}>{p.category}</span>
                <h3 className={styles.cardTitle}>{p.title}</h3>
                <p className={styles.cardExcerpt}>{p.excerpt}</p>
                <div className={styles.cardActions}>
                  <button className={styles.btnPrimary}>Ver mais</button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
