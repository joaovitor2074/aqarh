import {
  FaArrowRight,
  FaBookOpen,
  FaChartLine,
  FaFlask,
  FaGraduationCap,
  FaHandshake,
  FaLightbulb,
  FaUsers,
} from "react-icons/fa";
import styles from "../styles/sobre.module.css";

const pillars = [
  {
    icon: <FaFlask />,
    title: "Pesquisa aplicada",
    text: "Linhas de investigação conectadas a desafios reais do ensino, da tecnologia e do território.",
  },
  {
    icon: <FaGraduationCap />,
    title: "Formação científica",
    text: "Participação de estudantes em projetos, publicações, coletas de dados e práticas de investigação.",
  },
  {
    icon: <FaLightbulb />,
    title: "Inovação",
    text: "Organização de ideias, protótipos e soluções que aproximam conhecimento acadêmico e impacto social.",
  },
  {
    icon: <FaHandshake />,
    title: "Cooperação",
    text: "Trabalho conjunto entre pesquisadores, estudantes, grupos parceiros e a comunidade institucional.",
  },
];

const workSteps = [
  "Mapeamento de demandas acadêmicas e territoriais",
  "Planejamento de projetos e linhas de pesquisa",
  "Coleta, análise e organização dos resultados",
  "Divulgação científica, publicações e ações integradas",
];

export default function Sobre() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <img
          src="/img/equipepaisagem.jpeg"
          alt="Equipe em ambiente institucional do IFMA"
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.kicker}>Sobre o GIEPI</span>
          <h1>Ensino, pesquisa e inovação com compromisso institucional.</h1>
          <p>
            O Grupo Interdisciplinar em Ensino, Pesquisa e Inovação articula
            pessoas, projetos e linhas de pesquisa para fortalecer a produção
            acadêmica no IFMA Campus Codó.
          </p>
          <div className={styles.heroActions}>
            <a href="/pesquisas" className={styles.primaryAction}>
              Ver linhas <FaArrowRight />
            </a>
            <a href="/equipe" className={styles.secondaryAction}>
              Conhecer equipe
            </a>
          </div>
        </div>
      </section>

      <section className={styles.identitySection}>
        <div className={styles.container}>
          <div className={styles.identityGrid}>
            <div className={styles.copyBlock}>
              <span className={styles.sectionTag}>Identidade</span>
              <h2>Um grupo feito para conectar conhecimento e prática.</h2>
              <p>
                O GIEPI reúne docentes, estudantes e colaboradores em um ambiente
                de pesquisa interdisciplinar. A proposta é aproximar ensino,
                ciência, tecnologia e extensão, criando caminhos para que a
                produção acadêmica dialogue com necessidades concretas.
              </p>
              <p>
                A atuação do grupo passa por organização de dados, projetos de
                inovação, investigações em diferentes áreas e divulgação de
                resultados para a comunidade acadêmica.
              </p>
            </div>

            <div className={styles.identityMedia}>
              <img src="/img/laboratoriopaisagem1.jpeg" alt="Laboratório de pesquisa" />
              <div className={styles.mediaCaption}>
                <strong>Pesquisa em movimento</strong>
                <span>Projetos, estudantes e produção científica reunidos em um mesmo ecossistema.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.metricsSection}>
        <div className={styles.container}>
          <div className={styles.metricsGrid} aria-label="Indicadores do grupo">
            <div className={styles.metric}>
              <FaUsers />
              <strong>Equipe integrada</strong>
              <span>Docentes, estudantes e colaboradores atuando em rede.</span>
            </div>
            <div className={styles.metric}>
              <FaChartLine />
              <strong>Dados organizados</strong>
              <span>Linhas, membros, projetos e comunicados conectados ao portal.</span>
            </div>
            <div className={styles.metric}>
              <FaBookOpen />
              <strong>Produção acadêmica</strong>
              <span>Publicações e registros que documentam a trajetória do grupo.</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.pillarsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Eixos</span>
            <h2>O que orienta nossa atuação</h2>
            <p>
              O grupo trabalha com uma base interdisciplinar, combinando pesquisa,
              formação, inovação e cooperação institucional.
            </p>
          </div>

          <div className={styles.pillarsGrid}>
            {pillars.map((pillar) => (
              <article className={styles.pillar} key={pillar.title}>
                <div className={styles.pillarIcon}>{pillar.icon}</div>
                <h3>{pillar.title}</h3>
                <p>{pillar.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.workflowSection}>
        <div className={styles.container}>
          <div className={styles.workflowGrid}>
            <div className={styles.workflowText}>
              <span className={styles.sectionTag}>Método</span>
              <h2>Da demanda ao resultado publicado.</h2>
              <p>
                O GIEPI organiza suas frentes de trabalho para que cada etapa seja
                acompanhada, registrada e transformada em evidência acadêmica.
              </p>
            </div>

            <ol className={styles.workflowList}>
              {workSteps.map((step, index) => (
                <li key={step}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>Explore as frentes de trabalho do GIEPI.</h2>
            <p>
              Veja as linhas de pesquisa, os projetos publicados e a equipe que
              sustenta a produção científica do grupo.
            </p>
            <div className={styles.ctaActions}>
              <a href="/pesquisas" className={styles.primaryAction}>
                Linhas de pesquisa
              </a>
              <a href="/projetos" className={styles.secondaryDarkAction}>
                Projetos
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
