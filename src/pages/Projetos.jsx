import { useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaBookOpen,
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaGraduationCap,
  FaSearch,
  FaUserFriends,
} from "react-icons/fa";
import { projetosService } from "../services/projetos.service";
import { DEFAULT_LINHA_IMAGE, getLinhaImage } from "../utils/linhaImages";
import styles from "../styles/Projetos.module.css";

function uniqueValues(values) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    String(a).localeCompare(String(b), "pt-BR")
  );
}

function getProjectImage(project, index) {
  return (
    project.imagem_url ||
    getLinhaImage(
      [project.titulo, project.area, project.linha_nome, project.linha_grupo, project.descricao],
      index
    )
  );
}

function getProjectTags(project) {
  const partnerTags = (project.parceiros || []).map((parceiro) => parceiro.nome);
  return uniqueValues([
    project.area,
    project.linha_nome,
    project.linha_grupo,
    project.status,
    ...partnerTags,
  ]).slice(0, 6);
}

function getParticipantCount(project) {
  return (project.coordenador_id ? 1 : 0) + (project.estudantes?.length || 0);
}

function getParticipantLabel(project) {
  const total = getParticipantCount(project);
  if (!total) return "Equipe a definir";
  return total === 1 ? "1 participante" : `${total} participantes`;
}

function getStatusClass(status) {
  if (status === "Finalizado") return styles.statusCompleted;
  if (status === "Planejado") return styles.statusPlanned;
  return styles.statusActive;
}

export default function Projetos() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeArea, setActiveArea] = useState("Todos");
  const [activeStatus, setActiveStatus] = useState("Todos");
  const [activeYear, setActiveYear] = useState("Todos");
  const [expandedProject, setExpandedProject] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function carregarProjetos() {
      try {
        setLoading(true);
        const data = await projetosService.buscarPublicos();

        if (mounted) {
          setProjects(data?.projetos || []);
          setError("");
        }
      } catch (requestError) {
        console.error("Erro ao carregar projetos:", requestError);
        if (mounted) {
          setError("Nao foi possivel carregar os projetos agora.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    carregarProjetos();

    return () => {
      mounted = false;
    };
  }, []);

  const areas = useMemo(
    () => ["Todos", ...uniqueValues(projects.map((project) => project.area || project.linha_nome))],
    [projects]
  );

  const statuses = useMemo(
    () => ["Todos", ...uniqueValues(projects.map((project) => project.status))],
    [projects]
  );

  const years = useMemo(
    () =>
      [
        "Todos",
        ...uniqueValues(projects.map((project) => project.ano).filter(Boolean)).sort(
          (a, b) => Number(b) - Number(a)
        ),
      ],
    [projects]
  );

  const filteredProjects = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return projects.filter((project) => {
      const searchable = [
        project.titulo,
        project.descricao,
        project.area,
        project.linha_nome,
        project.linha_grupo,
        project.coordenador_nome,
        ...(project.estudantes || []).map((estudante) => estudante.nome),
        ...(project.parceiros || []).map((parceiro) => parceiro.nome),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !search || searchable.includes(search);
      const matchesArea =
        activeArea === "Todos" || project.area === activeArea || project.linha_nome === activeArea;
      const matchesStatus = activeStatus === "Todos" || project.status === activeStatus;
      const matchesYear = activeYear === "Todos" || String(project.ano) === String(activeYear);

      return matchesSearch && matchesArea && matchesStatus && matchesYear;
    });
  }, [activeArea, activeStatus, activeYear, projects, searchTerm]);

  const stats = useMemo(
    () => ({
      total: projects.length,
      emAndamento: projects.filter((project) => project.status === "Em andamento").length,
      finalizados: projects.filter((project) => project.status === "Finalizado").length,
      participantes: projects.reduce((acc, project) => acc + getParticipantCount(project), 0),
    }),
    [projects]
  );

  return (
    <div className={styles.projetosContainer}>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <div className={styles.heroBadge}>
              <span>Inovacao e Pesquisa</span>
            </div>
            <h1 className={styles.heroTitle}>
              Projetos <span className={styles.highlight}>Cientificos</span>
            </h1>
            <p className={styles.heroDescription}>
              Projetos cadastrados no sistema do GIEPI, com dados vindos diretamente do
              backend administrativo.
            </p>

            <div className={styles.heroStats}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FaBookOpen />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{loading ? "..." : stats.total}</div>
                  <div className={styles.statLabel}>Projetos</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FaCalendarAlt />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{loading ? "..." : stats.emAndamento}</div>
                  <div className={styles.statLabel}>Em andamento</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FaGraduationCap />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{loading ? "..." : stats.participantes}</div>
                  <div className={styles.statLabel}>Participantes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.filtersSection}>
        <div className={styles.container}>
          <div className={styles.filtersContent}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar projetos, pesquisadores, estudantes ou parceiros..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filterSelects}>
              <select
                value={activeArea}
                onChange={(event) => setActiveArea(event.target.value)}
                className={styles.filterSelect}
              >
                {areas.map((area) => (
                  <option key={area} value={area}>
                    {area === "Todos" ? "Todas as areas" : area}
                  </option>
                ))}
              </select>

              <select
                value={activeStatus}
                onChange={(event) => setActiveStatus(event.target.value)}
                className={styles.filterSelect}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "Todos" ? "Todos os status" : status}
                  </option>
                ))}
              </select>

              <select
                value={activeYear}
                onChange={(event) => setActiveYear(event.target.value)}
                className={styles.filterSelect}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year === "Todos" ? "Todos os anos" : year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.projectsSection}>
        <div className={styles.container}>
          {loading && (
            <div className={styles.noResults}>
              <FaSearch className={styles.noResultsIcon} />
              <h3>Carregando projetos</h3>
              <p>Buscando os dados cadastrados no painel administrativo.</p>
            </div>
          )}

          {!loading && error && (
            <div className={styles.noResults}>
              <FaSearch className={styles.noResultsIcon} />
              <h3>Erro ao carregar</h3>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className={styles.projectsGrid}>
                {filteredProjects.map((project, index) => {
                  const tags = getProjectTags(project);
                  const image = getProjectImage(project, index);

                  return (
                    <article
                      key={project.id}
                      className={`${styles.projectCard} ${
                        expandedProject === project.id ? styles.expanded : ""
                      }`}
                      onClick={() =>
                        setExpandedProject(expandedProject === project.id ? null : project.id)
                      }
                    >
                      <div className={styles.projectImage}>
                        <img
                          src={image}
                          alt={project.titulo}
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = DEFAULT_LINHA_IMAGE;
                          }}
                        />
                        <div className={`${styles.statusBadge} ${getStatusClass(project.status)}`}>
                          {project.status}
                        </div>
                        <div className={styles.categoryBadge}>
                          {project.area || project.linha_nome || "Projeto"}
                        </div>
                      </div>

                      <div className={styles.projectContent}>
                        <h3 className={styles.projectTitle}>{project.titulo}</h3>
                        <p className={styles.projectExcerpt}>
                          {project.descricao || "Sem descricao cadastrada."}
                        </p>

                        <div className={styles.projectMeta}>
                          <div className={styles.metaItem}>
                            <FaCalendarAlt />
                            <span>{project.ano || "Ano nao informado"}</span>
                          </div>
                          <div className={styles.metaItem}>
                            <FaUserFriends />
                            <span>{getParticipantLabel(project)}</span>
                          </div>
                          {project.parceiros?.length > 0 && (
                            <div className={styles.metaItem}>
                              <FaBookOpen />
                              <span>{project.parceiros.length} parceiro(s)</span>
                            </div>
                          )}
                        </div>

                        {tags.length > 0 && (
                          <div className={styles.tagsContainer}>
                            {tags.slice(0, 3).map((tag) => (
                              <span key={tag} className={styles.tag}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {expandedProject === project.id && (
                          <div className={styles.expandedDetails}>
                            <div className={styles.detailsSection}>
                              <h4>Descricao detalhada</h4>
                              <p>{project.descricao || "Sem descricao detalhada cadastrada."}</p>
                            </div>

                            {project.resultados && (
                              <div className={styles.detailsSection}>
                                <h4>Resultados</h4>
                                <p>{project.resultados}</p>
                              </div>
                            )}

                            <div className={styles.detailsGrid}>
                              <div className={styles.detailItem}>
                                <strong>Coordenador</strong>
                                <span>{project.coordenador_nome || "Nao informado"}</span>
                              </div>
                              <div className={styles.detailItem}>
                                <strong>Linha/Area</strong>
                                <span>
                                  {project.linha_nome || project.area || "Nao informada"}
                                </span>
                              </div>
                              <div className={styles.detailItem}>
                                <strong>Estudantes</strong>
                                <span>
                                  {project.estudantes?.length
                                    ? project.estudantes.map((estudante) => estudante.nome).join(", ")
                                    : "Nao informado"}
                                </span>
                              </div>
                              <div className={styles.detailItem}>
                                <strong>Parceiros</strong>
                                <span>
                                  {project.parceiros?.length
                                    ? project.parceiros.map((parceiro) => parceiro.nome).join(", ")
                                    : "Nao informado"}
                                </span>
                              </div>
                              {project.mostrar_orcamento_publico && project.orcamento && (
                                <div className={styles.detailItem}>
                                  <strong>Orcamento</strong>
                                  <span>{project.orcamento}</span>
                                </div>
                              )}
                            </div>

                            {tags.length > 0 && (
                              <div className={styles.fullTagsContainer}>
                                {tags.map((tag) => (
                                  <span key={tag} className={styles.tag}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {project.link_externo && (
                              <a
                                href={project.link_externo}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.externalLink}
                                onClick={(event) => event.stopPropagation()}
                              >
                                <FaExternalLinkAlt />
                                Abrir link externo
                              </a>
                            )}
                          </div>
                        )}

                        <div className={styles.projectActions}>
                          <button className={styles.detailsButton} type="button">
                            {expandedProject === project.id ? "Mostrar menos" : "Ver detalhes"}
                            <FaArrowRight className={styles.arrowIcon} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {filteredProjects.length === 0 && (
                <div className={styles.noResults}>
                  <FaSearch className={styles.noResultsIcon} />
                  <h3>Nenhum projeto encontrado</h3>
                  <p>
                    {projects.length === 0
                      ? "Nenhum projeto publicado foi cadastrado no painel administrativo."
                      : "Tente alterar os filtros ou buscar por outro termo."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>Quer desenvolver um projeto conosco?</h2>
            <p>
              Estamos abertos a parcerias e colaboracoes. Se voce tem uma ideia de
              projeto ou deseja colaborar com nossas pesquisas, entre em contato.
            </p>
            <div className={styles.ctaButtons}>
              <a href="/equipe" className={styles.ctaButtonPrimary}>
                Conhecer a equipe
              </a>
              <a href="/publicacoes" className={styles.ctaButtonSecondary}>
                Ver publicacoes
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
