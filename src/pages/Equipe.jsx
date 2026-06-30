import { useEffect, useMemo, useState } from "react";
import {
  FaChalkboardTeacher,
  FaChevronDown,
  FaChevronUp,
  FaBookOpen,
  FaBriefcase,
  FaEnvelope,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaFilter,
  FaFlask,
  FaGraduationCap,
  FaIdCard,
  FaProjectDiagram,
  FaSearch,
  FaTimes,
  FaUniversity,
  FaUserFriends,
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

const MAX_DETAIL_ITEMS = 8;

function hasItems(items) {
  return Array.isArray(items) && items.length > 0;
}

function hasDetailContent(details = {}) {
  return [
    details.nomeCitacoes,
    details.formacaoAcademica,
    details.formacaoComplementar,
    details.atuacaoProfissional,
    details.areasAtuacao,
    details.linhasPesquisaLattes,
    details.projetosPesquisa,
    details.producoesBibliograficas,
    details.producoesTecnicas,
    details.orientacoes,
    details.bancas,
    details.eventos,
    details.educacaoPopularizacao,
    details.gruposDgp,
    details.estudantesOrientados,
    details.gruposEgresso,
  ].some(hasItems);
}

function countDetailItems(details = {}) {
  return [
    details.nomeCitacoes,
    details.formacaoAcademica,
    details.formacaoComplementar,
    details.atuacaoProfissional,
    details.areasAtuacao,
    details.linhasPesquisaLattes,
    details.projetosPesquisa,
    details.producoesBibliograficas,
    details.producoesTecnicas,
    details.orientacoes,
    details.bancas,
    details.eventos,
    details.educacaoPopularizacao,
    details.gruposDgp,
    details.estudantesOrientados,
    details.gruposEgresso,
  ].reduce((total, items) => total + (Array.isArray(items) ? items.length : 0), 0);
}

function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural;
}

function DetailList({ title, items, icon }) {
  if (!hasItems(items)) return null;

  const visibleItems = items.slice(0, MAX_DETAIL_ITEMS);
  const hiddenCount = items.length - visibleItems.length;

  return (
    <section className={styles.modalSection}>
      <h4>
        {icon}
        {title}
      </h4>
      <ul className={styles.modalList}>
        {visibleItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
        {hiddenCount > 0 && <li>+ {hiddenCount} registro(s)</li>}
      </ul>
    </section>
  );
}

function DetailObjectList({ title, items, icon, renderMeta }) {
  if (!hasItems(items)) return null;

  const visibleItems = items.slice(0, MAX_DETAIL_ITEMS);
  const hiddenCount = items.length - visibleItems.length;

  return (
    <section className={styles.modalSection}>
      <h4>
        {icon}
        {title}
      </h4>
      <ul className={styles.modalList}>
        {visibleItems.map((item) => (
          <li key={`${item.nome}-${renderMeta(item)}`}>
            <strong>{item.nome}</strong>
            {renderMeta(item) && <span>{renderMeta(item)}</span>}
          </li>
        ))}
        {hiddenCount > 0 && <li>+ {hiddenCount} registro(s)</li>}
      </ul>
    </section>
  );
}

function MemberDetailModal({ member, onClose }) {
  useEffect(() => {
    if (!member) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [member, onClose]);

  if (!member) return null;

  const details = member.detalhesLattes || {};
  const categoryConfig = getCategoryConfig(member.tipoVinculo);
  const hasCurriculumDetails = hasDetailContent(details);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <article
        className={styles.memberModal}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className={styles.modalClose}
          type="button"
          onClick={onClose}
          aria-label="Fechar detalhes"
        >
          <FaTimes />
        </button>

        <header className={styles.modalHeader}>
          <img
            src={member.imagem}
            alt={member.nome}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/img/equiperetrato.jpeg";
            }}
          />
          <div>
            <span className={styles.modalCategory}>{categoryConfig.singular}</span>
            <h3>{member.nome}</h3>
            <p>{member.cargo || member.titulacao}</p>
            {member.instituicao && (
              <span className={styles.modalInstitution}>
                <FaUniversity /> {member.instituicao}
              </span>
            )}
          </div>
        </header>

        <div className={styles.modalActions}>
          {member.email && (
            <a href={`mailto:${member.email}`} className={styles.modalLink}>
              <FaEnvelope /> Email
            </a>
          )}
          {member.lattesUrl && (
            <a
              href={member.lattesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.modalLink}
            >
              <FaIdCard /> Lattes <FaExternalLinkAlt />
            </a>
          )}
          {member.espelhoUrl && (
            <a
              href={member.espelhoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.modalLink}
            >
              <FaBookOpen /> Espelho DGP <FaExternalLinkAlt />
            </a>
          )}
        </div>

        <div className={styles.modalStats}>
          <div>
            <strong>{member.linhasPesquisa.length}</strong>
            <span>Linhas</span>
          </div>
          <div>
            <strong>{member.gruposPesquisa.length || details.gruposDgp?.length || 0}</strong>
            <span>Grupos</span>
          </div>
          <div>
            <strong>{details.estudantesOrientados?.length || 0}</strong>
            <span>Orientados</span>
          </div>
        </div>

        {member.resumo && (
          <section className={styles.modalSection}>
            <h4>
              <FaBookOpen />
              Resumo
            </h4>
            <p className={styles.modalText}>{member.resumo}</p>
          </section>
        )}

        {details.status === "captcha" && (
          <div className={styles.modalNotice}>
            Dados diretos do Lattes protegidos por verificacao. Exibindo informacoes do espelho DGP.
          </div>
        )}

        <div className={styles.modalSectionsGrid}>
          <DetailList
            title="Nome em citações"
            items={details.nomeCitacoes}
            icon={<FaIdCard />}
          />
          <DetailList
            title="Formação acadêmica"
            items={details.formacaoAcademica}
            icon={<FaGraduationCap />}
          />
          <DetailList
            title="Formação complementar"
            items={details.formacaoComplementar}
            icon={<FaGraduationCap />}
          />
          <DetailList
            title="Atuação profissional"
            items={details.atuacaoProfissional}
            icon={<FaBriefcase />}
          />
          <DetailList
            title="Áreas de atuação"
            items={details.areasAtuacao}
            icon={<FaFlask />}
          />
          <DetailList
            title="Linhas no Lattes"
            items={details.linhasPesquisaLattes}
            icon={<FaProjectDiagram />}
          />
          <DetailList
            title="Projetos"
            items={details.projetosPesquisa}
            icon={<FaProjectDiagram />}
          />
          <DetailList
            title="Produção bibliográfica"
            items={details.producoesBibliograficas}
            icon={<FaBookOpen />}
          />
          <DetailList
            title="Produção técnica"
            items={details.producoesTecnicas}
            icon={<FaFlask />}
          />
          <DetailList
            title="Orientações"
            items={details.orientacoes}
            icon={<FaUserFriends />}
          />
          <DetailList title="Bancas" items={details.bancas} icon={<FaUsers />} />
          <DetailList title="Eventos" items={details.eventos} icon={<FaUsers />} />
          <DetailObjectList
            title="Grupos no DGP"
            items={details.gruposDgp}
            icon={<FaUsers />}
            renderMeta={(item) => [item.instituicao, item.perfil].filter(Boolean).join(" - ")}
          />
          <DetailObjectList
            title="Estudantes orientados"
            items={details.estudantesOrientados}
            icon={<FaUserGraduate />}
            renderMeta={(item) =>
              [item.nivel_treinamento, item.grupo_pesquisa].filter(Boolean).join(" - ")
            }
          />
          <DetailObjectList
            title="Grupos de egresso"
            items={details.gruposEgresso}
            icon={<FaUsers />}
            renderMeta={(item) => item.instituicao}
          />
        </div>

        {!hasCurriculumDetails && !member.resumo && (
          <div className={styles.modalNotice}>
            Dados detalhados ainda nao foram coletados para este membro.
          </div>
        )}
      </article>
    </div>
  );
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
  const [selectedMember, setSelectedMember] = useState(null);

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
    curriculos: teamMembers.filter((member) => hasDetailContent(member.detalhesLattes)).length,
  };
  const hasActiveFilters = Boolean(searchTerm.trim()) || selectedCategory !== "todos";

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("todos");
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
              <div className={styles.statItem}>
                <div className={styles.statNumber}>{stats.curriculos}</div>
                <div className={styles.statLabel}>Currículos</div>
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

          {researchAreas.length > 0 ? (
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
          ) : (
            <div className={styles.areaFallback}>
              <FaFlask />
              <span>Nenhum grupo vinculado aos membros ativos.</span>
            </div>
          )}
        </div>
      </section>

      <section className={styles.filtersSection}>
        <div className={styles.container}>
          <div className={styles.searchContainer}>
            <div className={styles.filtersHeaderLine}>
              <div>
                <span className={styles.filtersEyebrow}>Equipe cadastrada</span>
                <strong>
                  {filteredMembers.length}{" "}
                  {pluralize(filteredMembers.length, "membro encontrado", "membros encontrados")}
                </strong>
              </div>
              {hasActiveFilters && (
                <button
                  className={styles.clearFiltersButton}
                  type="button"
                  onClick={clearFilters}
                >
                  <FaTimes /> Limpar filtros
                </button>
              )}
            </div>

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
                const detailCount = countDetailItems(member.detalhesLattes);
                const hasCurriculum = hasDetailContent(member.detalhesLattes);

                return (
                  <div
                    id={anchor}
                    key={member.id}
                    className={`${styles.memberCard} ${
                      activeMember === member.id ? styles.active : ""
                    } ${isHighlighted ? styles.highlightedMember : ""}`}
                    onMouseEnter={() => setActiveMember(member.id)}
                    onMouseLeave={() => setActiveMember(null)}
                    onClick={() => setSelectedMember(member)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedMember(member);
                      }
                    }}
                    role="button"
                    tabIndex={0}
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
                        <div className={styles.memberMetaRow}>
                          {member.ultimaAtualizacaoLattes && (
                            <span>
                              <FaIdCard /> {member.ultimaAtualizacaoLattes}
                            </span>
                          )}
                          {hasCurriculum && (
                            <span>
                              <FaBookOpen /> Perfil enriquecido
                            </span>
                          )}
                          {member.detalhesLattes?.estudantesOrientados?.length > 0 && (
                            <span>
                              <FaUserFriends /> {member.detalhesLattes.estudantesOrientados.length}
                            </span>
                          )}
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
                        <div className={styles.stat}>
                          <span className={styles.statNumber}>{detailCount}</span>
                          <span className={styles.statLabel}>Dados</span>
                        </div>
                      </div>

                      <div className={styles.memberBio}>
                        <p className={styles.bioText}>{formatMemberBio(member)}</p>
                        <button
                          className={styles.readMore}
                          onClick={(event) => {
                            event.stopPropagation();
                            setExpandedBio(expandedBio === member.id ? null : member.id);
                          }}
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
                        <button
                          className={styles.contactLink}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedMember(member);
                          }}
                        >
                          <FaBookOpen /> Perfil completo
                        </button>
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            className={styles.contactLink}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <FaEnvelope /> Email
                          </a>
                        )}
                        {member.lattesUrl && (
                          <a
                            href={member.lattesUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.contactLink}
                            onClick={(event) => event.stopPropagation()}
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

      <MemberDetailModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
}
