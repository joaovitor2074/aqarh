import { useState } from 'react';
import { FaSearch, FaFilter, FaCalendarAlt, FaUserFriends, FaGraduationCap, FaBookOpen, FaArrowRight } from 'react-icons/fa';
import styles from '../styles/Projetos.module.css';

export default function Projetos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [expandedProject, setExpandedProject] = useState(null);

  const projects = [
    {
      id: 1,
      title: "Análise da Qualidade da Água em Comunidades Rurais",
      category: "Científicos",
      image: "/images/projetos/agua-comunidades.jpg",
      excerpt: "Estudo sobre parâmetros físico-químicos e microbiológicos da água consumida em povoados da região de Codó.",
      description: "Projeto de pesquisa aplicada que visa mapear e analisar a qualidade da água em comunidades rurais do Maranhão, identificando fontes de contaminação e propondo soluções de tratamento acessíveis.",
      status: "Em andamento",
      startDate: "2023-08-01",
      endDate: "2025-07-31",
      team: "8 pesquisadores",
      publications: 3,
      budget: "R$ 120.000,00",
      partner: "FAPEMA",
      tags: ["Recursos Hídricos", "Saúde Pública", "Água", "Comunidades Rurais"]
    },
    {
      id: 2,
      title: "Avaliação Nutricional de Alimentos Regionais",
      category: "Científicos",
      image: "/images/projetos/alimentos-regionais.jpg",
      excerpt: "Pesquisa com foco na composição nutricional e aplicações tecnológicas de alimentos maranhenses.",
      description: "Estudo abrangente da composição nutricional de frutas, tubérculos e outros produtos agrícolas da região, visando valorizar a biodiversidade local e desenvolver produtos inovadores.",
      status: "Concluído",
      startDate: "2022-03-15",
      endDate: "2023-09-14",
      team: "6 pesquisadores",
      publications: 5,
      budget: "R$ 85.000,00",
      partner: "IFMA",
      tags: ["Alimentos", "Nutrição", "Biodiversidade", "Desenvolvimento Regional"]
    },
    {
      id: 3,
      title: "Relatório Técnico – Feira de Ciências do IFMA",
      category: "Acadêmicos",
      image: "/images/projetos/feira-ciencias.jpg",
      excerpt: "Projeto apresentado na Feira de Ciências com foco em sustentabilidade e inovação.",
      description: "Projeto acadêmico desenvolvido por alunos do IFMA para a Feira de Ciências, abordando temas de sustentabilidade ambiental e inovação tecnológica.",
      status: "Concluído",
      startDate: "2023-05-10",
      endDate: "2023-08-10",
      team: "4 estudantes",
      publications: 1,
      budget: "R$ 5.000,00",
      partner: "IFMA Campus Codó",
      tags: ["Extensão", "Ensino", "Feira de Ciências", "Sustentabilidade"]
    },
    {
      id: 4,
      title: "Monitoramento de Recursos Hídricos",
      category: "Científicos",
      image: "/images/projetos/monitoramento-hidrico.jpg",
      excerpt: "Projeto contínuo de análise de rios locais e impactos ambientais.",
      description: "Projeto de monitoramento ambiental contínuo de recursos hídricos na região, utilizando tecnologias de sensoriamento e análise laboratorial avançada.",
      status: "Em andamento",
      startDate: "2023-01-10",
      endDate: "2025-12-31",
      team: "10 pesquisadores",
      publications: 2,
      budget: "R$ 200.000,00",
      partner: "CNPq",
      tags: ["Monitoramento", "Recursos Hídricos", "Ambiente", "Sensoriamento"]
    },
    {
      id: 5,
      title: "Práticas de Laboratório – Química Geral",
      category: "Acadêmicos",
      image: "/images/projetos/quimica-laboratorio.jpg",
      excerpt: "Registro dos experimentos realizados na disciplina de Química do IFMA.",
      description: "Projeto acadêmico de registro e documentação de práticas laboratoriais realizadas na disciplina de Química Geral, com foco em metodologia científica.",
      status: "Concluído",
      startDate: "2023-02-01",
      endDate: "2023-07-31",
      team: "2 professores + 30 estudantes",
      publications: 0,
      budget: "R$ 8.000,00",
      partner: "IFMA",
      tags: ["Ensino", "Química", "Laboratório", "Metodologia"]
    },
    {
      id: 6,
      title: "Sistemas Agroflorestais para Agricultura Familiar",
      category: "Científicos",
      image: "/images/projetos/agroflorestas.jpg",
      excerpt: "Desenvolvimento de sistemas integrados de produção para pequenos produtores.",
      description: "Projeto de pesquisa e extensão que desenvolve e implementa sistemas agroflorestais adaptados às condições do Maranhão, visando sustentabilidade e aumento da renda familiar.",
      status: "Em andamento",
      startDate: "2022-06-01",
      endDate: "2024-05-31",
      team: "12 pesquisadores",
      publications: 4,
      budget: "R$ 150.000,00",
      partner: "MDA",
      tags: ["Agroflorestas", "Agricultura Familiar", "Sustentabilidade", "Extensão"]
    }
  ];

  const categories = ["Todos", "Científicos", "Acadêmicos"];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = activeCategory === "Todos" || project.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: projects.length,
    emAndamento: projects.filter(p => p.status === "Em andamento").length,
    concluidos: projects.filter(p => p.status === "Concluído").length,
    publicacoes: projects.reduce((acc, p) => acc + p.publications, 0),
    investimento: projects.reduce((acc, p) => acc + parseFloat(p.budget.replace('R$ ', '').replace('.', '').replace(',', '.')), 0)
  };

  return (
    <div className={styles.projetosContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <div className={styles.heroBadge}>
              <span>Inovação e Pesquisa</span>
            </div>
            <h1 className={styles.heroTitle}>
              Projetos <span className={styles.highlight}>Científicos</span>
            </h1>
            <p className={styles.heroDescription}>
              Pesquisa, desenvolvimento e inovação no IFMA – Campus Codó. Conheça nossos projetos 
              em andamento e concluídos.
            </p>
            
            <div className={styles.heroStats}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FaBookOpen />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stats.total}</div>
                  <div className={styles.statLabel}>Projetos</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FaCalendarAlt />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stats.emAndamento}</div>
                  <div className={styles.statLabel}>Em Andamento</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FaGraduationCap />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stats.publicacoes}</div>
                  <div className={styles.statLabel}>Publicações</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className={styles.filtersSection}>
        <div className={styles.container}>
          <div className={styles.filtersContent}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar projetos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <div className={styles.filterButtons}>
              {categories.map(category => (
                <button
                  key={category}
                  className={`${styles.filterButton} ${activeCategory === category ? styles.active : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className={styles.projectsSection}>
        <div className={styles.container}>
          <div className={styles.projectsGrid}>
            {filteredProjects.map(project => (
              <div 
                key={project.id} 
                className={`${styles.projectCard} ${expandedProject === project.id ? styles.expanded : ''}`}
                onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
              >
                <div className={styles.projectImage}>
                  <img 
                    src={project.image} 
                    alt={project.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `/images/placeholder-project.jpg`;
                    }}
                  />
                  <div className={`${styles.statusBadge} ${project.status === 'Em andamento' ? styles.statusActive : styles.statusCompleted}`}>
                    {project.status}
                  </div>
                  <div className={styles.categoryBadge}>
                    {project.category}
                  </div>
                </div>
                
                <div className={styles.projectContent}>
                  <h3 className={styles.projectTitle}>{project.title}</h3>
                  <p className={styles.projectExcerpt}>{project.excerpt}</p>
                  
                  <div className={styles.projectMeta}>
                    <div className={styles.metaItem}>
                      <FaCalendarAlt />
                      <span>{new Date(project.startDate).getFullYear()}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <FaUserFriends />
                      <span>{project.team}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <FaGraduationCap />
                      <span>{project.publications} publicações</span>
                    </div>
                  </div>
                  
                  <div className={styles.tagsContainer}>
                    {project.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                  
                  {expandedProject === project.id && (
                    <div className={styles.expandedDetails}>
                      <div className={styles.detailsSection}>
                        <h4>Descrição Detalhada</h4>
                        <p>{project.description}</p>
                      </div>
                      
                      <div className={styles.detailsGrid}>
                        <div className={styles.detailItem}>
                          <strong>Parceiro:</strong>
                          <span>{project.partner}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <strong>Orçamento:</strong>
                          <span>{project.budget}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <strong>Período:</strong>
                          <span>{new Date(project.startDate).toLocaleDateString('pt-BR')} - {new Date(project.endDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      
                      <div className={styles.fullTagsContainer}>
                        {project.tags.map((tag, index) => (
                          <span key={index} className={styles.tag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className={styles.projectActions}>
                    <button className={styles.detailsButton}>
                      {expandedProject === project.id ? 'Mostrar menos' : 'Ver detalhes'}
                      <FaArrowRight className={styles.arrowIcon} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredProjects.length === 0 && (
            <div className={styles.noResults}>
              <FaSearch className={styles.noResultsIcon} />
              <h3>Nenhum projeto encontrado</h3>
              <p>Tente alterar os termos da busca ou selecione outra categoria</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>Quer desenvolver um projeto conosco?</h2>
            <p>
              Estamos abertos a parcerias e colaborações. Se você tem uma ideia de projeto 
              ou deseja colaborar com nossas pesquisas, entre em contato.
            </p>
            <div className={styles.ctaButtons}>
              <a href="/parcerias" className={styles.ctaButtonPrimary}>
                Propor Parceria
              </a>
              <a href="/contato" className={styles.ctaButtonSecondary}>
                Fale Conosco
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}