import React from 'react'

export default function Home(){
  return (
    <>
      <section id="main-hero" className="hero">
        <div className="overlay" />

        <div className="hero-content">
          <h1>Seja bem-vindo ao nosso Grupo de Pesquisa</h1>

          <p>
            Trabalhamos com inovação, ciência e impacto social nas áreas de Alimentos, Química,
            Agronomia e Recursos Hídricos no IFMA – Campus Codó.
          </p>

          <button className="btn hero-btn">Conheça nossos projetos</button>
        </div>
      </section>

      <section id="card-sobre" className="section">
        <h2 className="section-title">Sobre o AQARH</h2>

        <p className="section-text">
          O Grupo AQARH desenvolve pesquisas em ciência e tecnologia buscando soluções inovadoras
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