import { useEffect, useState } from "react";
import {
  FaArrowRight,
  FaBookOpen,
  FaExclamationTriangle,
  FaFilter,
  FaFlask,
  FaGraduationCap,
  FaSearch,
  FaUsers,
} from "react-icons/fa";
import { carregarLinhasPublicas } from "../services/linhasPublicas.service";
import { DEFAULT_LINHA_IMAGE } from "../utils/linhaImages";
import { createResearcherHref } from "../utils/researcherLinks";
import styles from "../styles/pesquisa.module.css";

export default function Pesquisas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("todos");
  const [expandedResearch, setExpandedResearch] = useState(null);
  const [linhasPesquisa, setLinhasPesquisa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function carregarLinhas() {
      try {
        setLoading(true);
        const linhas = await carregarLinhasPublicas();

        if (isMounted) {
          setLinhasPesquisa(linhas);
          setErrorMessage("");
        }
      } catch (error) {
        console.error("Erro ao carregar linhas publicas:", error);

        if (isMounted) {
          setErrorMessage("Não foi possível carregar as linhas de pesquisa.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    carregarLinhas();

    return () => {
      isMounted = false;
    };
  }, []);

  const grupos = Array.from(
    new Set(linhasPesquisa.map((linha) => linha.grupo).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const categories = [
    { id: "todos", label: "Todas", icon: <FaFilter /> },
    ...grupos.map((grupo) => ({
      id: grupo,
      label: grupo,
      icon: <FaFlask />,
    })),
  ];

  const filteredResearch = linhasPesquisa.filter((linha) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      linha.nome.toLowerCase().includes(search) ||
      linha.grupo.toLowerCase().includes(search) ||
      linha.pesquisadores.some((pesquisador) =>
        pesquisador.toLowerCase().includes(search)
      );

    const matchesFilter = activeFilter === "todos" || linha.grupo === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const pesquisadoresUnicos = new Set(
    linhasPesquisa.flatMap((linha) => linha.pesquisadores)
  ).size;

  const stats = {
    total: linhasPesquisa.length,
    grupos: grupos.length,
    pesquisadores: pesquisadoresUnicos,
  };

  return (
    <div className={styles.pesquisasContainer}>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <div className={styles.heroBadge}>
              <span>Linhas de Pesquisa</span>
            </div>
            <h1 className={styles.heroTitle}>
              Pesquisas do <span className={styles.highlight}>GIEPI</span>
            </h1>
            <p className={styles.heroDescription}>
              Linhas reais cadastradas no banco de dados, com grupos e pesquisadores
              vinculados ao cadastro do GIEPI.
            </p>

            <div className={styles.heroStats}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FaBookOpen />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stats.total}</div>
                  <div className={styles.statLabel}>Linhas Ativas</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FaFlask />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stats.grupos}</div>
                  <div className={styles.statLabel}>Grupos/Áreas</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FaGraduationCap />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stats.pesquisadores}</div>
                  <div className={styles.statLabel}>Pesquisadores</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.filtersSection}>
        <div className={styles.container}>
          <div className={styles.searchContainer}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar por linha, grupo ou pesquisador..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filterButtons}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`${styles.filterButton} ${
                    activeFilter === category.id ? styles.active : ""
                  }`}
                  onClick={() => setActiveFilter(category.id)}
                  type="button"
                >
                  <span className={styles.filterIcon}>{category.icon}</span>
                  <span className={styles.filterLabel}>{category.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.researchSection}>
        <div className={styles.container}>
          {loading && (
            <div className={styles.loadingState}>
              <FaFlask className={styles.loadingIcon} />
              <p>Carregando linhas de pesquisa...</p>
            </div>
          )}

          {!loading && errorMessage && (
            <div className={styles.errorState}>
              <FaExclamationTriangle />
              <p>{errorMessage}</p>
            </div>
          )}

          {!loading && !errorMessage && (
            <div className={styles.researchGrid}>
              {filteredResearch.map((linha) => (
                <div
                  key={linha.id}
                  className={styles.researchCard}
                  onClick={() =>
                    setExpandedResearch(expandedResearch === linha.id ? null : linha.id)
                  }
                >
                  <div className={styles.researchImage}>
                    <img
                      src={linha.image}
                      alt={`Linha de pesquisa: ${linha.nome}`}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = DEFAULT_LINHA_IMAGE;
                      }}
                    />
                  </div>

                  <div className={styles.cardHeader}>
                    <div className={styles.categoryBadge}>
                      <span className={styles.categoryIcon}>
                        <FaFlask />
                      </span>
                      <span className={styles.categoryText}>{linha.grupo}</span>
                    </div>
                    <div className={`${styles.statusBadge} ${styles.statusActive}`}>
                      Ativa
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <h3 className={styles.researchTitle}>{linha.nome}</h3>

                    <div className={styles.researchMeta}>
                      <div className={styles.metaItem}>
                        <FaUsers />
                        <span>
                          {linha.totalPesquisadores === 1
                            ? "1 pesquisador"
                            : `${linha.totalPesquisadores} pesquisadores`}
                        </span>
                      </div>
                    </div>

                    <div className={styles.researchersPreview}>
                      {linha.pesquisadores.slice(0, 3).map((pesquisador) => (
                        <a
                          key={pesquisador}
                          href={createResearcherHref(pesquisador)}
                          className={styles.researcherLink}
                          onClick={(event) => event.stopPropagation()}
                        >
                          {pesquisador}
                        </a>
                      ))}
                      {linha.pesquisadores.length === 0 && (
                        <span>Sem pesquisador vinculado</span>
                      )}
                      {linha.totalPesquisadores > 3 && (
                        <span>+{linha.totalPesquisadores - 3}</span>
                      )}
                    </div>

                    {expandedResearch === linha.id && (
                      <div className={styles.expandedContent}>
                        <div className={styles.researchDescription}>
                          <h4>Pesquisadores vinculados</h4>
                          {linha.pesquisadores.length > 0 ? (
                            <div className={styles.researchersList}>
                              {linha.pesquisadores.map((pesquisador) => (
                                <a
                                  key={pesquisador}
                                  href={createResearcherHref(pesquisador)}
                                  className={`${styles.researcherTag} ${styles.researcherLink}`}
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  {pesquisador}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <p>Nenhum pesquisador vinculado a esta linha.</p>
                          )}
                        </div>

                        <div className={styles.detailsGrid}>
                          <div className={styles.detailItem}>
                            <strong>Grupo/Área:</strong>
                            <span>{linha.grupo}</span>
                          </div>
                          <div className={styles.detailItem}>
                            <strong>Status:</strong>
                            <span>Ativa</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.cardFooter}>
                    <button className={styles.readMoreButton} type="button">
                      {expandedResearch === linha.id ? "Mostrar menos" : "Ver pesquisadores"}
                      <FaArrowRight className={styles.arrowIcon} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !errorMessage && filteredResearch.length === 0 && (
            <div className={styles.noResults}>
              <FaSearch className={styles.noResultsIcon} />
              <h3>Nenhuma linha encontrada</h3>
              <p>Tente alterar os termos da busca ou selecione outro grupo.</p>
            </div>
          )}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>Quer conhecer quem pesquisa no GIEPI?</h2>
            <p>
              A equipe pública reúne os pesquisadores, estudantes e colaboradores cadastrados
              no sistema.
            </p>
            <div className={styles.ctaButtons}>
              <a href="/equipe" className={styles.ctaButtonPrimary}>
                Conhecer a equipe
              </a>
              <a href="/projetos" className={styles.ctaButtonSecondary}>
                Ver projetos
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
