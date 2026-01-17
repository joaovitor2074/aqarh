import React, { useEffect, useState, useCallback } from "react"
import AdminLayout from "../../layout/AdminLayout"
import Card from "../../ui/Card"
import Button from "../../ui/Button"
import Modal from "../../ui/Modal"
import Input from "../../ui/Input"
import FormGroup from "../../ui/FormGroup"
import Select from "../../ui/Select"
import { api } from "../../utils/api"
import toast from "react-hot-toast"
import styles from "../../styles/adminPages/membros.module.css"
import {
  FaSpinner,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFilter,
  FaUser,
  FaUserGraduate,
  FaEnvelope,
  FaGraduationCap,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaIdCard,
  FaBriefcase,
  FaUniversity
} from "react-icons/fa"

export default function Membros() {
  // Estados
  const [membros, setMembros] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [estatisticas, setEstatisticas] = useState(null)
  
  // Filtros
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [filtroVinculo, setFiltroVinculo] = useState("todos")
  const [filtroTitulacao, setFiltroTitulacao] = useState("todos")
  
  // Formulário
  const [form, setForm] = useState({
    nome: "",
    titulacao_maxima: "",
    data_inclusao: new Date().toISOString().split('T')[0],
    email: "",
    tipo_vinculo: "pesquisador",
    ativo: true,
    linha_pesquisa_id: null,
    lattes_url: "",
    orcid: "",
    instituicao: "",
    cargo: ""
  })

  // Buscar todos os membros
  // Alterar todas as chamadas API
const buscarMembros = useCallback(async () => {
  try {
    setLoading(true)
    const params = new URLSearchParams()
    if (filtroStatus !== "todos") {
      params.append("ativo", filtroStatus === "ativo" ? "true" : "false")
    }
    if (filtroVinculo !== "todos") {
      params.append("tipo_vinculo", filtroVinculo)
    }
    if (filtroTitulacao !== "todos") {
      params.append("titulacao_maxima", filtroTitulacao)
    }
    
    const query = params.toString()
    const url = `/membros${query ? `?${query}` : ""}` // REMOVER /api
    const data = await api.get(url)
    setMembros(data || [])
  } catch (error) {
    console.error("❌ Erro ao carregar membros:", error)
    toast.error(error.message || "Erro ao carregar membros")
  } finally {
    setLoading(false)
  }
}, [filtroStatus, filtroVinculo, filtroTitulacao])

const buscarEstatisticas = async () => {
  try {
    const data = await api.get("/membros/quantidade") // REMOVER /api
    setEstatisticas(data)
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
  }
}


  // Buscar linhas de pesquisa para o select
  const [linhasPesquisa, setLinhasPesquisa] = useState([])
  const buscarLinhasPesquisa = async () => {
  try {
    const data = await api.get("/linhas-pesquisa") // REMOVER /api
    setLinhasPesquisa(data || [])
  } catch (error) {
    console.error("Erro ao buscar linhas de pesquisa:", error)
  }
}

  useEffect(() => {
    buscarMembros()
    buscarEstatisticas()
    buscarLinhasPesquisa()
  }, [buscarMembros])

  // Filtragem
  const titulacoesUnicas = Array.from(new Set(membros.map(m => m.titulacao_maxima).filter(Boolean)))

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/membros/${editing.id}`, form)
        toast.success("Membro atualizado com sucesso!")
      } else {
        await api.post("/membros", form)
        toast.success("Membro criado com sucesso!")
      }
      
      setModalOpen(false)
      setEditing(null)
      resetForm()
      buscarMembros()
      buscarEstatisticas()
    } catch (error) {
      toast.error(error.message || "Erro ao salvar membro")
    }
  }

  const resetForm = () => {
    setForm({
      nome: "",
      titulacao_maxima: "",
      data_inclusao: new Date().toISOString().split('T')[0],
      email: "",
      tipo_vinculo: "pesquisador",
      ativo: true,
      linha_pesquisa_id: null,
      lattes_url: "",
      orcid: "",
      instituicao: "",
      cargo: ""
    })
  }

  const handleEdit = (membro) => {
    setEditing(membro)
    setForm({
      nome: membro.nome || "",
      titulacao_maxima: membro.titulacao_maxima || "",
      data_inclusao: membro.data_inclusao ? membro.data_inclusao.split('T')[0] : new Date().toISOString().split('T')[0],
      email: membro.email || "",
      tipo_vinculo: membro.tipo_vinculo || "pesquisador",
      ativo: membro.ativo !== false,
      linha_pesquisa_id: membro.linha_pesquisa_id || null,
      lattes_url: membro.lattes_url || "",
      orcid: membro.orcid || "",
      instituicao: membro.instituicao || "",
      cargo: membro.cargo || ""
    })
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este membro?")) return
    
    try {
      await api.delete(`/membros/${id}`)
      toast.success("Membro excluído com sucesso!")
      buscarMembros()
      buscarEstatisticas()
    } catch (error) {
      toast.error(error.message || "Erro ao excluir membro")
    }
  }

  const toggleStatus = async (id, atualStatus) => {
    try {
      await api.patch(`/membros/${id}`, { ativo: !atualStatus })
      toast.success(`Membro ${!atualStatus ? 'ativado' : 'desativado'} com sucesso!`)
      buscarMembros()
      buscarEstatisticas()
    } catch (error) {
      toast.error(error.message || "Erro ao alterar status")
    }
  }

  return (
    <AdminLayout>
      <div className={styles.container}>
        {/* Cabeçalho */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Membros da Pesquisa</h1>
            <p className={styles.subtitle}>
              {estatisticas && (
                <>
                  Total: {estatisticas.total} | 
                  Ativos: {estatisticas.ativos} | 
                  Pesquisadores: {estatisticas.pesquisadores} | 
                  Estudantes: {estatisticas.estudantes}
                </>
              )}
            </p>
          </div>
          
          <Button 
            onClick={() => setModalOpen(true)}
            className={styles.btnNovo}
          >
            <FaPlus /> Novo Membro
          </Button>
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
                  onClick={() => setFiltroStatus("todos")}
                  variant={filtroStatus === "todos" ? "primary" : "outline"}
                >
                  Todos
                </Button>
                <Button 
                  onClick={() => setFiltroStatus("ativo")}
                  variant={filtroStatus === "ativo" ? "primary" : "outline"}
                >
                  <FaCheckCircle /> Ativos
                </Button>
                <Button 
                  onClick={() => setFiltroStatus("inativo")}
                  variant={filtroStatus === "inativo" ? "primary" : "outline"}
                >
                  <FaTimesCircle /> Inativos
                </Button>
              </div>
            </div>
            
            <div className={styles.filtroGroup}>
              <label>Tipo de Vínculo</label>
              <Select
                value={filtroVinculo}
                onChange={(e) => setFiltroVinculo(e.target.value)}
                options={[
                  { value: "todos", label: "Todos" },
                  { value: "pesquisador", label: "Pesquisadores" },
                  { value: "estudante", label: "Estudantes" },
                  { value: "colaborador", label: "Colaboradores" }
                ]}
              />
            </div>
            
            <div className={styles.filtroGroup}>
              <label>Titulação</label>
              <Select
                value={filtroTitulacao}
                onChange={(e) => setFiltroTitulacao(e.target.value)}
                options={[
                  { value: "todos", label: "Todas" },
                  ...titulacoesUnicas.map(tit => ({
                    value: tit,
                    label: tit
                  }))
                ]}
              />
            </div>
          </div>
        </Card>

        {/* Lista de membros */}
        <Card>
          {loading ? (
            <div className={styles.loading}>
              <FaSpinner className={styles.spinner} />
              <p>Carregando membros...</p>
            </div>
          ) : membros.length === 0 ? (
            <div className={styles.emptyState}>
              <FaUser className={styles.emptyIcon} />
              <p>Nenhum membro encontrado</p>
              <Button onClick={() => setModalOpen(true)}>
                <FaPlus /> Adicionar primeiro membro
              </Button>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Membro</th>
                    <th>Contato</th>
                    <th>Titulação</th>
                    <th>Vínculo</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {membros.map((membro) => (
                    <tr key={membro.id}>
                      <td className={styles.colMembro}>
                        <div className={styles.avatar}>
                          {membro.tipo_vinculo === "pesquisador" ? (
                            <FaUser className={styles.avatarIcon} />
                          ) : (
                            <FaUserGraduate className={styles.avatarIcon} />
                          )}
                        </div>
                        <div className={styles.membroInfo}>
                          <strong>{membro.nome}</strong>
                          {membro.cargo && (
                            <span className={styles.cargo}>{membro.cargo}</span>
                          )}
                          {membro.instituicao && (
                            <span className={styles.instituicao}>
                              <FaUniversity /> {membro.instituicao}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td>
                        <div className={styles.contato}>
                          {membro.email && (
                            <a href={`mailto:${membro.email}`} className={styles.email}>
                              <FaEnvelope /> {membro.email}
                            </a>
                          )}
                          {membro.lattes_url && (
                            <a href={membro.lattes_url} target="_blank" rel="noopener noreferrer" className={styles.lattes}>
                              <FaIdCard /> Lattes
                            </a>
                          )}
                          {membro.orcid && (
                            <span className={styles.orcid}>
                              ORCID: {membro.orcid}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td>
                        <div className={styles.titulacao}>
                          <FaGraduationCap />
                          <span>{membro.titulacao_maxima || "Não informada"}</span>
                        </div>
                        {membro.data_inclusao && (
                          <div className={styles.dataInclusao}>
                            <FaCalendarAlt />
                            <span>{new Date(membro.data_inclusao).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                      </td>
                      
                      <td>
                        <span className={`${styles.vinculo} ${styles[membro.tipo_vinculo]}`}>
                          {membro.tipo_vinculo === "pesquisador" ? "Pesquisador" : 
                           membro.tipo_vinculo === "estudante" ? "Estudante" : 
                           membro.tipo_vinculo === "colaborador" ? "Colaborador" : 
                           membro.tipo_vinculo}
                        </span>
                      </td>
                      
                      <td>
                        <span className={`${styles.status} ${membro.ativo ? styles.ativo : styles.inativo}`}>
                          {membro.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      
                      <td className={styles.colAcoes}>
                        <Button 
                          onClick={() => handleEdit(membro)}
                          variant="outline"
                          size="sm"
                          title="Editar"
                        >
                          <FaEdit />
                        </Button>
                        
                        <Button 
                          onClick={() => toggleStatus(membro.id, membro.ativo)}
                          variant={membro.ativo ? "warning" : "success"}
                          size="sm"
                          title={membro.ativo ? "Desativar" : "Ativar"}
                        >
                          {membro.ativo ? <FaTimesCircle /> : <FaCheckCircle />}
                        </Button>
                        
                        <Button 
                          onClick={() => handleDelete(membro.id)}
                          variant="danger"
                          size="sm"
                          title="Excluir"
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Modal para criar/editar */}
        <Modal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setEditing(null)
            resetForm()
          }}
          title={editing ? "Editar Membro" : "Novo Membro"}
          size="lg"
        >
          <form onSubmit={handleSubmit} className={styles.modalForm}>
            <div className={styles.formRow}>
              <FormGroup label="Nome Completo *" className={styles.formGroup}>
                <Input
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  placeholder="Nome completo do membro"
                  required
                />
              </FormGroup>
              
              <FormGroup label="Email" className={styles.formGroup}>
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="email@exemplo.com"
                />
              </FormGroup>
            </div>
            
            <div className={styles.formRow}>
              <FormGroup label="Tipo de Vínculo *" className={styles.formGroup}>
                <Select
                  name="tipo_vinculo"
                  value={form.tipo_vinculo}
                  onChange={handleChange}
                  options={[
                    { value: "pesquisador", label: "Pesquisador" },
                    { value: "estudante", label: "Estudante" },
                    { value: "colaborador", label: "Colaborador" }
                  ]}
                  required
                />
              </FormGroup>
              
              <FormGroup label="Titulação Máxima" className={styles.formGroup}>
                <Input
                  name="titulacao_maxima"
                  value={form.titulacao_maxima}
                  onChange={handleChange}
                  placeholder="Ex: Doutorado, Mestrado, Graduação"
                />
              </FormGroup>
            </div>
            
            <div className={styles.formRow}>
              <FormGroup label="Data de Inclusão" className={styles.formGroup}>
                <Input
                  name="data_inclusao"
                  type="date"
                  value={form.data_inclusao}
                  onChange={handleChange}
                />
              </FormGroup>
              
              <FormGroup label="Linha de Pesquisa" className={styles.formGroup}>
                <Select
                  name="linha_pesquisa_id"
                  value={form.linha_pesquisa_id || ""}
                  onChange={handleChange}
                  options={[
                    { value: "", label: "Não vinculada" },
                    ...linhasPesquisa.map(linha => ({
                      value: linha.id,
                      label: linha.nome
                    }))
                  ]}
                />
              </FormGroup>
            </div>
            
            <div className={styles.formRow}>
              <FormGroup label="Instituição" className={styles.formGroup}>
                <Input
                  name="instituicao"
                  value={form.instituicao}
                  onChange={handleChange}
                  placeholder="Instituição de origem"
                />
              </FormGroup>
              
              <FormGroup label="Cargo/Função" className={styles.formGroup}>
                <Input
                  name="cargo"
                  value={form.cargo}
                  onChange={handleChange}
                  placeholder="Cargo ou função"
                />
              </FormGroup>
            </div>
            
            <div className={styles.formRow}>
              <FormGroup label="URL Lattes" className={styles.formGroup}>
                <Input
                  name="lattes_url"
                  value={form.lattes_url}
                  onChange={handleChange}
                  placeholder="https://lattes.cnpq.br/..."
                />
              </FormGroup>
              
              <FormGroup label="ORCID" className={styles.formGroup}>
                <Input
                  name="orcid"
                  value={form.orcid}
                  onChange={handleChange}
                  placeholder="0000-0000-0000-0000"
                />
              </FormGroup>
            </div>
            
            <FormGroup>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="ativo"
                  checked={form.ativo}
                  onChange={handleChange}
                />
                <span>Membro ativo</span>
              </label>
            </FormGroup>
            
            <div className={styles.modalActions}>
              <Button 
                variant="outline" 
                onClick={() => {
                  setModalOpen(false)
                  setEditing(null)
                  resetForm()
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editing ? "Atualizar" : "Criar Membro"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}