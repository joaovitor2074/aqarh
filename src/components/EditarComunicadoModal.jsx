import { useEffect, useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import styles from "../styles/components/EditarComunicadoModal.module.css"
import { FaTimes, FaUpload } from "react-icons/fa"
import { comunicadosService } from '../services/comunicdos.service'


export default function EditarComunicadoModal({
    isOpen,
    onClose,
    comunicado,
    onSave
}) {
    const [form, setForm] = useState({
        titulo: "",
        descricao: "",
        tipo: "estudante",
        imagem: null,
        novaImagem: null
    })
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)

    // Inicializar form quando comunicado muda
    useEffect(() => {
        if (comunicado) {
            setForm({
                id: comunicado.id,
                titulo: comunicado.titulo || "",
                descricao: comunicado.descricao || "",
                tipo: comunicado.tipo || "estudante",
                imagem: comunicado.imagem || null,
                novaImagem: null
            })

            // Configurar preview
            if (comunicado.imagem) {
                setPreview(comunicado.imagem)
            } else {
                setPreview(getImagemDefault(comunicado.tipo || "estudante"))
            }
        }
    }, [comunicado])

    // Configurar dropzone
    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0]
        if (file) {
            setForm(prev => ({
                ...prev,
                novaImagem: file
            }))
            setPreview(URL.createObjectURL(file))
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
        },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024 // 5MB
    })

    // Funções helper
    function getImagemDefault(tipo) {
        const defaults = {
            estudante: "/defaults/comunicado-estudante.png",
            pesquisador: "/defaults/comunicado-pesquisador.png",
            linha: "/defaults/comunicado-linha.png"
        }
        return defaults[tipo] || defaults.estudante
    }

    function handleChange(e) {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: value
        }))

        // Atualizar preview se mudar o tipo
        if (name === 'tipo' && !form.novaImagem && !form.imagem) {
            setPreview(getImagemDefault(value))
        }
    }

    async function handleSave() {
        try {
            setLoading(true)

            // Validação básica
            if (!form.titulo.trim()) {
                alert("Por favor, insira um título")
                return
            }

            await comunicadosService.atualizar(form.id, form)
            onClose()
        } catch (error) {
            console.error("Erro ao salvar:", error)
            alert(`Erro ao salvar comunicado: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    function handleCancel() {
        // Limpar preview se for de nova imagem
        if (preview && preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview)
        }
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>Editar Comunicado</h2>
                    <button className={styles.close} onClick={handleCancel}>
                        <FaTimes />
                    </button>
                </div>

                <div className={styles.form}>
                    {/* Título */}
                    <div className={styles.formGroup}>
                        <label>Título *</label>
                        <input
                            type="text"
                            name="titulo"
                            value={form.titulo}
                            onChange={handleChange}
                            placeholder="Digite o título do comunicado"
                            className={styles.input}
                        />
                    </div>

                    {/* Descrição */}
                    <div className={styles.formGroup}>
                        <label>Descrição</label>
                        <textarea
                            name="descricao"
                            value={form.descricao}
                            onChange={handleChange}
                            placeholder="Digite a descrição"
                            className={styles.textarea}
                            rows="4"
                        />
                    </div>

                    {/* Tipo */}
                    <div className={styles.formGroup}>
                        <label>Tipo</label>
                        <select
                            name="tipo"
                            value={form.tipo}
                            onChange={handleChange}
                            className={styles.select}
                        >
                            <option value="estudante">Estudante</option>
                            <option value="pesquisador">Pesquisador</option>
                            <option value="linha">Linha de Pesquisa</option>
                        </select>
                    </div>

                    {/* Upload de imagem */}
                    <div className={styles.formGroup}>
                        <label>Imagem</label>
                        <div
                            {...getRootProps()}
                            className={`${styles.dropzone} ${isDragActive ? styles.dragActive : ''}`}
                        >
                            <input {...getInputProps()} />
                            <FaUpload className={styles.uploadIcon} />
                            <p>
                                {isDragActive
                                    ? "Solte a imagem aqui..."
                                    : "Arraste uma imagem ou clique para selecionar"}
                            </p>
                            <small>PNG, JPG, GIF até 5MB</small>
                        </div>
                    </div>

                    {/* Preview da imagem */}
                    {preview && (
                        <div className={styles.previewContainer}>
                            <label>Preview</label>
                            <div className={styles.previewWrapper}>
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className={styles.preview}
                                    onLoad={() => {
                                        // Liberar URL do objeto quando a imagem carregar
                                        if (preview.startsWith('blob:')) {
                                            URL.revokeObjectURL(preview)
                                        }
                                    }}
                                />
                                {(form.novaImagem || form.imagem) && (
                                    <div className={styles.previewInfo}>
                                        {form.novaImagem ? "Nova imagem" : "Imagem atual"}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Ações */}
                    <div className={styles.actions}>
                        <button
                            onClick={handleCancel}
                            className={styles.cancel}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className={styles.save}
                            disabled={loading}
                        >
                            {loading ? "Salvando..." : "Salvar alterações"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}