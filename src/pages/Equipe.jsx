import { useEffect, useMemo, useState } from "react";
import {
  FaChalkboardTeacher,
  FaChevronDown,
  FaChevronUp,
  FaEnvelope,
  FaExclamationTriangle,
  FaFilter,
  FaFlask,
  FaGraduationCap,
  FaIdCard,
  FaSearch,
  FaUniversity,
  FaUserGraduate,
  FaUserTie,
  FaUsers,
} from "react-icons/fa";
import { carregarMembrosPublicos } from "../services/membrosPublicos.service";
import { createResearcherAnchor } from "../utils/researcherLinks";
import styles from "../styles/equipe.module.css";

const CATEGORY_CONFIG = {
  pesquisador: {
    label: "Pesquisadores",
    singular: "Pesquisador",
    icon: <FaChalkboardTeacher />,
  },
  estudante: {
    label: "Estudantes",
    singular: "Estudante",
    icon: <FaUserGraduate />,
  },
  aluno: {
    label: "Estudantes",
    singular: "Estudante",
    icon: <FaUserGraduate />,
  },
  colaborador: {
    label: "Colaboradores",
    singular: "Colaborador",
    icon: <FaUserTie />,
  },
};

function getCategoryConfig(tipoVinculo) {
  return CATEGORY_CONFIG[tipoVinculo] || CATEGORY_CONFIG.pesquisador;
}

function formatDate(dateValue) {
  if (!dateValue) return "Nao informada";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime()) || date.getFullYear() < 1950) {
    return "Nao informada";
  }

  return date.toLocaleDateString("pt-BR", {
    month: "2-digit",
    year: "numeric",
  });
}

function formatMemberBio(member) {
  if (member.resumo) {
    return member.resumo.length > 220 ? `${member.resumo.slice(0, 220)}...` : member.resumo;
  }

  return `${member.titulacao}. Vinculado a ${
    member.linhasPesquisa.length === 1
      ? "1 linha de pesquisa"
      : `${member.linhasPesquisa.length} linhas de pesquisa`
  }.`;
}

export default function Equipe() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [activeMember, setActiveMember] = useState(null);
  const [expandedBio, setExpandedBio] = useState(null);
  const [highlightedAnchor, setHighlightedAnchor] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function carregarEquipe() {
      try {
        setLoading(true);
        const membros = await carregarMembrosPublicos();

        if (isMounted) {
          setTeamMembers(membros);
          setErrorMessage("");
        }
      } catch (error) {
        console.error("Erro ao carregar equipe publica:", error);

        if (isMounted) {
          setErrorMessage("Nao foi possivel carregar a equipe agora.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    carregarEquipe();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (loading || teamMembers.length === 0) return undefined;
    const timeoutIds = [];

    function forceScrollToAnchor(anchor, attempt = 0) {
      const element = document.getElementById(anchor);

      if (element) {
        const rect = element.getBoundingClientRect();
        const top =
          rect.top + window.scrollY - Math.max(80, (window.innerHeight - rect.height) / 2);
        const nextTop = Math.max(0, top);

        document.documentElement.scrollTop = nextTop;
        document.body.scrollTop = nextTop;
        window.scrollTo(0, nextTop);
        return;
      }

      if (attempt < 12) {
        const timeoutId = window.setTimeout(
          () => forceScrollToAnchor(anchor, attempt + 1),
          150
        );
        timeoutIds.push(timeoutId);
      }
    }

    function scrollToHashMember() {
      const anchor = decodeURIComponent(window.location.hash.replace("#", ""));
      if (!anchor) return;

      setSearchTerm("");
      setSelectedCategory("todos");
      setHighlightedAnchor(anchor);
      forceScrollToAnchor(anchor);
    }

    scrollToHashMember();
    window.addEventListener("hashchange", scrollToHashMember);

    return () => {
      window.removeEventListener("hashchange", scrollToHashMember);
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [loading, teamMembers.length]);

  const categories = useMemo(() => {
    const categoryCounts = teamMembers.reduce((acc, member) => {
      acc[member.tipoVinculo] = (acc[member.tipoVinculo] || 0) + 1;
      return acc;
    }, {});

    return [
      { id: "todos", label: "Todos", icon: <FaUsers />, count: teamMembers.length },
      ...Object.entries(categoryCounts).map(([id, count]) => ({
        id,
        label: getCategoryConfig(id).label,
        icon: getCategoryConfig(id).icon,
        count,
      })),
    ];
  }, [teamMembers]);

  const researchAreas = useMemo(() => {
    const counts = new Map();

    teamMembers.forEach((member) => {
      member.gruposPesquisa.forEach((grupo) => {
        counts.set(grupo, (counts.get(grupo) || 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 5)
      .map(([label, count]) => ({ label, count }));
  }, [teamMembers]);

  const filteredMembers = teamMembers.filter((member) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      member.nome.toLowerCase().includes(search) ||
      member.tipoVinculo.toLowerCase().includes(search) ||
      member.titulacao.toLowerCase().includes(search) ||
      member.areaPrincipal.toLowerCase().includes(search) ||
      member.linhasPesquisa.some((linha) => linha.toLowerCase().includes(search)) ||
      member.gruposPesquisa.some((grupo) => grupo.toLowerCase().includes(search));

    const matchesCategory =
      selectedCategory === "todos" || member.tipoVinculo === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: teamMembers.length,
    pesquisadores: teamMembers.filter((member) => member.tipoVinculo === "pesquisador").length,
    estudantes: teamMembers.filter((member) =>
      ["estudante", "aluno"].includes(member.tipoVinculo)
    ).length,
    colaboradores: teamMembers.filter((member) => member.tipoVinculo === "colaborador").length,
  };

  return (
    <div className={styles.equipeContainer}>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Nossa <span className={styles.highlight}>Equipe</span>
            </h1>
            <p className={styles.heroDescription}>
              Conheça os pesquisadores, estudantes e colaboradores cadastrados no GIEPI.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>{stats.total}</div>
                <div className={styles.statLabel}>Membros</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>{stats.pesquisadores}</div>
                <div className={styles.statLabel}>Pesquisadores</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>{stats.estudantes}</div>
                <div className={styles.statLabel}>Estudantes</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>{stats.colaboradores}</div>
                <div className={styles.statLabel}>Colaboradores</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.areasSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Grupos de Pesquisa</h2>
            <p className={styles.sectionSubtitle}>
              Áreas reais vinculadas aos membros ativos no banco de dados.
            </p>
          </div>

          <div className={styles.areasGrid}>
            {researchAreas.map((area) => (
              <div key={area.label} className={styles.areaCard}>
                <div className={styles.areaIcon}>
                  <FaFlask />
                </div>
                <h3 className={styles.areaTitle}>{area.label}</h3>
                <p className={styles.areaDescription}>
                  {area.count === 1
                    ? "1 membro vinculado"
                    : `${area.count} membros vinculados`}
                </p>
              </div>
            ))}
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
                placeholder="Buscar por nome, linha, grupo ou formação..."
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
                    selectedCategory === category.id ? styles.active : ""
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                  type="button"
                >
                  <span className={styles.filterIcon}>
                    {category.id === "todos" ? <FaFilter /> : category.icon}
                  </span>
                  <span className={styles.filterLabel}>{category.label}</span>
                  <span className={styles.filterCount}>{category.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.membersSection}>
        <div className={styles.container}>
          {loading && (
            <div className={styles.loadingState}>
              <FaFlask />
              <p>Carregando equipe...</p>
            </div>
          )}

          {!loading && errorMessage && (
            <div className={styles.errorState}>
              <FaExclamationTriangle />
              <p>{errorMessage}</p>
            </div>
          )}

          {!loading && !errorMessage && (
            <div className={styles.membersGrid}>
              {filteredMembers.map((member) => {
                const categoryConfig = getCategoryConfig(member.tipoVinculo);
                const anchor = createResearcherAnchor(member.nome);
                const isHighlighted = highlightedAnchor === anchor;

                return (
                  <div
                    id={anchor}
                    key={member.id}
                    className={`${styles.memberCard} ${
                      activeMember === member.id ? styles.active : ""
                    } ${isHighlighted ? styles.highlightedMember : ""}`}
                    onMouseEnter={() => setActiveMember(member.id)}
                    onMouseLeave={() => setActiveMember(null)}
                  >
                    <div className={styles.memberImage}>
                      <div className={styles.imageWrapper}>
                        <img
                          src={member.imagem}
                          alt={member.nome}
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = "/img/equiperetrato.jpeg";
                          }}
                        />
                        <div className={styles.memberCategory}>
                          {categoryConfig.icon}
                          <span>{categoryConfig.singular}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.memberInfo}>
                      <div className={styles.memberHeader}>
                        <h3 className={styles.memberName}>{member.nome}</h3>
                        <p className={styles.memberRole}>
                          {member.cargo || categoryConfig.singular}
                        </p>
                        {member.instituicao && (
                          <p className={styles.memberInstitution}>
                            <FaUniversity /> {member.instituicao}
                          </p>
                        )}
                        <div className={styles.memberArea}>
                          <span className={styles.areaBadge}>{member.areaPrincipal}</span>
                        </div>
                      </div>

                      <div className={styles.memberStats}>
                        <div className={styles.stat}>
                          <span className={styles.statNumber}>
                            {member.linhasPesquisa.length}
                          </span>
                          <span className={styles.statLabel}>Linhas</span>
                        </div>
                        <div className={styles.stat}>
                          <span className={styles.statNumber}>
                            {member.gruposPesquisa.length}
                          </span>
                          <span className={styles.statLabel}>Grupos</span>
                        </div>
                      </div>

                      <div className={styles.memberBio}>
                        <p className={styles.bioText}>{formatMemberBio(member)}</p>
                        <button
                          className={styles.readMore}
                          onClick={() =>
                            setExpandedBio(expandedBio === member.id ? null : member.id)
                          }
                          type="button"
                        >
                          {expandedBio === member.id ? (
                            <>
                              Ver menos <FaChevronUp />
                            </>
                          ) : (
                            <>
                              Ver linhas <FaChevronDown />
                            </>
                          )}
                        </button>
                      </div>

                      {expandedBio === member.id && (
                        <div className={styles.memberDetails}>
                          <div className={styles.detailItem}>
                            <strong>Inclusão:</strong> {formatDate(member.dataInclusao)}
                          </div>
                          {member.ultimaAtualizacaoLattes && (
                            <div className={styles.detailItem}>
                              <strong>Lattes:</strong> {member.ultimaAtualizacaoLattes}
                            </div>
                          )}
                          <div className={styles.areasList}>
                            <strong>Linhas de pesquisa:</strong>
                            <div className={styles.tags}>
                              {member.linhasPesquisa.map((linha) => (
                                <span key={linha} className={styles.tag}>
                                  {linha}
                                </span>
                              ))}
                              {member.linhasPesquisa.length === 0 && (
                                <span className={styles.tag}>Sem linha vinculada</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className={styles.memberContact}>
                        {member.email && (
                          <a href={`mailto:${member.email}`} className={styles.contactLink}>
                            <FaEnvelope /> Email
                          </a>
                        )}
                        {member.lattesUrl && (
                          <a
                            href={member.lattesUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.contactLink}
                          >
                            <FaIdCard /> Lattes
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !errorMessage && filteredMembers.length === 0 && (
            <div className={styles.noResults}>
              <FaSearch className={styles.noResultsIcon} />
              <h3>Nenhum membro encontrado</h3>
              <p>Tente alterar os termos da busca ou os filtros selecionados.</p>
            </div>
          )}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>
              Conheça as <span className={styles.highlight}>linhas</span> do grupo
            </h2>
            <p className={styles.ctaDescription}>
              Veja como cada pesquisador se conecta às linhas de pesquisa cadastradas.
            </p>
            <div className={styles.ctaButtons}>
              <a href="/pesquisas" className={styles.ctaButtonPrimary}>
                Ver pesquisas
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
