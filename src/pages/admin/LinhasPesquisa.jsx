import React, { useEffect, useState } from "react"
import AdminLayout from "../../layout/AdminLayout"
import Card from "../../ui/Card"
import Button from "../../ui/Button"
import Modal from "../../ui/Modal"
import Input from "../../ui/Input"
import FormGroup from "../../ui/FormGroup"
import Select from "../../ui/Select"
import { api } from "../../utils/api"
import toast from "react-hot-toast"
import styles from "../../styles/adminPages/linhasPesquisa.module.css"
import {
  FaSpinner,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFilter,
  FaFlask,
  FaUsers,
  FaBuilding,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa"

export default function LinhasPesquisas() {
  const [linhas, setLinhas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [filtroGrupo, setFiltroGrupo] = useState("todos")
  
  const [form, setForm] = useState({
    nome: "",
    pesquisadores: "",
    grupo: "",
    ativo: true
  })

  // Buscar todas as linhas
  const buscarLinhas = async () => {
    try {
      setLoading(true)
      const data = await api.get("/api/linhas-pesquisa")
      setLinhas(data || [])
    } catch (error) {
      console.error("❌ Erro ao carregar linhas de pesquisa:", error)
      toast.error(error.message || "Erro ao carregar linhas de pesquisa")
    } finally {
      setLoading(false)
    }
  }

  // Buscar estatísticas
  const buscarEstatisticas = async () => {
    try {
      const data = await api.get("/api/linhas-pesquisa/quantidade")
      return data
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error)
      return null
    }
  }

  useEffect(() => {
    buscarLinhas()
  }, [])

  // Filtragem
  const linhasFiltradas = linhas.filter(linha => {
    const statusOk = filtroStatus === "todos" || 
      (filtroStatus === "ativo" && linha.ativo) ||
      (filtroStatus === "inativo" && !linha.ativo)
    
    const grupoOk = filtroGrupo === "todos" || linha.grupo === filtroGrupo
    
    return statusOk && grupoOk
  })

  // Obter grupos únicos para filtro
  const gruposUnicos = Array.from(new Set(linhas.map(l => l.grupo).filter(Boolean)))

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
        await api.put(`/api/linhas-pesquisa/${editing.id}`, form)
        toast.success("Linha de pesquisa atualizada com sucesso!")
      } else {
        await api.post("/api/linhas-pesquisa", form)
        toast.success("Linha de pesquisa criada com sucesso!")
      }
      
      setModalOpen(false)
      setEditing(null)
      setForm({ nome: "", pesquisadores: "", grupo: "", ativo: true })
      buscarLinhas()
    } catch (error) {
      toast.error(error.message || "Erro ao salvar linha de pesquisa")
    }
  }

  const handleEdit = (linha) => {
    setEditing(linha)
    setForm({
      nome: linha.nome || "",
      pesquisadores: linha.pesquisadores || "",
      grupo: linha.grupo || "",
      ativo: linha.ativo !== false
    })
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta linha de pesquisa?")) return
    
    try {
      await api.delete(`/api/linhas-pesquisa/${id}`)
      toast.success("Linha de pesquisa excluída com sucesso!")
      buscarLinhas()
    } catch (error) {
      toast.error(error.message || "Erro ao excluir linha de pesquisa")
    }
  }

  const toggleStatus = async (id, atualStatus) => {
    try {
      await api.patch(`/api/linhas-pesquisa/${id}`, { ativo: !atualStatus })
      toast.success(`Linha de pesquisa ${!atualStatus ? 'ativada' : 'desativada'} com sucesso!`)
      buscarLinhas()
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
            <h1 className={styles.title}>Linhas de Pesquisa</h1>
            <p className={styles.subtitle}>
              Gerencie as linhas de pesquisa do grupo
            </p>
          </div>
          
          <Button 
            onClick={() => setModalOpen(true)}
            className={styles.btnNovo}
          >
            <FaPlus /> Nova Linha
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
                  <FaCheckCircle /> Ativas
                </Button>
                <Button 
                  onClick={() => setFiltroStatus("inativo")}
                  variant={filtroStatus === "inativo" ? "primary" : "outline"}
                >
                  <FaTimesCircle /> Inativas
                </Button>
              </div>
            </div>
            
            <div className={styles.filtroGroup}>
              <label>Grupo</label>
              <Select
                value={filtroGrupo}
                onChange={(e) => setFiltroGrupo(e.target.value)}
                options={[
                  { value: "todos", label: "Todos os grupos" },
                  ...gruposUnicos.map(grupo => ({
                    value: grupo,
                    label: grupo
                  }))
                ]}
              />
            </div>
          </div>
        </Card>

        {/* Lista de linhas */}
        <Card>
          {loading ? (
            <div className={styles.loading}>
              <FaSpinner className={styles.spinner} />
              <p>Carregando linhas de pesquisa...</p>
            </div>
          ) : linhasFiltradas.length === 0 ? (
            <div className={styles.emptyState}>
              <FaFlask className={styles.emptyIcon} />
              <p>Nenhuma linha de pesquisa encontrada</p>
              <Button onClick={() => setModalOpen(true)}>
                <FaPlus /> Criar primeira linha
              </Button>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Pesquisadores</th>
                    <th>Grupo</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {linhasFiltradas.map((linha) => (
                    <tr key={linha.id}>
                      <td className={styles.colNome}>
                        <FaFlask className={styles.rowIcon} />
                        <strong>{linha.nome}</strong>
                      </td>
                      <td>
                        <div className={styles.pesquisadores}>
                          <FaUsers />
                          <span>{linha.pesquisadores || "Não especificado"}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.grupo}>
                          <FaBuilding />
                          <span>{linha.grupo || "Não especificado"}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.status} ${linha.ativo ? styles.ativo : styles.inativo}`}>
                          {linha.ativo ? "Ativa" : "Inativa"}
                        </span>
                      </td>
                      <td className={styles.colAcoes}>
                        <Button 
                          onClick={() => handleEdit(linha)}
                          variant="outline"
                          size="sm"
                          title="Editar"
                        >
                          <FaEdit />
                        </Button>
                        
                        <Button 
                          onClick={() => toggleStatus(linha.id, linha.ativo)}
                          variant={linha.ativo ? "warning" : "success"}
                          size="sm"
                          title={linha.ativo ? "Desativar" : "Ativar"}
                        >
                          {linha.ativo ? <FaTimesCircle /> : <FaCheckCircle />}
                        </Button>
                        
                        <Button 
                          onClick={() => handleDelete(linha.id)}
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
            setForm({ nome: "", pesquisadores: "", grupo: "", ativo: true })
          }}
          title={editing ? "Editar Linha de Pesquisa" : "Nova Linha de Pesquisa"}
          size="lg"
        >
          <form onSubmit={handleSubmit} className={styles.modalForm}>
            <FormGroup label="Nome da Linha *">
              <Input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Ex: Química Orgânica, Recursos Hídricos"
                required
              />
            </FormGroup>

            <FormGroup label="Pesquisadores Responsáveis">
              <Input
                name="pesquisadores"
                value={form.pesquisadores}
                onChange={handleChange}
                placeholder="Nomes dos pesquisadores responsáveis"
              />
            </FormGroup>

            <FormGroup label="Grupo/Área">
              <Input
                name="grupo"
                value={form.grupo}
                onChange={handleChange}
                placeholder="Grupo de pesquisa ou área temática"
              />
            </FormGroup>

            <FormGroup>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="ativo"
                  checked={form.ativo}
                  onChange={handleChange}
                />
                <span>Linha ativa</span>
              </label>
            </FormGroup>

            <div className={styles.modalActions}>
              <Button 
                variant="outline" 
                onClick={() => {
                  setModalOpen(false)
                  setEditing(null)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editing ? "Atualizar" : "Criar Linha"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}