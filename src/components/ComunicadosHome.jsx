import React, { useState, useEffect } from 'react'
import { comunicadosService } from '../services/comunicdos.service'
import styles from '../styles/components/ComunicadosHome.module.css'
import { FaTimes, FaBell, FaUserGraduate, FaUserTie, FaFlask } from 'react-icons/fa'

export default function ComunicadosHome() {
  const [comunicados, setComunicados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchComunicadosAtivos = async () => {
      try {
        setLoading(true)
        const response = await comunicadosService.buscarAtivos()
        
        // A resposta pode vir em formatos diferentes
        let comunicadosAtivos = []
        if (response && response.comunicados) {
          comunicadosAtivos = response.comunicados
        } else if (Array.isArray(response)) {
          comunicadosAtivos = response
        }
        
        setComunicados(comunicadosAtivos)
      } catch (error) {
        console.error('Erro ao buscar comunicados ativos:', error)
        setError('Não foi possível carregar os comunicados.')
      } finally {
        setLoading(false)
      }
    }

    fetchComunicadosAtivos()
  }, [])

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Carregando comunicados...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
      </div>
    )
  }

  if (comunicados.length === 0) {
    return null // Não mostra nada se não houver comunicados
  }

  // Função para obter ícone baseado no tipo
  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'estudante':
        return <FaUserGraduate className={styles.estudanteIcon} />
      case 'pesquisador':
        return <FaUserTie className={styles.pesquisadorIcon} />
      case 'linha':
        return <FaFlask className={styles.linhaIcon} />
      default:
        return <FaBell className={styles.defaultIcon} />
    }
  }

  // Função para obter label do tipo
  const getTipoLabel = (tipo) => {
    const labels = {
      estudante: 'Estudante',
      pesquisador: 'Pesquisador',
      linha: 'Linha de Pesquisa'
    }
    return labels[tipo] || tipo
  }

  // Função para formatar data
  const formatarData = (dataString) => {
    const data = new Date(dataString)
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className={styles.comunicadosContainer}>
      <div className={styles.comunicadosHeader}>
        <FaBell className={styles.bellIcon} />
        <h2>Comunicados Importantes</h2>
      </div>
      
      <div className={styles.comunicadosGrid}>
        {comunicados.map((comunicado) => (
          <div key={comunicado.id} className={styles.comunicadoCard}>
            <div className={styles.comunicadoHeader}>
              <div className={styles.tipoWrapper}>
                {getTipoIcon(comunicado.tipo)}
                <span className={styles.tipoLabel}>{getTipoLabel(comunicado.tipo)}</span>
              </div>
              <span className={styles.data}>
                {formatarData(comunicado.criado_em)}
              </span>
            </div>
            
            <div className={styles.comunicadoContent}>
              {comunicado.imagem && (
                <div className={styles.imagemContainer}>
                  <img 
                    src={comunicado.imagem} 
                    alt={comunicado.titulo}
                    className={styles.comunicadoImagem}
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              )}
              
              <h3 className={styles.titulo}>{comunicado.titulo}</h3>
              
              {comunicado.descricao && (
                <p className={styles.descricao}>
                  {comunicado.descricao.length > 150 
                    ? `${comunicado.descricao.substring(0, 150)}...` 
                    : comunicado.descricao}
                </p>
              )}
            </div>
            
            <div className={styles.comunicadoFooter}>
              <span className={styles.statusAtivo}>
                ● Ativo
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.comunicadosInfo}>
        <p>
          <FaBell className={styles.infoIcon} />
          Estes são os comunicados ativos do nosso grupo de pesquisa.
        </p>
      </div>
    </div>
  )
}