import React from 'react'

export default function Home() {
  return (
    <>
      <section id="main-hero" className="hero">
        <video autoPlay loop muted playsInline className="hero-video">
          <source src="/img/videohero.mp4" type="video/mp4" />
        </video>

        <div className="overlay"></div>

        <div className="hero-content">
          <h1>Seja bem-vindo ao nosso Grupo de Pesquisa</h1>
          <p>Trabalhamos com inovação e ciência…</p>
          <button className="btn hero-btn">Conheça nossos projetos</button>
        </div>
      </section>


      <section id="card-sobre" className="section">
        <h2 className="section-title">Sobre o GIEPI</h2>

        <p className="section-text">
          O Grupo GIEPI desenvolve pesquisas em ciência e tecnologia buscando soluções inovadoras
          para melhorar a qualidade de vida e fomentar o conhecimento científico no IFMA.
        </p>

        <button className="btn section-btn">Saiba Mais</button>
      </section>

      <section className="section">
        <h2 className="section-title">Projetos</h2>

        <p className="section-text">
          Nossos projetos são desenvolvidos por alunos e professores com foco em pesquisa aplicada
          e resultados reais para a comunidade.
        </p>

        <button className="btn section-btn">Ver Projetos</button>
      </section>

      <section className="section-large">
        <h2 className="section-title">Pesquisas</h2>

        <p className="section-text">
          As pesquisas do grupo abrangem desde análises laboratoriais até desenvolvimento
          tecnológico avançado.
        </p>

        <p className="section-text">
          Trabalhamos com rigor científico para entregar resultados consistentes e relevantes.
        </p>

        <button className="btn section-btn">Explorar Pesquisas</button>
      </section>

      <section className="section-team">
        <div className="team-text">
          <h2 className="section-title">Equipe</h2>

          <p className="section-text">
            O grupo é composto por professores pesquisadores, bolsistas de iniciação científica
            e alunos envolvidos em diversos projetos de pesquisa.
          </p>
        </div>

        <div className="team-images">
          <img src="/images/imagem-sinalizar.jpg" alt="Equipe" className="team-img" />
          <img src="/images/imagem-sinalizar.jpg" alt="Equipe" className="team-img-sm" />
        </div>
      </section>
    </>
  )
}