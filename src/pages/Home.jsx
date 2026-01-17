import React from 'react'
import ComunicadosModal from '../components/ComunicadosModal'
import { FaUsers, FaFlask, FaProjectDiagram, FaGraduationCap, FaLightbulb, FaChartLine, FaBookOpen, FaHandshake } from 'react-icons/fa'
import '../styles/Home.css' // Vamos criar este CSS

export default function Home() {
  return (
    <>
      <ComunicadosModal />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <video autoPlay loop muted playsInline className="hero-video">
            <source src="/img/videohero.mp4" type="video/mp4" />
          </video>
          <div className="hero-overlay"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="gradient-text">Inovação</span> e <span className="gradient-text">Pesquisa</span> que Transformam
            </h1>
            <p className="hero-subtitle">
              Desenvolvendo soluções tecnológicas de ponta e formando os pesquisadores do futuro
            </p>
            <div className="hero-buttons">
              <a href="#sobre" className="btn btn-primary">
                <FaFlask /> Conheça o GIEPI
              </a>
              <a href="#projetos" className="btn btn-outline">
                <FaProjectDiagram /> Nossos Projetos
              </a>
            </div>
          </div>
          
          <div className="hero-stats">
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
                <p>Projetos Ativos</p>
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
                <p>Alunos Formados</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="hero-scroll">
          <div className="scroll-indicator"></div>
        </div>
      </section>

      {/* Sobre o GIEPI */}
      <section id="sobre" className="section sobre-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Sobre Nós</span>
            <h2 className="section-title">O Grupo <span className="highlight">GIEPI</span></h2>
            <p className="section-subtitle">
              Excelência em pesquisa interdisciplinar e inovação tecnológica
            </p>
          </div>
          
          <div className="sobre-content">
            <div className="sobre-text">
              <h3>Transformando ideias em realidade</h3>
              <p>
                O <strong>Grupo de Pesquisa em Inovação e Excelência em Pesquisa Interdisciplinar (GIEPI)</strong> 
                é referência nacional no desenvolvimento de soluções tecnológicas avançadas nas áreas 
                de engenharia, computação e ciências aplicadas.
              </p>
              <p>
                Nossa missão é integrar pesquisa de ponta, formação de excelência e impacto social, 
                contribuindo para o avanço científico e tecnológico do Brasil.
              </p>
              
              <div className="features-grid">
                <div className="feature">
                  <div className="feature-icon">
                    <FaLightbulb />
                  </div>
                  <div className="feature-content">
                    <h4>Inovação Contínua</h4>
                    <p>Desenvolvimento de tecnologias disruptivas e soluções inovadoras</p>
                  </div>
                </div>
                
                <div className="feature">
                  <div className="feature-icon">
                    <FaGraduationCap />
                  </div>
                  <div className="feature-content">
                    <h4>Formação de Excelência</h4>
                    <p>Capacitação de pesquisadores e profissionais altamente qualificados</p>
                  </div>
                </div>
                
                <div className="feature">
                  <div className="feature-icon">
                    <FaChartLine />
                  </div>
                  <div className="feature-content">
                    <h4>Impacto Social</h4>
                    <p>Soluções com aplicação prática e benefícios para a sociedade</p>
                  </div>
                </div>
                
                <div className="feature">
                  <div className="feature-icon">
                    <FaHandshake />
                  </div>
                  <div className="feature-content">
                    <h4>Parcerias Estratégicas</h4>
                    <p>Colaboração com empresas, instituições e comunidade</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="sobre-image">
              <div className="image-frame">
                <img src="/images/laboratorio-giepi.jpg" alt="Laboratório GIEPI" />
                <div className="image-badge">
                  <span>Desde 2010</span>
                  <strong>Excelência em Pesquisa</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Linhas de Pesquisa */}
      <section className="section linhas-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Nossa Especialidade</span>
            <h2 className="section-title">Linhas de <span className="highlight">Pesquisa</span></h2>
            <p className="section-subtitle">
              Focos principais de atuação e desenvolvimento
            </p>
          </div>
          
          <div className="linhas-grid">
            <div className="linha-card">
              <div className="linha-header">
                <div className="linha-icon">
                  <FaFlask />
                </div>
                <span className="linha-category">Inteligência Artificial</span>
              </div>
              <h3>Sistemas Inteligentes e Machine Learning</h3>
              <p>
                Desenvolvimento de algoritmos avançados de IA, deep learning e processamento 
                de linguagem natural para soluções inovadoras.
              </p>
              <ul className="linha-topics">
                <li>Redes Neurais Profundas</li>
                <li>Visão Computacional</li>
                <li>Processamento de Linguagem Natural</li>
                <li>Sistemas de Recomendação</li>
              </ul>
            </div>
            
            <div className="linha-card">
              <div className="linha-header">
                <div className="linha-icon">
                  <FaProjectDiagram />
                </div>
                <span className="linha-category">IoT & Robótica</span>
              </div>
              <h3>Internet das Coisas e Automação</h3>
              <p>
                Pesquisa em sistemas embarcados, robótica autônoma e redes de sensores 
                para automação industrial e residencial.
              </p>
              <ul className="linha-topics">
                <li>Sistemas Embarcados</li>
                <li>Robótica Colaborativa</li>
                <li>Redes de Sensores Sem Fio</li>
                <li>Automação Industrial 4.0</li>
              </ul>
            </div>
            
            <div className="linha-card">
              <div className="linha-header">
                <div className="linha-icon">
                  <FaChartLine />
                </div>
                <span className="linha-category">Ciência de Dados</span>
              </div>
              <h3>Big Data e Analytics</h3>
              <p>
                Análise de grandes volumes de dados, mineração de dados e business intelligence 
                para suporte à tomada de decisão.
              </p>
              <ul className="linha-topics">
                <li>Big Data Analytics</li>
                <li>Visualização de Dados</li>
                <li>Data Mining</li>
                <li>Business Intelligence</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Projetos em Destaque */}
      <section id="projetos" className="section projetos-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Nossos Trabalhos</span>
            <h2 className="section-title">Projetos em <span className="highlight">Destaque</span></h2>
            <p className="section-subtitle">
              Conheça alguns dos nossos principais desenvolvimentos
            </p>
          </div>
          
          <div className="projetos-grid">
            <div className="projeto-card">
              <div className="projeto-image">
                <img src="/images/projeto-ia-saude.jpg" alt="IA na Saúde" />
                <div className="projeto-badge">Em Andamento</div>
              </div>
              <div className="projeto-content">
                <h3>Sistema de Diagnóstico Médico com IA</h3>
                <p>
                  Desenvolvimento de sistema de auxílio ao diagnóstico médico utilizando 
                  redes neurais convolucionais para análise de imagens médicas.
                </p>
                <div className="projeto-meta">
                  <span className="projeto-tag">Inteligência Artificial</span>
                  <span className="projeto-tag">Saúde Digital</span>
                  <span className="projeto-tag">Deep Learning</span>
                </div>
                <a href="/projetos/ia-saude" className="projeto-link">
                  Ver Detalhes →
                </a>
              </div>
            </div>
            
            <div className="projeto-card">
              <div className="projeto-image">
                <img src="/images/projeto-agricultura.jpg" alt="Agricultura de Precisão" />
                <div className="projeto-badge">Concluído</div>
              </div>
              <div className="projeto-content">
                <h3>Agricultura de Precisão com Drones</h3>
                <p>
                  Sistema integrado de monitoramento agrícola utilizando drones e sensores 
                  IoT para otimização do uso de recursos e aumento da produtividade.
                </p>
                <div className="projeto-meta">
                  <span className="projeto-tag">IoT</span>
                  <span className="projeto-tag">Agricultura</span>
                  <span className="projeto-tag">Drones</span>
                </div>
                <a href="/projetos/agricultura" className="projeto-link">
                  Ver Detalhes →
                </a>
              </div>
            </div>
            
            <div className="projeto-card">
              <div className="projeto-image">
                <img src="/images/projeto-monitoramento.jpg" alt="Monitoramento Ambiental" />
                <div className="projeto-badge">Em Andamento</div>
              </div>
              <div className="projeto-content">
                <h3>Rede de Monitoramento Ambiental</h3>
                <p>
                  Rede de sensores distribuídos para monitoramento em tempo real da 
                  qualidade do ar e água em áreas urbanas e industriais.
                </p>
                <div className="projeto-meta">
                  <span className="projeto-tag">IoT</span>
                  <span className="projeto-tag">Sustentabilidade</span>
                  <span className="projeto-tag">Monitoramento</span>
                </div>
                <a href="/projetos/monitoramento" className="projeto-link">
                  Ver Detalhes →
                </a>
              </div>
            </div>
          </div>
          
          <div className="section-cta">
            <a href="/projetos" className="btn btn-secondary">
              <FaProjectDiagram /> Ver Todos os Projetos
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Pronto para fazer parte da <span className="highlight">inovação</span>?</h2>
            <p>
              Junte-se ao GIEPI e contribua para o avanço da ciência e tecnologia. 
              Temos oportunidades para pesquisadores, estudantes e parceiros.
            </p>
            <div className="cta-buttons">
              <a href="/participar" className="btn btn-primary btn-large">
                <FaUsers /> Tornar-se Membro
              </a>
              <a href="/contato" className="btn btn-outline btn-large">
                <FaHandshake /> Parcerias
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-info">
              <h3>GIEPI</h3>
              <p>Grupo de Pesquisa em Inovação e Excelência em Pesquisa Interdisciplinar</p>
              <div className="footer-social">
                <a href="#" className="social-link">Facebook</a>
                <a href="#" className="social-link">Instagram</a>
                <a href="#" className="social-link">LinkedIn</a>
                <a href="#" className="social-link">YouTube</a>
              </div>
            </div>
            
            <div className="footer-links">
              <div className="link-group">
                <h4>Navegação</h4>
                <a href="#sobre">Sobre o GIEPI</a>
                <a href="#projetos">Projetos</a>
                <a href="/equipe">Equipe</a>
                <a href="/publicacoes">Publicações</a>
              </div>
              
              <div className="link-group">
                <h4>Recursos</h4>
                <a href="/blog">Blog</a>
                <a href="/noticias">Notícias</a>
                <a href="/eventos">Eventos</a>
                <a href="/oportunidades">Oportunidades</a>
              </div>
              
              <div className="link-group">
                <h4>Contato</h4>
                <p>contato@giepi.org</p>
                <p>+55 (98) 3214-5678</p>
                <p>Campus do IFMA, São Luís - MA</p>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2026 GIEPI - Todos os direitos reservados</p>
            <p>Desenvolvido com ❤️ pela equipe GIEPI</p>
          </div>
        </div>
      </footer>
    </>
  )
}