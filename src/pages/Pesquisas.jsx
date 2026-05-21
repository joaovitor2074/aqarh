import { useState } from 'react';
import { FaSearch, FaFilter, FaFlask, FaWater, FaSeedling, FaLeaf, FaGraduationCap, FaBookOpen, FaCalendarAlt, FaUserFriends, FaArrowRight } from 'react-icons/fa';
import styles from '../styles/pesquisa.module.css';

export default function Pesquisas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [expandedResearch, setExpandedResearch] = useState(null);

  const researchData = [
    {
      id: 1,
      title: "Análise da Qualidade da Água em Comunidades Rurais",
      category: "Recursos Hídricos",
      icon: <FaWater />,
      excerpt: "Estudo voltado para avaliar a potabilidade e presença de contaminantes em fontes hídricas da região de Codó e municípios vizinhos.",
      description: "Esta pesquisa tem como objetivo mapear e analisar a qualidade da água em comunidades rurais do Maranhão, identificando fontes de contaminação e propondo soluções de tratamento acessíveis. O estudo inclui análises físico-químicas, microbiológicas e avaliação de impactos na saúde pública.",
      status: "Em andamento",
      duration: "24 meses",
      teamSize: 8,
      publications: 3,
      startDate: "2023-08-01",
      tags: ["Qualidade da Água", "Saúde Pública", "Contaminantes", "Comunidades Rurais"]
    },
    {
      id: 2,
      title: "Avaliação de Produtos Alimentícios Regionais",
      category: "Alimentos",
      icon: <FaLeaf />,
      excerpt: "Projetos focados em segurança alimentar, qualidade nutricional e desenvolvimento de produtos baseados na biodiversidade local.",
      description: "Pesquisa que avalia o potencial nutricional e tecnológico de frutas, tubérculos e outros produtos agrícolas da região. Inclui desenvolvimento de produtos inovadores, estudos de vida útil e análises sensoriais para valorizar a biodiversidade maranhense.",
      status: "Concluído",
      duration: "18 meses",
      teamSize: 6,
      publications: 5,
      startDate: "2022-03-15",
      tags: ["Segurança Alimentar", "Biodiversidade", "Nutrição", "Desenvolvimento Regional"]
    },
    {
      id: 3,
      title: "Pesquisa em Química Aplicada",
      category: "Química",
      icon: <FaFlask />,
      excerpt: "Trabalhos sobre reações químicas, análises laboratoriais e práticas industriais com foco em aplicações sustentáveis.",
      description: "Desenvolvimento de métodos analíticos avançados para caracterização de materiais e compostos. Pesquisa em catálise, síntese orgânica e química verde, com aplicações nas indústrias farmacêutica, alimentícia e de materiais.",
      status: "Em andamento",
      duration: "36 meses",
      teamSize: 10,
      publications: 7,
      startDate: "2023-01-10",
      tags: ["Química Analítica", "Síntese Orgânica", "Química Verde", "Catálise"]
    },
    {
      id: 4,
      title: "Sistemas Agroflorestais Sustentáveis",
      category: "Agronomia",
      icon: <FaSeedling />,
      excerpt: "Estudo de sistemas integrados de produção que combinam espécies florestais, agrícolas e pecuárias.",
      description: "Pesquisa sobre implementação e manejo de sistemas agroflorestais adaptados ao bioma maranhense. Avaliação de produtividade, conservação do solo, biodiversidade e viabilidade econômica desses sistemas.",
      status: "Em andamento",
      duration: "48 meses",
      teamSize: 12,
      publications: 4,
      startDate: "2022-06-01",
      tags: ["Agroflorestas", "Sustentabilidade", "Conservação", "Agricultura Familiar"]
    },
    {
      id: 5,
      title: "Bioprospecção de Plantas Medicinais",
      category: "Biologia",
      icon: <FaLeaf />,
      excerpt: "Identificação e estudo de espécies vegetais com potencial terapêutico e biotecnológico.",
      description: "Pesquisa que busca identificar compostos bioativos em plantas da flora maranhense, avaliando suas propriedades farmacológicas e aplicações na indústria farmacêutica e cosmética.",
      status: "Concluído",
      duration: "20 meses",
      teamSize: 7,
      publications: 6,
      startDate: "2021-09-01",
      tags: ["Plantas Medicinais", "Compostos Bioativos", "Farmacologia", "Biotecnologia"]
    },
    {
      id: 6,
      title: "Monitoramento Ambiental de Bacias Hidrográficas",
      category: "Recursos Hídricos",
      icon: <FaWater />,
      excerpt: "Sistema integrado de monitoramento da qualidade e quantidade de água em bacias críticas do estado.",
      description: "Desenvolvimento de rede de sensores e metodologias para monitoramento contínuo de parâmetros ambientais em bacias hidrográficas. Análise de dados para gestão sustentável dos recursos hídricos.",
      status: "Em andamento",
      duration: "30 meses",
      teamSize: 9,
      publications: 2,
      startDate: "2023-03-01",
      tags: ["Monitoramento", "Bacias Hidrográficas", "Sensores", "Gestão Sustentável"]
    }
  ];

  const categories = [
    { id: 'todos', label: 'Todas', icon: <FaFilter /> },
    { id: 'Recursos Hídricos', label: 'Recursos Hídricos', icon: <FaWater /> },
    { id: 'Alimentos', label: 'Alimentos', icon: <FaLeaf /> },
    { id: 'Química', label: 'Química', icon: <FaFlask /> },
    { id: 'Agronomia', label: 'Agronomia', icon: <FaSeedling /> },
    { id: 'Biologia', label: 'Biologia', icon: <FaGraduationCap /> }
  ];

  const filteredResearch = researchData.filter(research => {
    const matchesSearch = research.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         research.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         research.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = activeFilter === 'todos' || research.category === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: researchData.length,
    emAndamento: researchData.filter(r => r.status === "Em andamento").length,
    concluidos: researchData.filter(r => r.status === "Concluído").length,
    publicacoes: researchData.reduce((acc, r) => acc + r.publications, 0)
  };

  return (
    <div className={styles.pesquisasContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <div className={styles.heroBadge}>
              <span>Linhas de Pesquisa</span>
            </div>
            <h1 className={styles.heroTitle}>
              Pesquisas do <span className={styles.highlight}>GIEPI</span>
            </h1>
            <p className={styles.heroDescription}>
              Conheça os projetos de pesquisa desenvolvidos pelo grupo, abordando temas em alimentos, 
              química, agronomia, recursos hídricos e biotecnologia.
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

      {/* Search and Filters */}
      <section className={styles.filtersSection}>
        <div className={styles.container}>
          <div className={styles.searchContainer}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar pesquisas por título, descrição ou palavras-chave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <div className={styles.filterButtons}>
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`${styles.filterButton} ${activeFilter === category.id ? styles.active : ''}`}
                  onClick={() => setActiveFilter(category.id)}
                >
                  <span className={styles.filterIcon}>{category.icon}</span>
                  <span className={styles.filterLabel}>{category.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Research Grid */}
      <section className={styles.researchSection}>
        <div className={styles.container}>
          <div className={styles.researchGrid}>
            {filteredResearch.map(research => (
              <div 
                key={research.id} 
                className={styles.researchCard}
                onClick={() => setExpandedResearch(expandedResearch === research.id ? null : research.id)}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.categoryBadge}>
                    <span className={styles.categoryIcon}>{research.icon}</span>
                    <span className={styles.categoryText}>{research.category}</span>
                  </div>
                  <div className={`${styles.statusBadge} ${research.status === 'Em andamento' ? styles.statusActive : styles.statusCompleted}`}>
                    {research.status}
                  </div>
                </div>
                
                <div className={styles.cardBody}>
                  <h3 className={styles.researchTitle}>{research.title}</h3>
                  <p className={styles.researchExcerpt}>{research.excerpt}</p>
                  
                  <div className={styles.researchMeta}>
                    <div className={styles.metaItem}>
                      <FaCalendarAlt />
                      <span>{research.duration}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <FaUserFriends />
                      <span>{research.teamSize} pesquisadores</span>
                    </div>
                  </div>
                  
                  {expandedResearch === research.id && (
                    <div className={styles.expandedContent}>
                      <div className={styles.researchDescription}>
                        <h4>Descrição Detalhada</h4>
                        <p>{research.description}</p>
                      </div>
                      
                      <div className={styles.tagsContainer}>
                        {research.tags.map((tag, index) => (
                          <span key={index} className={styles.tag}>{tag}</span>
                        ))}
                      </div>
                      
                      <div className={styles.detailsGrid}>
                        <div className={styles.detailItem}>
                          <strong>Início:</strong>
                          <span>{new Date(research.startDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <strong>Publicações:</strong>
                          <span>{research.publications}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className={styles.cardFooter}>
                  <button className={styles.readMoreButton}>
                    {expandedResearch === research.id ? 'Mostrar menos' : 'Ver detalhes'}
                    <FaArrowRight className={styles.arrowIcon} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredResearch.length === 0 && (
            <div className={styles.noResults}>
              <FaSearch className={styles.noResultsIcon} />
              <h3>Nenhuma pesquisa encontrada</h3>
              <p>Tente alterar os termos da busca ou selecione outra categoria</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>Interessado em participar das nossas pesquisas?</h2>
            <p>
              Temos oportunidades para estudantes de graduação e pós-graduação interessados em pesquisa científica.
              Entre em contato para saber sobre processos seletivos e vagas disponíveis.
            </p>
            <div className={styles.ctaButtons}>
              <a href="/contato" className={styles.ctaButtonPrimary}>
                Entre em Contato
              </a>
              <a href="/oportunidades" className={styles.ctaButtonSecondary}>
                Ver Oportunidades
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}