import { useEffect, useState } from "react";
import {
  FaBookOpen,
  FaChartLine,
  FaFlask,
  FaGraduationCap,
  FaHandshake,
  FaLightbulb,
  FaProjectDiagram,
  FaUsers,
} from "react-icons/fa";
import ComunicadosModal from "../components/ComunicadosModal";
import { carregarLinhasPublicas } from "../services/linhasPublicas.service";
import { projetosService } from "../services/projetos.service";
import { DEFAULT_LINHA_IMAGE, getLinhaImage } from "../utils/linhaImages";
import { createResearcherHref } from "../utils/researcherLinks";
import "../styles/Home.css";

export default function Home() {
  const [linhasPesquisa, setLinhasPesquisa] = useState([]);
  const [linhasLoading, setLinhasLoading] = useState(true);
  const [linhasError, setLinhasError] = useState("");
  const [projetosPublicos, setProjetosPublicos] = useState([]);
  const [projetosLoading, setProjetosLoading] = useState(true);
  const [projetosError, setProjetosError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function carregarLinhas() {
      try {
        setLinhasLoading(true);
        const linhas = await carregarLinhasPublicas();

        if (isMounted) {
          setLinhasPesquisa(linhas);
          setLinhasError("");
        }
      } catch (error) {
        console.error("Erro ao carregar linhas publicas:", error);

        if (isMounted) {
          setLinhasError("Não foi possível carregar as linhas de pesquisa agora.");
        }
      } finally {
        if (isMounted) {
          setLinhasLoading(false);
        }
      }
    }

    carregarLinhas();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function carregarProjetos() {
      try {
        setProjetosLoading(true);
        const data = await projetosService.buscarPublicos();

        if (isMounted) {
          setProjetosPublicos(data?.projetos || []);
          setProjetosError("");
        }
      } catch (error) {
        console.error("Erro ao carregar projetos publicos:", error);

        if (isMounted) {
          setProjetosError("Não foi possível carregar os projetos agora.");
        }
      } finally {
        if (isMounted) {
          setProjetosLoading(false);
        }
      }
    }

    carregarProjetos();

    return () => {
      isMounted = false;
    };
  }, []);

  const linhasDestaque = linhasPesquisa.slice(0, 3);
  const projetosDestaque = projetosPublicos.slice(0, 3).map((projeto, index) => ({
    id: projeto.id,
    image:
      projeto.imagem_url ||
      getLinhaImage(
        [projeto.titulo, projeto.area, projeto.linha_nome, projeto.linha_grupo],
        index
      ),
    status: projeto.status,
    title: projeto.titulo,
    text: projeto.descricao || "Sem descrição cadastrada.",
    tags: [projeto.area, projeto.linha_nome, projeto.status].filter(Boolean).slice(0, 3),
  }));

  return (
    <>
      <ComunicadosModal />

      <section className="hero-section">
        <div className="hero-background">
          <video autoPlay loop muted playsInline className="hero-video">
            <source src="/img/videohero.mp4" type="video/mp4" />
          </video>
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-brand" aria-label="GIEPI">
              <img src="/img/header.png" alt="" className="hero-logo" />
              <span className="hero-kicker">IFMA Campus Codó</span>
            </div>
            <h1 className="hero-title">Grupo Interdisciplinar em Ensino, Pesquisa e Inovação</h1>
            <p className="hero-subtitle">
              Pesquisa aplicada, formação científica e projetos de inovação voltados ao
              desenvolvimento regional.
            </p>
            <div className="hero-buttons">
              <a href="/sobre" className="btn btn-primary">
                <FaFlask /> Conhecer o GIEPI
              </a>
              <a href="/projetos" className="btn btn-outline">
                <FaProjectDiagram /> Ver projetos
              </a>
            </div>
          </div>

          <div className="hero-stats" aria-label="Indicadores do grupo">
            <div className="stat-card">
              <FaUsers className="stat-icon" />
              <div className="stat-content">
                <h3>50+</h3>
                <p>Pesquisadores</p>
              </div>
            </div>
            <div className="stat-card">
              <FaProjectDiagram className="stat-icon" />
              <div className="stat-content">
                <h3>30+</h3>
                <p>Projetos</p>
              </div>
            </div>
            <div className="stat-card">
              <FaBookOpen className="stat-icon" />
              <div className="stat-content">
                <h3>100+</h3>
                <p>Publicações</p>
              </div>
            </div>
            <div className="stat-card">
              <FaGraduationCap className="stat-icon" />
              <div className="stat-content">
                <h3>200+</h3>
                <p>Estudantes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="sobre" className="section sobre-section">
        <div className="container">
          <span className="section-tag sobre">Sobre o grupo</span>
          <div className="section-header">
            <h2 className="section-title">Pesquisa com compromisso institucional</h2>
            <p className="section-subtitle">
              O GIEPI articula ensino, pesquisa, inovação e extensão para produzir
              conhecimento útil ao território.
            </p>
          </div>

          <div className="sobre-content">
            <div className="sobre-text">
              <h3>Atuação integrada no IFMA Campus Codó</h3>
              <p>
                O grupo reúne docentes, estudantes e colaboradores em projetos que
                aproximam ciência, tecnologia e demandas sociais.
              </p>
              <p>
                A produção do GIEPI busca fortalecer a formação acadêmica, apoiar
                iniciativas institucionais e ampliar o impacto da pesquisa no Maranhão.
              </p>
              <div className="sobre-actions">
                <a href="/sobre" className="btn btn-secondary">
                  <FaUsers /> Sobre nós
                </a>
                <a href="/equipe" className="btn btn-light">
                  <FaGraduationCap /> Ver equipe
                </a>
              </div>

              <div className="features-grid">
                <div className="feature">
                  <div className="feature-icon">
                    <FaLightbulb />
                  </div>
                  <div className="feature-content">
                    <h4>Inovação aplicada</h4>
                    <p>Soluções construídas a partir de necessidades reais de ensino e pesquisa.</p>
                  </div>
                </div>

                <div className="feature">
                  <div className="feature-icon">
                    <FaGraduationCap />
                  </div>
                  <div className="feature-content">
                    <h4>Formação científica</h4>
                    <p>Participação de estudantes em práticas de investigação e produção acadêmica.</p>
                  </div>
                </div>

                <div className="feature">
                  <div className="feature-icon">
                    <FaChartLine />
                  </div>
                  <div className="feature-content">
                    <h4>Resultados mensuráveis</h4>
                    <p>Organização de projetos, indicadores e publicações do grupo.</p>
                  </div>
                </div>

                <div className="feature">
                  <div className="feature-icon">
                    <FaHandshake />
                  </div>
                  <div className="feature-content">
                    <h4>Cooperação</h4>
                    <p>Atuação conjunta com instituições, comunidade acadêmica e parceiros.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sobre-image">
              <div className="image-frame">
                <img src="/img/microscopiopaisagem1.jpeg" alt="Laboratório de pesquisa do IFMA" />
                <div className="image-badge">
                  <span>GIEPI</span>
                  <strong>Ensino, pesquisa e inovação</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section linhas-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Atuação</span>
            <h2 className="section-title">Linhas de pesquisa</h2>
            <p className="section-subtitle">
              Linhas ativas cadastradas no banco, com pesquisadores vinculados ao grupo.
            </p>
          </div>

          <div className="linhas-grid">
            {linhasLoading && (
              <div className="linhas-feedback">Carregando linhas de pesquisa...</div>
            )}

            {!linhasLoading && linhasError && (
              <div className="linhas-feedback error">{linhasError}</div>
            )}

            {!linhasLoading && !linhasError && linhasDestaque.length === 0 && (
              <div className="linhas-feedback">Nenhuma linha de pesquisa ativa cadastrada.</div>
            )}

            {!linhasLoading && !linhasError && linhasDestaque.map((linha) => (
              <article className="linha-card" key={linha.id}>
                <div className="linha-image">
                  <img
                    src={linha.image}
                    alt={`Linha de pesquisa: ${linha.nome}`}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = DEFAULT_LINHA_IMAGE;
                    }}
                  />
                </div>
                <div className="linha-body">
                  <div className="linha-header">
                    <span className="linha-category">{linha.grupo}</span>
                  </div>
                  <h3>{linha.nome}</h3>
                  <div className="linha-researchers-summary">
                    <FaUsers />
                    <span>
                      {linha.totalPesquisadores === 1
                        ? "1 pesquisador vinculado"
                        : `${linha.totalPesquisadores} pesquisadores vinculados`}
                    </span>
                  </div>
                  <ul className="linha-topics">
                    {linha.pesquisadores.slice(0, 3).map((pesquisador) => (
                      <li key={pesquisador}>
                        <a href={createResearcherHref(pesquisador)}>{pesquisador}</a>
                      </li>
                    ))}
                    {linha.pesquisadores.length === 0 && (
                      <li>Sem pesquisador vinculado</li>
                    )}
                    {linha.totalPesquisadores > 3 && (
                      <li>+{linha.totalPesquisadores - 3}</li>
                    )}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="projetos" className="section projetos-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Projetos</span>
            <h2 className="section-title">Projetos em destaque</h2>
            <p className="section-subtitle">
              Uma visão objetiva das frentes de trabalho do GIEPI.
            </p>
          </div>

          <div className="projetos-grid">
            {projetosLoading && (
              <div className="linhas-feedback">Carregando projetos em destaque...</div>
            )}

            {!projetosLoading && projetosError && (
              <div className="linhas-feedback error">{projetosError}</div>
            )}

            {!projetosLoading && !projetosError && projetosDestaque.length === 0 && (
              <div className="linhas-feedback">Nenhum projeto publicado cadastrado.</div>
            )}

            {!projetosLoading &&
              !projetosError &&
              projetosDestaque.map((projeto) => (
                <article className="projeto-card" key={projeto.id}>
                  <div className="projeto-image">
                    <img
                      src={projeto.image}
                      alt={projeto.title}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = DEFAULT_LINHA_IMAGE;
                      }}
                    />
                    <div className="projeto-badge">{projeto.status}</div>
                  </div>
                  <div className="projeto-content">
                    <h3>{projeto.title}</h3>
                    <p>{projeto.text}</p>
                    <div className="projeto-meta">
                      {projeto.tags.map((tag) => (
                        <span className="projeto-tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <a href="/projetos" className="projeto-link">
                      Ver detalhes
                    </a>
                  </div>
                </article>
              ))}
          </div>

          <div className="section-cta">
            <a href="/projetos" className="btn btn-secondary">
              <FaProjectDiagram /> Ver todos os projetos
            </a>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Conheça a equipe e a produção do grupo</h2>
            <p>
              Acompanhe projetos, linhas de pesquisa e publicações desenvolvidas no
              âmbito do GIEPI.
            </p>
            <div className="cta-buttons">
              <a href="/equipe" className="btn btn-primary btn-large">
                <FaUsers /> Equipe
              </a>
              <a href="/publicacoes" className="btn btn-outline btn-large">
                <FaBookOpen /> Publicações
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
