import { useState } from 'react';
import { FaSearch, FaFilter, FaCalendarAlt, FaUserFriends, FaBookOpen, FaDownload, FaEye, FaArrowRight } from 'react-icons/fa';
import styles from '../styles/publicacoes.module.css';

export default function Publicacoes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [expandedPublication, setExpandedPublication] = useState(null);

  const publications = [
    {
      id: 1,
      title: "Qualidade da água em comunidades rurais do Maranhão: estudo de caso em Codó",
      category: "Artigo Científico",
      image: "/images/publicacoes/agua-comunidades.jpg",
      excerpt: "Análise de parâmetros físico-químicos e microbiológicos da água em povoados rurais.",
      authors: ["Silva, C.", "Santos, M.", "Oliveira, R."],
      journal: "Revista Brasileira de Recursos Hídricos",
      year: 2023,
      volume: "28",
      pages: "45-56",
      doi: "10.1590/2318-0331.282320220001",
      abstract: "Este estudo avaliou a qualidade da água em 15 comunidades rurais do município de Codó, Maranhão, analisando parâmetros físico-químicos e microbiológicos. Os resultados indicam...",
      keywords: ["Qualidade da água", "Comunidades rurais", "Saúde pública", "Maranhão"],
      file: "/pdfs/agua-comunidades.pdf"
    },
    {
      id: 2,
      title: "Potencial nutricional de frutas nativas do Maranhão",
      category: "Artigo Científico",
      image: "/images/publicacoes/frutas-nativas.jpg",
      excerpt: "Avaliação da composição nutricional e propriedades funcionais de frutas da região.",
      authors: ["Mendes, A.", "Lima, R.", "Costa, F."],
      journal: "Ciência e Tecnologia de Alimentos",
      year: 2022,
      volume: "42",
      pages: "123-134",
      doi: "10.1590/0103-8478cr20220123",
      abstract: "O estudo caracterizou a composição nutricional de cinco espécies de frutas nativas do Maranhão, identificando altos teores de compostos fenólicos e atividade antioxidante...",
      keywords: ["Frutas nativas", "Composição nutricional", "Antioxidantes", "Maranhão"],
      file: "/pdfs/frutas-nativas.pdf"
    },
    {
      id: 3,
      title: "Relatório Técnico: Feira de Ciências IFMA 2023",
      category: "Relatório Técnico",
      image: "/images/publicacoes/relatorio-feira.jpg",
      excerpt: "Documentação completa dos projetos apresentados na Feira de Ciências do IFMA Campus Codó.",
      authors: ["GIEPI"],
      journal: "IFMA",
      year: 2023,
      volume: null,
      pages: "1-45",
      doi: null,
      abstract: "Relatório técnico que documenta todos os projetos apresentados na Feira de Ciências 2023 do IFMA Campus Codó, incluindo metodologias, resultados e avaliações.",
      keywords: ["Feira de Ciências", "IFMA", "Extensão", "Ensino"],
      file: "/pdfs/relatorio-feira-2023.pdf"
    },
    {
      id: 4,
      title: "Sistemas agroflorestais como alternativa sustentável para agricultura familiar",
      category: "Artigo de Revisão",
      image: "/images/publicacoes/agroflorestas.jpg",
      excerpt: "Revisão sistemática sobre a implementação de sistemas agroflorestais no bioma maranhense.",
      authors: ["Almeida, J.", "Santos, M.", "Silva, C."],
      journal: "Agroecossistemas",
      year: 2023,
      volume: "15",
      pages: "78-92",
      doi: "10.5935/2318-7674.20230007",
      abstract: "Esta revisão sistemática analisa estudos sobre sistemas agroflorestais no Maranhão, discutindo sua viabilidade técnica, econômica e ambiental para agricultura familiar.",
      keywords: ["Agroflorestas", "Agricultura familiar", "Sustentabilidade", "Maranhão"],
      file: "/pdfs/agroflorestas.pdf"
    },
    {
      id: 5,
      title: "Métodos analíticos para detecção de contaminantes em alimentos",
      category: "Capítulo de Livro",
      image: "/images/publicacoes/metodos-analiticos.jpg",
      excerpt: "Capítulo sobre técnicas modernas de análise de contaminantes em matrizes alimentícias.",
      authors: ["Costa, F.", "Mendes, A."],
      journal: "Técnicas Analíticas em Ciência de Alimentos",
      year: 2024,
      volume: "3",
      pages: "156-178",
      doi: "10.1007/978-3-031-45682-4_8",
      abstract: "Este capítulo revisa e discute métodos analíticos modernos para detecção e quantificação de contaminantes em alimentos, com foco em técnicas cromatográficas e espectrométricas.",
      keywords: ["Métodos analíticos", "Contaminantes", "Alimentos", "Cromatografia"],
      file: "/pdfs/metodos-analiticos.pdf"
    },
    {
      id: 6,
      title: "Monitoramento ambiental de bacias hidrográficas: metodologia e resultados preliminares",
      category: "Artigo Científico",
      image: "/images/publicacoes/monitoramento-bacias.jpg",
      excerpt: "Desenvolvimento de sistema de monitoramento e primeiros resultados em bacias do Maranhão.",
      authors: ["Lima, R.", "Silva, C.", "Oliveira, P."],
      journal: "Engenharia Sanitária e Ambiental",
      year: 2024,
      volume: "29",
      pages: "in press",
      doi: null,
      abstract: "Artigo descreve o desenvolvimento de sistema integrado de monitoramento ambiental para bacias hidrográficas e apresenta resultados preliminares de um ano de coleta de dados.",
      keywords: ["Monitoramento", "Bacias hidrográficas", "Sensores", "Qualidade ambiental"],
      file: "/pdfs/monitoramento-bacias.pdf"
    }
  ];

  const categories = ["Todos", "Artigo Científico", "Relatório Técnico", "Artigo de Revisão", "Capítulo de Livro"];

  const filteredPublications = publications.filter(pub => {
    const matchesSearch = pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pub.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pub.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         pub.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = activeCategory === "Todos" || pub.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: publications.length,
    artigos: publications.filter(p => p.category.includes("Artigo")).length,
    relatorios: publications.filter(p => p.category.includes("Relatório")).length,
    ultimoAno: publications.filter(p => p.year >= 2023).length
  };

  return (
    <div className={styles.publicacoesContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <div className={styles.heroBadge}>
              <span>Produção Científica</span>
            </div>
            <h1 className={styles.heroTitle}>
              Publicações <span className={styles.highlight}>Científicas</span>
            </h1>
            <p className={styles.heroDescription}>
              Artigos, relatórios e documentos produzidos pelo Grupo GIEPI — IFMA Campus Codó.
              Conheça nossa produção científica e contribuições para o avanço do conhecimento.
            </p>
            
            <div className={styles.heroStats}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FaBookOpen />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stats.total}</div>
                  <div className={styles.statLabel}>Publicações</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FaCalendarAlt />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stats.ultimoAno}</div>
                  <div className={styles.statLabel}>Último Ano</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FaUserFriends />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stats.artigos}</div>
                  <div className={styles.statLabel}>Artigos</div>
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
                placeholder="Buscar por título, autores, palavras-chave..."
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

      {/* Publications Grid */}
      <section className={styles.publicationsSection}>
        <div className={styles.container}>
          <div className={styles.publicationsGrid}>
            {filteredPublications.map(pub => (
              <div 
                key={pub.id} 
                className={`${styles.publicationCard} ${expandedPublication === pub.id ? styles.expanded : ''}`}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.publicationImage}>
                    <img 
                      src={pub.image} 
                      alt={pub.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `/images/placeholder-publication.jpg`;
                      }}
                    />
                  </div>
                  <div className={styles.publicationCategory}>
                    {pub.category}
                  </div>
                </div>
                
                <div className={styles.cardBody}>
                  <div className={styles.publicationMeta}>
                    <span className={styles.publicationYear}>
                      <FaCalendarAlt /> {pub.year}
                    </span>
                    {pub.doi && (
                      <span className={styles.publicationDoi}>
                        DOI: {pub.doi.substring(0, 20)}...
                      </span>
                    )}
                  </div>
                  
                  <h3 className={styles.publicationTitle}>{pub.title}</h3>
                  <p className={styles.publicationExcerpt}>{pub.excerpt}</p>
                  
                  <div className={styles.authorsList}>
                    {pub.authors.map((author, index) => (
                      <span key={index} className={styles.author}>{author}</span>
                    ))}
                  </div>
                  
                  <div className={styles.journalInfo}>
                    <strong>{pub.journal}</strong>
                    {pub.volume && `, Vol. ${pub.volume}`}
                    {pub.pages && `, p. ${pub.pages}`}
                  </div>
                  
                  {expandedPublication === pub.id && (
                    <div className={styles.expandedContent}>
                      <div className={styles.abstractSection}>
                        <h4>Resumo</h4>
                        <p>{pub.abstract}</p>
                      </div>
                      
                      <div className={styles.keywordsSection}>
                        <strong>Palavras-chave:</strong>
                        <div className={styles.keywordsList}>
                          {pub.keywords.map((keyword, index) => (
                            <span key={index} className={styles.keyword}>{keyword}</span>
                          ))}
                        </div>
                      </div>
                      
                      {pub.doi && (
                        <div className={styles.doiSection}>
                          <strong>DOI:</strong>
                          <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer">
                            {pub.doi}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className={styles.cardFooter}>
                  <div className={styles.publicationActions}>
                    <a 
                      href={pub.file} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.actionButtonPrimary}
                    >
                      <FaDownload /> PDF
                    </a>
                    <button 
                      className={styles.actionButtonSecondary}
                      onClick={() => setExpandedPublication(expandedPublication === pub.id ? null : pub.id)}
                    >
                      <FaEye /> {expandedPublication === pub.id ? 'Menos' : 'Resumo'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredPublications.length === 0 && (
            <div className={styles.noResults}>
              <FaSearch className={styles.noResultsIcon} />
              <h3>Nenhuma publicação encontrada</h3>
              <p>Tente alterar os termos da busca ou selecione outra categoria</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>Quer citar nossas publicações?</h2>
            <p>
              Todas as nossas publicações estão disponíveis para consulta e citação. 
              Entre em contato se precisar de versões específicas ou informações adicionais.
            </p>
            <div className={styles.ctaButtons}>
              <a href="/biblioteca" className={styles.ctaButtonPrimary}>
                Acessar Biblioteca
              </a>
              <a href="/normas-citacao" className={styles.ctaButtonSecondary}>
                Normas de Citação
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}