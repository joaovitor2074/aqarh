import { useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import styles from "../styles/components/EditarComunicadoModal.module.css"
import { FaTimes } from "react-icons/fa"

export default function EditarComunicadoModal({
  isOpen,
  onClose,
  comunicado,
  onSave
}) {
  const [form, setForm] = useState(null)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (comunicado) {
      setForm(comunicado)

      if (comunicado.imagem) {
        setPreview(comunicado.imagem)
      } else {
        setPreview(getImagemDefault(comunicado.tipo))
      }
    }
  }, [comunicado])

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop: (files) => {
      const file = files[0]
      setForm({ ...form, novaImagem: file })
      setPreview(URL.createObjectURL(file))
    }
  })

  if (!isOpen || !form) return null

  function getImagemDefault(tipo) {
    if (tipo === "estudante") return "/defaults/comunicado-estudante.png"
    if (tipo === "pesquisador") return "/defaults/comunicado-pesquisador.png"
    return "/defaults/comunicado-linha.png"
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSave() {
  const formData = new FormData()
  console.log(form)


  formData.append("titulo", form.titulo)
  formData.append("descricao", form.descricao)
  formData.append("tipo", form.tipo)

  if (form.novaImagem) {
    formData.append("imagem", form.novaImagem)
  }

  await fetch(`http://localhost:3000/comunicados/${form.id}`, {
    method: "PUT",
    body: formData
  })

  onClose()
}


  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>

        <button className={styles.close} onClick={onClose}>
          <FaTimes />
        </button>

        <h2>Editar Comunicado</h2>

        {/* Título */}
        <input
          type="text"
          name="titulo"
          value={form.titulo}
          onChange={handleChange}
          placeholder="Título do comunicado"
        />

        {/* Descrição */}
        <textarea
          name="descricao"
          value={form.descricao || ""}
          onChange={handleChange}
          placeholder="Descrição"
        />

        {/* Tipo */}
        <select name="tipo" value={form.tipo} onChange={handleChange}>
          <option value="estudante">Estudante</option>
          <option value="pesquisador">Pesquisador</option>
          <option value="linha">Linha de Pesquisa</option>
        </select>

        {/* Upload de imagem */}
        <div {...getRootProps()} className={styles.dropzone}>
          <input {...getInputProps()} />
          <p>Clique ou arraste uma imagem</p>
        </div>

        {/* Preview */}
        {preview && (
          <img src={preview} className={styles.preview} />
        )}

        <div className={styles.actions}>
          <button onClick={handleSave} className={styles.save}>
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  )
}
