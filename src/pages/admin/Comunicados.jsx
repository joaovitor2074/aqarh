import AdminLayout from '../../layout/AdminLayout'
import React, { useEffect, useState } from 'react'
import Button from '../../ui/Button'
import Card from '../../ui/Card'
import { FaPen, FaTrash, FaCheck } from 'react-icons/fa'
import styles from '../../styles/adminPages/comunicados.module.css'
import Modal from '../../ui/Modal'
import FormGroup from '../../ui/FormGroup'
import Input from '../../ui/Input'

export default function Comunicados() {
  const [openModal, setOpenModal] = useState(false)
  const [comunicados, setComunicados] = useState([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    data: ""
  })

  // 🔹 Buscar comunicados em rascunho
  async function carregarComunicados() {
    try {
      const res = await fetch("http://localhost:3000/comunicados/rascunhos")
      const data = await res.json()
      setComunicados(data.comunicados || []);
    } catch (err) {
      console.error("Erro ao carregar comunicados:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarComunicados()
  }, [])

  // 🔹 Ativar comunicado
  async function postarComunicado(id) {
    try {
      const res = await fetch(
        `http://localhost:3000/admin/comunicados/${id}/ativar`,
        { method: "POST" }
      )

      if (!res.ok) throw new Error("Erro ao postar comunicado")

      // remove da lista de rascunhos
      setComunicados(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      console.error(err)
      alert("Erro ao postar comunicado")
    }
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6 mt-10">
        <h1 className={`${styles.tituloCom} text-4xl font-black`}>
          Comunicados (Rascunhos)
        </h1>

        <Button
          onClick={() => setOpenModal(true)}
          className={`btn my-5 ${styles.novoComBtn}`}
        >
          Novo Comunicado
        </Button>
      </div>

      <Card>
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Título</th>
              <th className="px-4 py-2 text-left">Descrição</th>
              <th className="px-4 py-2 text-left">Data</th>
              <th className="px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="4" className="px-4 py-4">
                  Carregando...
                </td>
              </tr>
            )}

            {!loading && comunicados.length === 0 && (
              <tr>
                <td colSpan="4" className="px-4 py-4">
                  Nenhum comunicado em rascunho
                </td>
              </tr>
            )}

            {comunicados.map((com) => (
              <tr key={com.id} className={styles.row}>
                <td className={styles.titulo}>{com.titulo}</td>
                <td className={styles.descricao}>{com.descricao}</td>
                <td className={styles.data}>
                  {new Date(com.criado_em).toLocaleDateString()}
                </td>
                <td className={styles.acoes}>
                  <Button className={styles.editarBtn}>
                    <FaPen />
                  </Button>

                  <Button
                    onClick={() => postarComunicado(com.id)}
                    className={styles.postarBtn}
                  >
                    <FaCheck />
                  </Button>

                  <Button
                    variant="danger"
                    className={styles.deleteBtn}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Modal Novo Comunicado (opcional por enquanto) */}
      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        title="Novo Comunicado"
      >
        <div className="space-y-4">
          <FormGroup label="Título">
            <Input
              name="titulo"
              value={form.titulo}
              onChange={(e) =>
                setForm({ ...form, titulo: e.target.value })
              }
            />
          </FormGroup>

          <FormGroup label="Descrição">
            <Input
              name="descricao"
              value={form.descricao}
              onChange={(e) =>
                setForm({ ...form, descricao: e.target.value })
              }
            />
          </FormGroup>

          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setOpenModal(false)}
            >
              Cancelar
            </Button>
            <Button disabled>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}
