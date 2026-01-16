import AdminLayout from '../../layout/AdminLayout'
import React, { useEffect, useState } from 'react'
import Button from '../../ui/Button'
import Card from '../../ui/Card'
import { FaPen, FaTrash, FaCheck } from 'react-icons/fa'
import { GiReturnArrow } from 'react-icons/gi'
import styles from '../../styles/adminPages/comunicados.module.css'
import Modal from '../../ui/Modal'
import FormGroup from '../../ui/FormGroup'
import Input from '../../ui/Input'

import EditarComunicadoModal from '../../components/EditarComunicadoModal'


export default function Comunicados() {
   const [openModal, setOpenModal] = useState(false)

  // Modal edição
  const [modalEditOpen, setModalEditOpen] = useState(false)
  const [comunicadoSelecionado, setComunicadoSelecionado] = useState(null)

  const [comunicados, setComunicados] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusSelecionado, setStatusSelecionado] = useState("rascunho")
  const [tipoSelecionado, setTipoSelecionado] = useState("todos")




 const comunicadosFiltrados = comunicados.filter((com) => {
    const statusOk = com.status === statusSelecionado
    const tipoOk = tipoSelecionado === "todos" || com.tipo === tipoSelecionado
    return statusOk && tipoOk
  })




    const [form, setForm] = useState({
    titulo: "",
    descricao: ""
  })
  async function salvarComunicado(form) {
  try {
    const formData = new FormData()

    formData.append("titulo", form.titulo)
    formData.append("descricao", form.descricao)
    formData.append("tipo", form.tipo)

    // 🔥 só envia se realmente tiver nova imagem
    if (form.novaImagem) {
      formData.append("imagem", form.novaImagem)
    }

    const res = await fetch(
      `http://localhost:3000/comunicados/${form.id}`,
      {
        method: "PUT",
        body: formData
        // ⚠️ NÃO definir headers aqui
      }
    )

    if (!res.ok) {
      throw new Error("Erro ao atualizar comunicado")
    }

    const data = await res.json()
    console.log("✔️ Comunicado atualizado:", data)

    // 🔄 Recarrega lista
    buscarComunicados()

  } catch (err) {
    console.error(err)
    alert("Erro ao salvar comunicado")
  }
}


  // 🔹 Buscar comunicados em rascunho
 async function carregarComunicados() {
    try {
      const res = await fetch("http://localhost:3000/comunicados/")
      const data = await res.json()
      setComunicados(data.comunicados || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarComunicados()
  }, [])

  async function postarComunicado(id) {
    await fetch(`http://localhost:3000/comunicados/${id}/ativar`, { method: "POST" })
    carregarComunicados()
  }

  async function arquivarComunicado(id) {
    await fetch(`http://localhost:3000/comunicados/${id}/arquivar`, { method: "POST" })
    carregarComunicados()
  }

  async function reativarComunicado(id) {
    await fetch(`http://localhost:3000/comunicados/${id}/reativar`, { method: "POST" })
    carregarComunicados()
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6 mt-10">
        <h1 className={`${styles.tituloCom} text-4xl font-black`}>
          Comunicados
        </h1>

        <div className="flex gap-3">
          <Button onClick={() => setStatusSelecionado("rascunho")}>Rascunhos</Button>
          <Button onClick={() => setStatusSelecionado("ativo")}>Ativos</Button>
          <Button onClick={() => setStatusSelecionado("arquivado")}>Arquivados</Button>
        </div>

        <Button onClick={() => setOpenModal(true)}>
          Novo Comunicado
        </Button>
      </div>

      <Card>
        <table className="table-auto w-full">
          <tbody>
            {comunicadosFiltrados.map((com) => (
              <tr key={com.id}>
                <td>{com.titulo}</td>
                <td>{com.descricao}</td>
                <td>{new Date(com.criado_em).toLocaleDateString()}</td>

                <td className={styles.acoes}>
                  {com.status === "rascunho" && (
                    <>
                      <Button
                        onClick={() => {
                          setComunicadoSelecionado(com)
                          setModalEditOpen(true)
                        }}
                      >
                        <FaPen />
                      </Button>

                      <Button onClick={() => postarComunicado(com.id)}>
                        <FaCheck />
                      </Button>
                    </>
                  )}

                  {com.status === "ativo" && (
                    <Button onClick={() => arquivarComunicado(com.id)}>
                      <FaTrash />
                    </Button>
                  )}

                  {com.status === "arquivado" && (
                    <Button onClick={() => reativarComunicado(com.id)}>
                      <GiReturnArrow />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Modal editar comunicado (ÚNICO) */}
    <EditarComunicadoModal
  isOpen={modalEditOpen}
  onClose={() => setModalEditOpen(false)}
  comunicado={comunicadoSelecionado}
  onSave={salvarComunicado}
/>



      {/* Modal novo comunicado */}
      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        title="Novo Comunicado"
      >
        <FormGroup label="Título">
          <Input
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          />
        </FormGroup>

        <FormGroup label="Descrição">
          <Input
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
        </FormGroup>
      </Modal>
    </AdminLayout>
  )
}