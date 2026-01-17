import { useState } from 'react';
import { FaSearch, FaFilter, FaUserGraduate, FaUserTie, FaChalkboardTeacher, FaUsers, FaEnvelope, FaLinkedin, FaLaptopCode, FaFlask, FaMicroscope, FaSeedling, FaWater, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import styles from '../styles/equipe.module.css';

export default function Equipe() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [activeMember, setActiveMember] = useState(null);
  const [expandedBio, setExpandedBio] = useState(null);

  // Dados da equipe
  const teamMembers = [
    {
      id: 1,
      nome: "Dr. Carlos Silva",
      cargo: "Coordenador Geral",
      categoria: "professor",
      area: "Química de Alimentos",
      imagem: "/images/equipe/professor1.jpg",
      email: "carlos.silva@ifma.edu.br",
      lattes: "http://lattes.cnpq.br/123456789",
      linkedin: "https://linkedin.com/in/carlossilva",
      descricao: "Doutor em Ciência de Alimentos pela USP com pós-doutorado na University of California. Coordena projetos de pesquisa em bioprospecção e desenvolvimento de alimentos funcionais.",
      projetos: 8,
      publicacoes: 32,
      formacao: "Doutorado em Ciência de Alimentos (USP)",
      areasInteresse: ["Química de Alimentos", "Bioprospecção", "Alimentos Funcionais"],
      status: "ativo"
    },
    {
      id: 2,
      nome: "Dra. Maria Santos",
      cargo: "Pesquisadora Principal",
      categoria: "professor",
      area: "Agronomia",
      imagem: "/images/equipe/professora1.jpg",
      email: "maria.santos@ifma.edu.br",
      lattes: "http://lattes.cnpq.br/987654321",
      linkedin: "https://linkedin.com/in/mariasantos",
      descricao: "Especialista em agricultura sustentável e manejo de solos. Desenvolve pesquisas em sistemas agroflorestais e recuperação de áreas degradadas.",
      projetos: 6,
      publicacoes: 28,
      formacao: "Doutorado em Agronomia (UFV)",
      areasInteresse: ["Agricultura Sustentável", "Manejo de Solos", "Agroflorestas"],
      status: "ativo"
    },
    {
      id: 3,
      nome: "Dr. Roberto Lima",
      cargo: "Pesquisador",
      categoria: "professor",
      area: "Recursos Hídricos",
      imagem: "/images/equipe/professor2.jpg",
      email: "roberto.lima@ifma.edu.br",
      lattes: "http://lattes.cnpq.br/456789123",
      linkedin: "https://linkedin.com/in/robertolima",
      descricao: "Especialista em gestão de recursos hídricos e qualidade da água. Desenvolve tecnologias para tratamento de efluentes e monitoramento ambiental.",
      projetos: 5,
      publicacoes: 21,
      formacao: "Doutorado em Engenharia Ambiental (UFMG)",
      areasInteresse: ["Gestão de Recursos Hídricos", "Qualidade da Água", "Tratamento de Efluentes"],
      status: "ativo"
    },
    {
      id: 4,
      nome: "Ana Clara Mendes",
      cargo: "Bolsista de Doutorado",
      categoria: "aluno",
      area: "Química Analítica",
      imagem: "/images/equipe/aluna1.jpg",
      email: "ana.mendes@estudante.ifma.edu.br",
      lattes: "http://lattes.cnpq.br/789123456",
      linkedin: "https://linkedin.com/in/anaclara",
      descricao: "Desenvolve pesquisa em métodos analíticos para detecção de contaminantes em alimentos. Mestre em Química pela UFMA.",
      projetos: 3,
      publicacoes: 9,
      formacao: "Mestrado em Química (UFMA)",
      areasInteresse: ["Química Analítica", "Contaminantes em Alimentos", "Métodos Analíticos"],
      status: "ativo"
    },
    {
      id: 5,
      nome: "João Pedro Almeida",
      cargo: "Bolsista de Mestrado",
      categoria: "aluno",
      area: "Agronomia",
      imagem: "/images/equipe/aluno1.jpg",
      email: "joao.almeida@estudante.ifma.edu.br",
      lattes: "http://lattes.cnpq.br/321654987",
      linkedin: "https://linkedin.com/in/joaopedro",
      descricao: "Pesquisa sistemas de irrigação eficientes e manejo hídrico em culturas do Maranhão. Engenheiro Agrônomo formado pelo IFMA.",
      projetos: 2,
      publicacoes: 5,
      formacao: "Engenharia Agronômica (IFMA)",
      areasInteresse: ["Irrigação", "Manejo Hídrico", "Agricultura de Precisão"],
      status: "ativo"
    },
    {
      id: 6,
      nome: "Fernanda Costa",
      cargo: "Bolsista de Iniciação Científica",
      categoria: "aluno",
      area: "Tecnologia de Alimentos",
      imagem: "/images/equipe/aluna2.jpg",
      email: "fernanda.costa@estudante.ifma.edu.br",
      lattes: "http://lattes.cnpq.br/654987321",
      linkedin: "https://linkedin.com/in/fernandacosta",
      descricao: "Desenvolve pesquisa em processamento de frutas nativas do Maranhão e desenvolvimento de produtos alimentícios.",
      projetos: 1,
      publicacoes: 2,
      formacao: "Tecnologia em Alimentos (IFMA)",
      areasInteresse: ["Processamento de Alimentos", "Frutas Nativas", "Desenvolvimento de Produtos"],
      status: "ativo"
    },
    {
      id: 7,
      nome: "Patrícia Oliveira",
      cargo: "Técnica de Laboratório",
      categoria: "colaborador",
      area: "Análises Laboratoriais",
      imagem: "/images/equipe/tecnica1.jpg",
      email: "patricia.oliveira@ifma.edu.br",
      lattes: "http://lattes.cnpq.br/147258369",
      linkedin: "https://linkedin.com/in/patriciaoliveira",
      descricao: "Responsável pela manutenção dos equipamentos e análises laboratoriais nos projetos do grupo. Especialista em análises químicas.",
      projetos: 12,
      publicacoes: 8,
      formacao: "Especialização em Química Analítica (UEMA)",
      areasInteresse: ["Análises Laboratoriais", "Gestão de Equipamentos", "Controle de Qualidade"],
      status: "ativo"
    },
    {
      id: 8,
      nome: "Ricardo Souza",
      cargo: "Analista de Dados",
      categoria: "colaborador",
      area: "Ciência de Dados",
      imagem: "/images/equipe/colaborador1.jpg",
      email: "ricardo.souza@ifma.edu.br",
      lattes: "http://lattes.cnpq.br/369258147",
      linkedin: "https://linkedin.com/in/ricardosouza",
      descricao: "Responsável pela análise estatística e modelagem de dados dos projetos de pesquisa. Mestre em Estatística pela UFMA.",
      projetos: 15,
      publicacoes: 18,
      formacao: "Mestrado em Estatística (UFMA)",
      areasInteresse: ["Análise Estatística", "Modelagem de Dados", "Machine Learning"],
      status: "ativo"
    }
  ];

  // Categorias para filtro
  const categories = [
    { id: 'todos', label: 'Todos', icon: <FaUsers />, count: teamMembers.length },
    { id: 'professor', label: 'Professores', icon: <FaChalkboardTeacher />, count: teamMembers.filter(m => m.categoria === 'professor').length },
    { id: 'aluno', label: 'Alunos', icon: <FaUserGraduate />, count: teamMembers.filter(m => m.categoria === 'aluno').length },
    { id: 'colaborador', label: 'Colaboradores', icon: <FaUserTie />, count: teamMembers.filter(m => m.categoria === 'colaborador').length },
  ];

  // Áreas de pesquisa
  const researchAreas = [
    { id: 'alimentos', label: 'Alimentos', icon: <FaFlask /> },
    { id: 'quimica', label: 'Química', icon: <FaMicroscope /> },
    { id: 'agronomia', label: 'Agronomia', icon: <FaSeedling /> },
    { id: 'recursos-hidricos', label: 'Recursos Hídricos', icon: <FaWater /> },
    { id: 'tecnologia', label: 'Tecnologia', icon: <FaLaptopCode /> },
  ];

  // Filtrar membros
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.area.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'todos' || member.categoria === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Estatísticas da equipe
  const stats = {
    total: teamMembers.length,
    professores: teamMembers.filter(m => m.categoria === 'professor').length,
    alunos: teamMembers.filter(m => m.categoria === 'aluno').length,
    colaboradores: teamMembers.filter(m => m.categoria === 'colaborador').length,
    projetosAtivos: teamMembers.reduce((acc, m) => acc + m.projetos, 0),
    publicacoes: teamMembers.reduce((acc, m) => acc + m.publicacoes, 0),
  };

  return (
    <div className={styles.equipeContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Nossa <span className={styles.highlight}>Equipe</span>
            </h1>
            <p className={styles.heroDescription}>
              Conheça os pesquisadores, professores, alunos e colaboradores que fazem do GIEPI 
              uma referência em pesquisa interdisciplinar no Maranhão.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>{stats.total}</div>
                <div className={styles.statLabel}>Membros</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>{stats.professores}</div>
                <div className={styles.statLabel}>Professores</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>{stats.alunos}</div>
                <div className={styles.statLabel}>Alunos</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>{stats.publicacoes}</div>
                <div className={styles.statLabel}>Publicações</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Áreas de Pesquisa */}
      <section className={styles.areasSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Áreas de <span className={styles.highlight}>Pesquisa</span></h2>
            <p className={styles.sectionSubtitle}>
              Nossa equipe atua em diversas áreas do conhecimento, promovendo pesquisa interdisciplinar
            </p>
          </div>
          
          <div className={styles.areasGrid}>
            {researchAreas.map(area => (
              <div key={area.id} className={styles.areaCard}>
                <div className={styles.areaIcon}>
                  {area.icon}
                </div>
                <h3 className={styles.areaTitle}>{area.label}</h3>
                <p className={styles.areaDescription}>
                  Pesquisa avançada em {area.label.toLowerCase()} com aplicações práticas e impacto social
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filtros e Busca */}
      <section className={styles.filtersSection}>
        <div className={styles.container}>
          <div className={styles.searchContainer}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar por nome, cargo ou área..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <div className={styles.filterButtons}>
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`${styles.filterButton} ${selectedCategory === category.id ? styles.active : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span className={styles.filterIcon}>{category.icon}</span>
                  <span className={styles.filterLabel}>{category.label}</span>
                  <span className={styles.filterCount}>{category.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Membros */}
      <section className={styles.membersSection}>
        <div className={styles.container}>
          <div className={styles.membersGrid}>
            {filteredMembers.map(member => (
              <div 
                key={member.id} 
                className={`${styles.memberCard} ${activeMember === member.id ? styles.active : ''}`}
                onMouseEnter={() => setActiveMember(member.id)}
                onMouseLeave={() => setActiveMember(null)}
              >
                <div className={styles.memberImage}>
                  <div className={styles.imageWrapper}>
                    <img 
                      src={member.imagem} 
                      alt={member.nome}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `/images/placeholder-avatar.jpg`;
                      }}
                    />
                    <div className={styles.memberCategory}>
                      {member.categoria === 'professor' && <FaChalkboardTeacher />}
                      {member.categoria === 'aluno' && <FaUserGraduate />}
                      {member.categoria === 'colaborador' && <FaUserTie />}
                      <span>{member.categoria}</span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.memberInfo}>
                  <div className={styles.memberHeader}>
                    <h3 className={styles.memberName}>{member.nome}</h3>
                    <p className={styles.memberRole}>{member.cargo}</p>
                    <div className={styles.memberArea}>
                      <span className={styles.areaBadge}>{member.area}</span>
                    </div>
                  </div>
                  
                  <div className={styles.memberStats}>
                    <div className={styles.stat}>
                      <span className={styles.statNumber}>{member.projetos}</span>
                      <span className={styles.statLabel}>Projetos</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statNumber}>{member.publicacoes}</span>
                      <span className={styles.statLabel}>Publicações</span>
                    </div>
                  </div>
                  
                  <div className={styles.memberBio}>
                    <p className={styles.bioText}>
                      {expandedBio === member.id ? member.descricao : `${member.descricao.substring(0, 100)}...`}
                    </p>
                    <button 
                      className={styles.readMore}
                      onClick={() => setExpandedBio(expandedBio === member.id ? null : member.id)}
                    >
                      {expandedBio === member.id ? (
                        <>
                          Ler menos <FaChevronUp />
                        </>
                      ) : (
                        <>
                          Ler mais <FaChevronDown />
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className={styles.memberDetails}>
                    <div className={styles.detailItem}>
                      <strong>Formação:</strong> {member.formacao}
                    </div>
                    <div className={styles.areasList}>
                      <strong>Áreas de Interesse:</strong>
                      <div className={styles.tags}>
                        {member.areasInteresse.map((area, idx) => (
                          <span key={idx} className={styles.tag}>{area}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.memberContact}>
                    <a href={`mailto:${member.email}`} className={styles.contactLink}>
                      <FaEnvelope /> Email
                    </a>
                    {member.lattes && (
                      <a href={member.lattes} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                        Lattes
                      </a>
                    )}
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                        <FaLinkedin /> LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredMembers.length === 0 && (
            <div className={styles.noResults}>
              <FaSearch className={styles.noResultsIcon} />
              <h3>Nenhum membro encontrado</h3>
              <p>Tente alterar os termos da busca ou os filtros selecionados</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>
              Quer fazer parte da nossa <span className={styles.highlight}>equipe</span>?
            </h2>
            <p className={styles.ctaDescription}>
              Temos oportunidades para alunos de iniciação científica, mestrado, doutorado e colaboradores.
              Junte-se a nós e contribua para a pesquisa científica no Maranhão.
            </p>
            <div className={styles.ctaButtons}>
              <a href="/oportunidades" className={styles.ctaButtonPrimary}>
                Ver Oportunidades
              </a>
              <a href="/contato" className={styles.ctaButtonSecondary}>
                Entrar em Contato
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <section className={styles.infoSection}>
        <div className={styles.container}>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3>Localização</h3>
              <p>IFMA - Campus Codó</p>
              <p>Rodovia MA-356, s/n</p>
              <p>Codó - MA, CEP: 65400-000</p>
            </div>
            
            <div className={styles.infoCard}>
              <h3>Contato</h3>
              <p>Email: giepi@ifma.edu.br</p>
              <p>Telefone: (99) 9999-9999</p>
              <p>Horário: Seg-Sex, 8h-18h</p>
            </div>
            
            <div className={styles.infoCard}>
              <h3>Junte-se a nós</h3>
              <p>Tem interesse em pesquisa?</p>
              <p>Envie seu currículo para:</p>
              <p>selecao@giepi.ifma.edu.br</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}