import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../../layout/AdminLayout'
import Button from '../../ui/Button'
import Card from '../../ui/Card'
import { 
  FaPen, 
  FaTrash, 
  FaCheck, 
  FaEye,
  FaEyeSlash,
  FaArchive,
  FaRedo,
  FaPlus,
  FaFilter,
  FaSpinner,
  FaSync
} from 'react-icons/fa'
import styles from '../../styles/adminPages/comunicados.module.css'
import Modal from '../../ui/Modal'
import FormGroup from '../../ui/FormGroup'
import Input from '../../ui/Input'
import Select from '../../ui/Select'
import EditarComunicadoModal from '../../components/EditarComunicadoModal'
import { comunicadosService } from '../../services/comunicdos.service'

export default function Comunicados() {
  // Estados
  const [comunicados, setComunicados] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusSelecionado, setStatusSelecionado] = useState("rascunho")
  const [tipoSelecionado, setTipoSelecionado] = useState("todos")
  const [estatisticas, setEstatisticas] = useState(null)
  const [atualizando, setAtualizando] = useState(false)
  
  // Modal de novo comunicado
  const [modalNovoOpen, setModalNovoOpen] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [formNovo, setFormNovo] = useState({
    titulo: "",
    descricao: "",
    tipo: "estudante",
    imagem: null
  })
  
  // Modal de edição
  const [modalEditOpen, setModalEditOpen] = useState(false)
  const [comunicadoSelecionado, setComunicadoSelecionado] = useState(null)

  // Buscar comunicados
  const buscarComunicados = useCallback(async () => {
    try {
      setLoading(true)
      console.log("🔍 Buscando comunicados com filtros:", { statusSelecionado, tipoSelecionado })
      
      const filtros = {}
      
      if (statusSelecionado !== 'todos') {
        filtros.status = statusSelecionado
      }
      
      if (tipoSelecionado !== 'todos') {
        filtros.tipo = tipoSelecionado
      }
      
      const data = await comunicadosService.buscarTodos(filtros)
      console.log("📦 Comunicados recebidos:", data)
      setComunicados(data.comunicados || [])
      
      // Buscar estatísticas separadamente
      const stats = await comunicadosService.buscarEstatisticas()
      setEstatisticas(stats)
    } catch (error) {
      console.error('❌ Erro ao buscar comunicados:', error)
      alert(`Erro ao carregar comunicados: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }, [statusSelecionado, tipoSelecionado])

  // Forçar atualização
  const forcarAtualizacao = async () => {
    try {
      setAtualizando(true)
      await buscarComunicados()
      alert('Lista atualizada com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar:', error)
    } finally {
      setAtualizando(false)
    }
  }

  // Efeito inicial
  useEffect(() => {
    buscarComunicados()
  }, [buscarComunicados])

  // Handlers para novo comunicado
  const handleNovoChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'imagem') {
      setFormNovo(prev => ({ 
        ...prev, 
        imagem: files[0],
        _hasImage: !!files[0] 
      }))
      console.log("📸 Imagem selecionada:", files[0])
    } else {
      setFormNovo(prev => ({ ...prev, [name]: value }))
    }
  }

  const criarComunicado = async () => {
    try {
      if (!formNovo.titulo.trim()) {
        alert('Por favor, insira um título')
        return
      }
      
      setEnviando(true)
      console.log("📤 Criando novo comunicado:", formNovo)
      
      await comunicadosService.criar(formNovo)
      
      alert('Comunicado criado com sucesso!')
      
      // Resetar form e fechar modal
      setFormNovo({
        titulo: "",
        descricao: "",
        tipo: "estudante",
        imagem: null,
        _hasImage: false
      })
      setModalNovoOpen(false)
      
      // Pequeno delay para garantir que o backend processou
      setTimeout(() => {
        buscarComunicados()
      }, 500)
      
    } catch (error) {
      console.error('❌ Erro ao criar comunicado:', error)
      alert(`Erro: ${error.message}`)
    } finally {
      setEnviando(false)
    }
  }

  // Handlers para edição
  const abrirEdicao = (comunicado) => {
    console.log("✏️ Abrindo edição para:", comunicado)
    setComunicadoSelecionado(comunicado)
    setModalEditOpen(true)
  }

  const salvarComunicado = async (formData) => {
    try {
      console.log("💾 Salvando comunicado:", formData)
      
      const resultado = await comunicadosService.atualizar(formData.id, formData)
      console.log("✅ Comunicado salvo:", resultado)
      
      alert('Comunicado atualizado com sucesso!')
      
      // Fechar modal e atualizar lista
      setModalEditOpen(false)
      setComunicadoSelecionado(null)
      
      // Pequeno delay para garantir que o backend processou
      setTimeout(() => {
        buscarComunicados()
      }, 500)
      
      return true
    } catch (error) {
      console.error('❌ Erro ao salvar comunicado:', error)
      alert(`Erro: ${error.message}`)
      throw error
    }
  }

  // Handlers para ações
  const executarAcao = async (acao, id, mensagemConfirmacao) => {
    if (!confirm(mensagemConfirmacao)) return
    
    try {
      await acao(id)
      alert('Ação realizada com sucesso!')
      
      // Pequeno delay para garantir que o backend processou
      setTimeout(() => {
        buscarComunicados()
      }, 300)
      
    } catch (error) {
      console.error('❌ Erro:', error)
      alert(`Erro: ${error.message}`)
    }
  }

  const ativarComunicado = (id) => 
    executarAcao(comunicadosService.ativar, id, 'Deseja ativar este comunicado?')

  const arquivarComunicado = (id) => 
    executarAcao(comunicadosService.arquivar, id, 'Deseja arquivar este comunicado?')

  const reativarComunicado = (id) => 
    executarAcao(comunicadosService.reativar, id, 'Deseja reativar este comunicado?')

  const deletarComunicado = (id) => 
    executarAcao(comunicadosService.deletar, id, 
      'Tem certeza que deseja deletar este comunicado? Esta ação não pode ser desfeita.')

  // Filtros
  const comunicadosFiltrados = comunicados.filter((com) => {
    const statusOk = statusSelecionado === 'todos' || com.status === statusSelecionado
    const tipoOk = tipoSelecionado === 'todos' || com.tipo === tipoSelecionado
    return statusOk && tipoOk
  })

  // Helper para status
  const getStatusBadge = (status) => {
    const badges = {
      rascunho: <span className={styles.badgeRascunho}>Rascunho</span>,
      ativo: <span className={styles.badgeAtivo}>Ativo</span>,
      arquivado: <span className={styles.badgeArquivado}>Arquivado</span>
    }
    return badges[status] || null
  }

  // Helper para tipo
  const getTipoLabel = (tipo) => {
    const labels = {
      estudante: 'Estudante',
      pesquisador: 'Pesquisador',
      linha: 'Linha de Pesquisa'
    }
    return labels[tipo] || tipo
  }

  // Helper para mostrar imagem
  const getImagemPreview = (comunicado) => {
    if (comunicado.imagem) {
      return (
        <div className={styles.imagemPreview} title="Tem imagem">
          📷
        </div>
      )
    }
    return (
      <div className={styles.imagemDefault} title="Imagem padrão">
        🏷️
      </div>
    )
  }

  return (
    <AdminLayout>
      {/* Header com estatísticas */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.tituloCom}>Comunicados</h1>
          <p className={styles.subtitulo}>
            {estatisticas ? (
              <>
                Total: {estatisticas.total} | 
                Ativos: {estatisticas.ativos} | 
                Rascunhos: {estatisticas.rascunhos} | 
                Arquivados: {estatisticas.arquivados}
              </>
            ) : 'Carregando estatísticas...'}
          </p>
        </div>
        
        <div className={styles.headerActions}>
          <Button 
            onClick={forcarAtualizacao}
            variant="outline"
            disabled={atualizando}
            title="Atualizar lista"
          >
            <FaSync className={atualizando ? styles.spinning : ''} />
            {atualizando ? ' Atualizando...' : ' Atualizar'}
          </Button>
          
          <Button 
            onClick={() => setModalNovoOpen(true)}
            className={styles.btnNovo}
          >
            <FaPlus /> Novo Comunicado
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className={styles.filtrosCard}>
        <div className={styles.filtrosHeader}>
          <FaFilter />
          <h3>Filtros</h3>
        </div>
        
        <div className={styles.filtrosGrid}>
          <div className={styles.filtroGroup}>
            <label>Status</label>
            <div className={styles.filtroBotoes}>
              <Button 
                onClick={() => setStatusSelecionado('todos')}
                variant={statusSelecionado === 'todos' ? 'primary' : 'outline'}
              >
                Todos
              </Button>
              <Button 
                onClick={() => setStatusSelecionado('rascunho')}
                variant={statusSelecionado === 'rascunho' ? 'primary' : 'outline'}
              >
                <FaEyeSlash /> Rascunhos
              </Button>
              <Button 
                onClick={() => setStatusSelecionado('ativo')}
                variant={statusSelecionado === 'ativo' ? 'primary' : 'outline'}
              >
                <FaEye /> Ativos
              </Button>
              <Button 
                onClick={() => setStatusSelecionado('arquivado')}
                variant={statusSelecionado === 'arquivado' ? 'primary' : 'outline'}
              >
                <FaArchive /> Arquivados
              </Button>
            </div>
          </div>
          
          <div className={styles.filtroGroup}>
            <label>Tipo</label>
            <Select
              value={tipoSelecionado}
              onChange={(e) => setTipoSelecionado(e.target.value)}
              options={[
                { value: 'todos', label: 'Todos os tipos' },
                { value: 'estudante', label: 'Estudante' },
                { value: 'pesquisador', label: 'Pesquisador' },
                { value: 'linha', label: 'Linha de Pesquisa' }
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Lista de comunicados */}
      <Card>
        {loading ? (
          <div className={styles.loading}>
            <FaSpinner className={styles.spinner} />
            <p>Carregando comunicados...</p>
          </div>
        ) : comunicadosFiltrados.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Nenhum comunicado encontrado</p>
            <p className={styles.emptySubtitle}>
              {statusSelecionado !== 'todos' && `para o status "${statusSelecionado}"`}
              {tipoSelecionado !== 'todos' && ` e tipo "${getTipoLabel(tipoSelecionado)}"`}
            </p>
            <Button onClick={() => setModalNovoOpen(true)}>
              <FaPlus /> Criar primeiro comunicado
            </Button>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Descrição</th>
                  <th>Tipo</th>
                  <th>Imagem</th>
                  <th>Status</th>
                  <th>Criado em</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {comunicadosFiltrados.map((com) => (
                  <tr key={com.id}>
                    <td className={styles.colTitulo}>
                      <strong>{com.titulo}</strong>
                    </td>
                    <td className={styles.colDescricao}>
                      {com.descricao?.substring(0, 100)}
                      {com.descricao?.length > 100 ? '...' : ''}
                    </td>
                    <td>
                      {getTipoLabel(com.tipo)}
                    </td>
                    <td className={styles.colImagem}>
                      {getImagemPreview(com)}
                    </td>
                    <td>
                      {getStatusBadge(com.status)}
                    </td>
                    <td>
                      {new Date(com.criado_em).toLocaleDateString('pt-BR')}
                      <div className={styles.dataHora}>
                        {new Date(com.criado_em).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </td>
                    <td className={styles.colAcoes}>
                      {com.status === "rascunho" && (
                        <>
                          <Button 
                            onClick={() => abrirEdicao(com)}
                            variant="outline"
                            size="sm"
                            title="Editar"
                          >
                            <FaPen />
                          </Button>
                          
                          <Button 
                            onClick={() => ativarComunicado(com.id)}
                            variant="success"
                            size="sm"
                            title="Publicar"
                          >
                            <FaCheck />
                          </Button>
                          
                          <Button 
                            onClick={() => deletarComunicado(com.id)}
                            variant="danger"
                            size="sm"
                            title="Deletar"
                          >
                            <FaTrash />
                          </Button>
                        </>
                      )}

                      {com.status === "ativo" && (
                        <>
                          <Button 
                            onClick={() => arquivarComunicado(com.id)}
                            variant="warning"
                            size="sm"
                            title="Arquivar"
                          >
                            <FaArchive />
                          </Button>
                        </>
                      )}

                      {com.status === "arquivado" && (
                        <>
                          <Button 
                            onClick={() => reativarComunicado(com.id)}
                            variant="success"
                            size="sm"
                            title="Reativar"
                          >
                            <FaRedo />
                          </Button>
                          
                          <Button 
                            onClick={() => deletarComunicado(com.id)}
                            variant="danger"
                            size="sm"
                            title="Deletar"
                          >
                            <FaTrash />
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de novo comunicado */}
      <Modal
        isOpen={modalNovoOpen}
        onClose={() => !enviando && setModalNovoOpen(false)}
        title="Novo Comunicado"
        size="lg"
      >
        <div className={styles.modalForm}>
          <FormGroup label="Título *">
            <Input
              value={formNovo.titulo}
              onChange={handleNovoChange}
              name="titulo"
              placeholder="Digite o título"
              required
              disabled={enviando}
            />
          </FormGroup>

          <FormGroup label="Descrição">
            <textarea
              value={formNovo.descricao}
              onChange={handleNovoChange}
              name="descricao"
              placeholder="Digite a descrição"
              className={styles.textareaModal}
              rows="4"
              disabled={enviando}
            />
          </FormGroup>

          <FormGroup label="Tipo">
            <Select
              value={formNovo.tipo}
              onChange={handleNovoChange}
              name="tipo"
              options={[
                { value: 'estudante', label: 'Estudante' },
                { value: 'pesquisador', label: 'Pesquisador' },
                { value: 'linha', label: 'Linha de Pesquisa' }
              ]}
              disabled={enviando}
            />
          </FormGroup>

          <FormGroup label="Imagem (opcional)">
            <Input
              type="file"
              onChange={handleNovoChange}
              name="imagem"
              accept="image/*"
              disabled={enviando}
            />
            <small className={styles.helpText}>
              Formatos: JPG, PNG, GIF, WebP (máx. 5MB). 
              {!formNovo.imagem && " Se não selecionar, será usada a imagem padrão para o tipo escolhido."}
            </small>
            {formNovo.imagem && (
              <div className={styles.fileInfo}>
                <strong>Arquivo selecionado:</strong> {formNovo.imagem.name} 
                ({Math.round(formNovo.imagem.size / 1024)} KB)
              </div>
            )}
          </FormGroup>

          <div className={styles.modalActions}>
            <Button 
              onClick={() => setModalNovoOpen(false)}
              variant="outline"
              disabled={enviando}
            >
              Cancelar
            </Button>
            <Button 
              onClick={criarComunicado}
              disabled={!formNovo.titulo.trim() || enviando}
            >
              {enviando ? (
                <>
                  <FaSpinner className={styles.spinnerButton} />
                  Criando...
                </>
              ) : 'Criar Comunicado'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de edição */}
      <EditarComunicadoModal
        isOpen={modalEditOpen}
        onClose={() => {
          setModalEditOpen(false)
          setComunicadoSelecionado(null)
        }}
        comunicado={comunicadoSelecionado}
        onSave={salvarComunicado}
      />
    </AdminLayout>
  )
}