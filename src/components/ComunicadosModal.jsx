import React, { useState, useEffect } from 'react'
import { comunicadosService } from '../services/comunicdos.service'
import styles from '../styles/components/ComunicadosModal.module.css'
import {
  FaBell,
  FaCalendarAlt,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaFlask,
  FaImage,
  FaTimes,
  FaUserGraduate,
  FaUserTie
} from 'react-icons/fa'

export default function ComunicadosModal() {
  const [comunicados, setComunicados] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [currentComunicado, setCurrentComunicado] = useState(0)
  const [error, setError] = useState(null)
  const [imageErrors, setImageErrors] = useState({})
  const [dismissedIds, setDismissedIds] = useState([])

  // Função para obter imagem default baseada no tipo
  const getDefaultImage = (tipo) => {
    const defaults = {
      estudante: '/img/defaults/comunicado-estudante.png',
      pesquisador: '/img/defaults/comunicado-pesquisador.png',
      linha: '/img/defaults/comunicado-linha.png'
    };
    return defaults[tipo] || defaults.estudante;
  };

  // Função para criar imagem placeholder programática
  const createPlaceholderImage = (tipo, titulo) => {
    const svgString = `
      <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${getColorByType(tipo)}"/>
        <text x="50%" y="45%" text-anchor="middle" fill="white" font-size="24" font-family="Arial">
          ${titulo.substring(0, 20)}${titulo.length > 20 ? '...' : ''}
        </text>
        <text x="50%" y="55%" text-anchor="middle" fill="white" font-size="16" font-family="Arial">
          ${getTipoLabel(tipo)}
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svgString)}`;
  };

  const getColorByType = (tipo) => {
    const colors = {
      estudante: '#3B82F6',
      pesquisador: '#10B981',
      linha: '#8B5CF6'
    };
    return colors[tipo] || '#6B7280';
  };

  useEffect(() => {
    const carregarComunicados = async () => {
      try {
        console.log('🔄 Carregando comunicados ativos...')
        const data = await comunicadosService.buscarAtivos()
        console.log('📊 Dados recebidos da API:', data)
        
        let comunicadosAtivos = []
        if (data && data.comunicados && Array.isArray(data.comunicados)) {
          comunicadosAtivos = data.comunicados
          console.log('✅ Comunicados ativos encontrados:', comunicadosAtivos.length)
        } else if (Array.isArray(data)) {
          comunicadosAtivos = data
        }
        
        // Carregar IDs já descartados do localStorage
        const dismissedFromStorage = JSON.parse(localStorage.getItem('comunicados_dismissed') || '[]')
        setDismissedIds(dismissedFromStorage)
        
        // Filtrar comunicados que ainda não foram descartados
        const comunicadosNaoDismissed = comunicadosAtivos.filter(
          com => !dismissedFromStorage.includes(com.id)
        )
        
        setComunicados(comunicadosNaoDismissed)
        
        // Mostrar modal se houver comunicados não descartados
        if (comunicadosNaoDismissed.length > 0) {
          console.log('🚀 Abrindo modal! Comunicados não visualizados:', comunicadosNaoDismissed.length)
          setShowModal(true)
        } else {
          console.log('📭 Todos os comunicados já foram visualizados ou descartados')
        }
      } catch (error) {
        console.error('❌ Erro ao carregar comunicados:', error)
        // setError('Não foi possível carregar os comunicados.')
      } finally {
        setLoading(false)
      }
    }
    
    carregarComunicados()
  }, [])

  const fecharModal = () => {
    // Marcar TODOS os comunicados atuais como descartados
    const newDismissedIds = [...dismissedIds, ...comunicados.map(c => c.id)]
    setDismissedIds(newDismissedIds)
    localStorage.setItem('comunicados_dismissed', JSON.stringify(newDismissedIds))
    
    setShowModal(false)
    console.log('📝 Comunicados marcados como visualizados:', newDismissedIds)
  }

  const fecharApenasEste = () => {
    // Marcar apenas o comunicado atual como descartado
    const currentId = comunicados[currentComunicado]?.id
    if (currentId) {
      const newDismissedIds = [...dismissedIds, currentId]
      setDismissedIds(newDismissedIds)
      localStorage.setItem('comunicados_dismissed', JSON.stringify(newDismissedIds))
      
      // Se ainda houver mais comunicados não descartados, ir para o próximo
      if (currentComunicado < comunicados.length - 1) {
        setCurrentComunicado(currentComunicado + 1)
      } else {
        setShowModal(false)
      }
    }
  }

  const irParaProximo = () => {
    if (currentComunicado < comunicados.length - 1) {
      setCurrentComunicado(currentComunicado + 1)
    } else {
      fecharModal()
    }
  }

  const irParaAnterior = () => {
    if (currentComunicado > 0) {
      setCurrentComunicado(currentComunicado - 1)
    }
  }

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'estudante':
        return <FaUserGraduate />
      case 'pesquisador':
        return <FaUserTie />
      case 'linha':
        return <FaFlask />
      default:
        return <FaBell />
    }
  }

  const getTipoLabel = (tipo) => {
    const labels = {
      estudante: 'Novo Estudante',
      pesquisador: 'Novo Pesquisador',
      linha: 'Nova Linha de Pesquisa'
    }
    return labels[tipo] || 'Novo Comunicado'
  }

  const formatarData = (dataString) => {
    const data = new Date(dataString)
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleImageError = (comunicadoId) => {
    console.log(`❌ Erro ao carregar imagem do comunicado ${comunicadoId}`)
    setImageErrors(prev => ({
      ...prev,
      [comunicadoId]: true
    }))
  }

  const getImageSource = (comunicado) => {
    if (imageErrors[comunicado.id]) {
      const defaultImage = getDefaultImage(comunicado.tipo)
      console.log(`🔄 Usando imagem default para comunicado ${comunicado.id}: ${defaultImage}`)
      return defaultImage
    }
    
    if (!comunicado.imagem) {
      return getDefaultImage(comunicado.tipo)
    }
    
    return comunicado.imagem
  }

  // Botão para limpar todos os descartados (para debug/administração)
  const limparDescartados = () => {
    localStorage.removeItem('comunicados_dismissed')
    setDismissedIds([])
    alert('Todos os comunicados foram redefinidos e aparecerão novamente.')
  }

  if (loading) {
    return (
      <div className={styles.loadingOverlay}>
        <div className={styles.spinner}></div>
        <p>Carregando comunicados...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorOverlay}>
        <p>{error}</p>
      </div>
    )
  }

  if (!showModal || comunicados.length === 0) {
    return null
  }

  const comunicado = comunicados[currentComunicado]
  const imageSrc = getImageSource(comunicado)
  const tipoClass = styles[`tipo_${comunicado.tipo}`] || styles.tipo_default

  return (
    <>
      <div className={styles.modalOverlay}>
        <section
          className={`${styles.modal} ${tipoClass}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="comunicado-title"
        >
          <div className={styles.modalHeader}>
            <div className={styles.tipoContainer}>
              <span className={styles.tipoIcon}>{getTipoIcon(comunicado.tipo)}</span>
              <div className={styles.tipoText}>
                <span className={styles.headerEyebrow}>Comunicado GIEPI</span>
                <span className={styles.tipoLabel}>
                  {getTipoLabel(comunicado.tipo)}
                </span>
              </div>
            </div>
            
            <div className={styles.headerActions}>
              <span className={styles.badgeInfo}>
                {currentComunicado + 1} de {comunicados.length}
              </span>
              <button
                type="button"
                className={styles.closeButton}
                onClick={fecharModal}
                aria-label="Fechar comunicados"
              >
                <FaTimes />
              </button>
            </div>
          </div>
          
          <div className={styles.modalContent}>
            <div className={styles.imagemContainer}>
              <img 
                src={imageSrc} 
                alt={comunicado.titulo}
                className={styles.imagem}
                onError={() => handleImageError(comunicado.id)}
                onLoad={() => console.log(`✅ Imagem carregada: ${imageSrc}`)}
              />
              <div className={styles.imageOverlay}>
                <span className={styles.imageTag}>{getTipoLabel(comunicado.tipo)}</span>
              </div>
              {imageErrors[comunicado.id] && (
                <div className={styles.imageFallback}>
                  <FaImage />
                  <p>Usando imagem padrão</p>
                </div>
              )}
            </div>
            
            <div className={styles.messagePanel}>
              <span className={styles.contentEyebrow}>Atualização do grupo</span>
              <h2 id="comunicado-title" className={styles.titulo}>{comunicado.titulo}</h2>
              
              {comunicado.descricao && (
                <p className={styles.descricao}>{comunicado.descricao}</p>
              )}
              
              <div className={styles.metaInfo}>
                <span className={styles.data}>
                  <FaCalendarAlt />
                  <span>Publicado em</span>
                  <strong>{formatarData(comunicado.criado_em)}</strong>
                </span>
                <span className={styles.statusBadge}>
                  <span className={styles.statusDot}></span>
                  Ativo
                </span>
              </div>
            </div>
          </div>
          
          <div className={styles.modalFooter}>
            {comunicados.length > 1 && (
              <>
                <button 
                  type="button"
                  onClick={irParaAnterior}
                  disabled={currentComunicado === 0}
                  className={`${styles.navButton} ${styles.prevButton}`}
                >
                  <FaChevronLeft />
                  Anterior
                </button>
                
                <div className={styles.navigationCenter}>
                  <div className={styles.dots} aria-label="Selecionar comunicado">
                    {comunicados.map((_, index) => (
                      <button
                        type="button"
                        key={index}
                        className={`${styles.dot} ${index === currentComunicado ? styles.activeDot : ''}`}
                        onClick={() => setCurrentComunicado(index)}
                        aria-label={`Ir para comunicado ${index + 1}`}
                      />
                    ))}
                  </div>
                  <span className={styles.footerCount}>
                    {currentComunicado + 1}/{comunicados.length}
                  </span>
                </div>
                
                <div className={styles.footerActions}>
                  <button 
                    type="button"
                    onClick={fecharApenasEste}
                    className={styles.dismissButton}
                  >
                    Já vi este
                  </button>
                  
                  <button 
                    type="button"
                    onClick={irParaProximo}
                    className={`${styles.navButton} ${styles.nextButton}`}
                  >
                    {currentComunicado === comunicados.length - 1 ? 'Fechar Todos' : 'Próximo'}
                    {currentComunicado === comunicados.length - 1 ? <FaCheckCircle /> : <FaChevronRight />}
                  </button>
                </div>
              </>
            )}
            
            {comunicados.length === 1 && (
              <div className={styles.singleActions}>
                <button 
                  type="button"
                  onClick={fecharApenasEste}
                  className={styles.dismissButton}
                >
                  Já vi este comunicado
                </button>
                <button 
                  type="button"
                  onClick={fecharModal}
                  className={styles.closeButtonLarge}
                >
                  <FaCheckCircle />
                  Fechar
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
