import React from "react";
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
import "../styles/Home.css";

const linhasPesquisa = [
  {
    icon: <FaFlask />,
    category: "Ensino e pesquisa",
    title: "Educação, ciência e tecnologia",
    text: "Estudos voltados à formação científica, práticas de ensino e produção de conhecimento aplicado.",
    topics: ["Formação docente", "Metodologias de ensino", "Pesquisa aplicada"],
  },
  {
    icon: <FaProjectDiagram />,
    category: "Inovação",
    title: "Soluções para problemas reais",
    text: "Projetos desenvolvidos em diálogo com o território, instituições parceiras e demandas sociais.",
    topics: ["Extensão", "Tecnologia social", "Parcerias"],
  },
  {
    icon: <FaChartLine />,
    category: "Gestão do conhecimento",
    title: "Indicadores e produção científica",
    text: "Organização de dados, publicações e resultados para apoiar decisões acadêmicas e institucionais.",
    topics: ["Publicações", "Indicadores", "Comunicação científica"],
  },
];

const projetosDestaque = [
  {
    image: "/img/laboratoriopaisagem1.jpeg",
    status: "Em andamento",
    title: "Pesquisa aplicada no IFMA Campus Codó",
    text: "Ações integradas de ensino, pesquisa e inovação com participação de docentes, estudantes e colaboradores.",
    tags: ["Pesquisa", "Formação", "IFMA"],
  },
  {
    image: "/img/equipamentospaisagem1.jpeg",
    status: "Institucional",
    title: "Laboratórios e infraestrutura",
    text: "Uso de equipamentos e ambientes de pesquisa para fortalecer projetos acadêmicos e tecnológicos.",
    tags: ["Laboratório", "Tecnologia", "Ensino"],
  },
  {
    image: "/img/orgaospaisagem.jpeg",
    status: "Parcerias",
    title: "Integração com instituições e comunidade",
    text: "Projetos construídos com foco em impacto regional, cooperação técnica e desenvolvimento social.",
    tags: ["Extensão", "Comunidade", "Cooperação"],
  },
];

export default function Home() {
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
            <span className="hero-kicker">IFMA Campus Codó</span>
            <h1 className="hero-title">Grupo Interdisciplinar em Ensino, Pesquisa e Inovação</h1>
            <p className="hero-subtitle">
              Pesquisa aplicada, formação científica e projetos de inovação voltados ao
              desenvolvimento regional.
            </p>
            <div className="hero-buttons">
              <a href="#sobre" className="btn btn-primary">
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
              Eixos que organizam os projetos e a produção acadêmica do grupo.
            </p>
          </div>

          <div className="linhas-grid">
            {linhasPesquisa.map((linha) => (
              <article className="linha-card" key={linha.title}>
                <div className="linha-header">
                  <div className="linha-icon">{linha.icon}</div>
                  <span className="linha-category">{linha.category}</span>
                </div>
                <h3>{linha.title}</h3>
                <p>{linha.text}</p>
                <ul className="linha-topics">
                  {linha.topics.map((topic) => (
                    <li key={topic}>{topic}</li>
                  ))}
                </ul>
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
            {projetosDestaque.map((projeto) => (
              <article className="projeto-card" key={projeto.title}>
                <div className="projeto-image">
                  <img src={projeto.image} alt={projeto.title} />
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
