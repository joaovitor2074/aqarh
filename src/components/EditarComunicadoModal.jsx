import { useEffect, useState, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
import styles from "../styles/components/EditarComunicadoModal.module.css"
import { FaTimes, FaUpload, FaImage, FaExclamationTriangle, FaCheck } from "react-icons/fa"

export default function EditarComunicadoModal({
    isOpen,
    onClose,
    comunicado,
    onSave
}) {
    const [form, setForm] = useState({
        id: "",
        titulo: "",
        descricao: "",
        tipo: "estudante",
        imagem: null,
        novaImagem: null
    })
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [imageError, setImageError] = useState(false)
    const [imageLoading, setImageLoading] = useState(true)
    const imageRef = useRef(null)
    const [imageLoaded, setImageLoaded] = useState(false)

    // Função para gerar URL da imagem
    const getImagemDefault = (tipo) => {
        const defaults = {
            estudante: "/img/defaults/comunicado-estudante.png",
            pesquisador: "/img/defaults/comunicado-pesquisador.png",
            linha: "/img/defaults/comunicado-linha.png"
        }
        return defaults[tipo] || defaults.estudante
    }

    // Função para garantir URL completa
    const getFullImageUrl = (path) => {
        if (!path) return null
        
        // Se já for uma URL completa (http:// ou https://), retorna como está
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path
        }
        
        // Se for um blob URL (nova imagem sendo carregada)
        if (path.startsWith('blob:')) {
            return path
        }
        
        // Se for um caminho relativo, adiciona o base URL
        const baseUrl = window.location.origin // http://localhost:3000
        return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
    }

    // Inicializar form quando comunicado muda
    useEffect(() => {
    if (comunicado && isOpen) {
        console.log("📦 Comunicado recebido para edição:", comunicado)
        console.log("🖼️ Dados da imagem:", {
            imagemNoComunicado: comunicado.imagem,
            tipo: comunicado.tipo,
            id: comunicado.id
        })
        
        setForm({
            id: comunicado.id,
            titulo: comunicado.titulo || "",
            descricao: comunicado.descricao || "",
            tipo: comunicado.tipo || "estudante",
            imagem: comunicado.imagem || null,
            novaImagem: null
        })

        // Configurar preview
        const defaultImage = getImagemDefault(comunicado.tipo || "estudante")
        console.log("⚙️ Imagem default para preview:", defaultImage)
        
        setPreview(defaultImage)
        setImageError(false)
        setImageLoading(true)
        setImageLoaded(false)

        // Se houver imagem no comunicado, tentar carregá-la
        if (comunicado.imagem) {
            const imageUrl = getFullImageUrl(comunicado.imagem)
            console.log("🖼 Tentando carregar imagem do banco:", imageUrl)
            
            // Teste rápido para ver se a URL é acessível
            const imgTest = new Image()
            imgTest.onload = () => {
                console.log("✅ Imagem é acessível via URL:", imageUrl)
            }
            imgTest.onerror = () => {
                console.log("❌ Imagem NÃO é acessível via URL:", imageUrl)
            }
            imgTest.src = imageUrl
            
            // Pré-carregar a imagem para preview
            const img = new Image()
            img.onload = () => {
                console.log("✅ Imagem do banco carregada com sucesso para preview")
                setPreview(imageUrl)
                setImageError(false)
                setImageLoading(false)
                setImageLoaded(true)
            }
            img.onerror = () => {
                console.log("❌ Falha ao carregar imagem do banco para preview")
                console.log("🔄 Usando imagem default:", defaultImage)
                setImageError(true)
                setImageLoading(false)
                // Mantém a imagem default
            }
            img.src = imageUrl
        } else {
            // Se não tem imagem, usar default
            console.log("ℹ️ Sem imagem no banco, usando default")
            setImageLoading(false)
            setImageLoaded(true)
        }
    }
}, [comunicado, isOpen])

    // Resetar quando fechar
    useEffect(() => {
        if (!isOpen) {
            setForm({
                id: "",
                titulo: "",
                descricao: "",
                tipo: "estudante",
                imagem: null,
                novaImagem: null
            })
            setPreview(null)
            setImageError(false)
            setImageLoading(false)
            setImageLoaded(false)
        }
    }, [isOpen])

    // Configurar dropzone
    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0]
        if (file) {
            console.log("📸 Nova imagem selecionada:", file.name, file.type, file.size)
            setForm(prev => ({
                ...prev,
                novaImagem: file
            }))
            const objectUrl = URL.createObjectURL(file)
            setPreview(objectUrl)
            setImageError(false)
            setImageLoading(false)
            setImageLoaded(true)
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

    function handleChange(e) {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: value
        }))

        // Atualizar preview se mudar o tipo e não houver nova imagem
        if (name === 'tipo' && !form.novaImagem && !comunicado?.imagem) {
            setPreview(getImagemDefault(value))
        }
    }

    const handleImageLoad = () => {
        console.log("✅ Imagem carregada no preview")
        setImageLoading(false)
        setImageError(false)
        setImageLoaded(true)
    }

    // Função de fallback para imagens
const getFallbackImage = (tipo) => {
    // URLs de fallback do placeholder.com
    const fallbacks = {
        estudante: `https://via.placeholder.com/600x400/3B82F6/FFFFFF?text=${encodeURIComponent('comunicado-estudante')}`,
        pesquisador: `https://via.placeholder.com/600x400/10B981/FFFFFF?text=${encodeURIComponent('comunicado-pesquisador')}`,
        linha: `https://via.placeholder.com/600x400/8B5CF6/FFFFFF?text=${encodeURIComponent('Linha de Pesquisa')}`
    }
    return fallbacks[tipo] || fallbacks.estudante
}

// E modifique a função handleImageError:
const handleImageError = (e) => {
    console.error("❌ Erro ao carregar imagem:", e)
    setImageError(true)
    setImageLoading(false)
    
    // Tentar carregar fallback
    setTimeout(() => {
        const fallbackImage = getFallbackImage(form.tipo)
        console.log("🔄 Tentando carregar fallback:", fallbackImage)
        setPreview(fallbackImage)
        setImageError(false)
        setImageLoading(true)
    }, 100)
}
    async function handleSave() {
    try {
        setLoading(true)

        // Validação básica
        if (!form.titulo.trim()) {
            alert("Por favor, insira um título")
            return
        }

        // Preparar dados para envio
        const dadosParaEnviar = {
            id: form.id,
            titulo: form.titulo,
            descricao: form.descricao,
            tipo: form.tipo
        }

        console.log("📤 Preparando para salvar comunicado:", {
            id: form.id,
            temNovaImagem: !!form.novaImagem,
            temImagemAtual: !!form.imagem,
            imagemAtual: form.imagem
        })

        // Determinar qual imagem usar
        if (form.novaImagem) {
            // Nova imagem selecionada
            dadosParaEnviar.novaImagem = form.novaImagem
            console.log("📤 Enviando nova imagem:", form.novaImagem.name)
        } else if (form.imagem && form.imagem.includes('/defaults/')) {
            // Usando imagem default do banco
            dadosParaEnviar.usarImagemDefault = true
            console.log("📤 Usando imagem default do banco")
        } else if (!form.imagem) {
            // Nenhuma imagem - usar default baseada no tipo
            dadosParaEnviar.usarImagemDefault = true
            console.log("📤 Usando imagem default (sem imagem no banco)")
        } else {
            // Mantendo imagem atual do banco (não default)
            console.log("📤 Mantendo imagem atual do banco")
        }

        console.log("📤 Dados para envio:", dadosParaEnviar)
        
        const resultado = await onSave(dadosParaEnviar)
        console.log("✅ Resultado do salvamento:", resultado)
        
    } catch (error) {
        console.error("Erro ao salvar:", error)
        alert(`Erro ao salvar comunicado: ${error.message}`)
    } finally {
        setLoading(false)
    }
}

    function handleCancel() {
        // Limpar preview se for de nova imagem (blob URL)
        if (preview && preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview)
        }
        onClose()
    }

    // Função para determinar o tipo de imagem sendo exibida
    const getImageType = () => {
        if (form.novaImagem) return "NOVA IMAGEM"
        if (form.imagem && form.imagem.includes('/defaults/')) return "IMAGEM PADRÃO"
        if (form.imagem) return "IMAGEM ATUAL"
        return "IMAGEM PADRÃO"
    }

    if (!isOpen || !comunicado) return null

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
                            disabled={loading}
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
                            disabled={loading}
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
                            disabled={loading}
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
                            className={`${styles.dropzone} ${isDragActive ? styles.dragActive : ''} ${loading ? styles.disabled : ''}`}
                            style={loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                        >
                            <input {...getInputProps()} disabled={loading} />
                            <FaUpload className={styles.uploadIcon} />
                            <p>
                                {isDragActive
                                    ? "Solte a imagem aqui..."
                                    : "Clique ou arraste para fazer upload"}
                            </p>
                            <small>PNG, JPG, GIF até 5MB</small>
                        </div>
                        <div className={styles.imagemInfo}>
                            {form.novaImagem ? (
                                <span className={styles.success}>
                                    <FaCheck /> Nova imagem selecionada: <strong>{form.novaImagem.name}</strong>
                                </span>
                            ) : form.imagem && !form.imagem.includes('/defaults/') ? (
                                <span className={styles.info}>
                                    🖼 Imagem atual do banco de dados
                                </span>
                            ) : (
                                <span className={styles.warning}>
                                    ⚙️ Usando imagem padrão para <strong>"{form.tipo}"</strong>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Preview da imagem */}
                    <div className={styles.previewContainer}>
                        <label>Preview da Imagem</label>
                        <div className={styles.previewWrapper}>
                            {imageLoading ? (
                                <div className={styles.imageLoading}>
                                    <FaImage className={styles.loadingIcon} />
                                    <p>Carregando imagem...</p>
                                </div>
                            ) : imageError ? (
                                <div className={styles.imageError}>
                                    <FaExclamationTriangle className={styles.errorIcon} />
                                    <p>Não foi possível carregar a imagem</p>
                                    <small>Usando imagem padrão</small>
                                </div>
                            ) : preview && imageLoaded ? (
                                <>
                                    <img
                                        ref={imageRef}
                                        src={getFullImageUrl(preview)}
                                        alt="Preview"
                                        className={styles.preview}
                                        onLoad={handleImageLoad}
                                        onError={handleImageError}
                                        crossOrigin="anonymous"
                                    />
                                    <div className={styles.previewInfo}>
                                        {getImageType()}
                                    </div>
                                </>
                            ) : null}
                        </div>
                        
                        <div className={styles.imageStats}>
                            {form.novaImagem ? (
                                <>
                                    <div><strong>Tamanho:</strong> {Math.round(form.novaImagem.size / 1024)} KB</div>
                                    <div><strong>Tipo:</strong> {form.novaImagem.type}</div>
                                    <div><strong>Última modificação:</strong> {new Date(form.novaImagem.lastModified).toLocaleDateString('pt-BR')}</div>
                                </>
                            ) : form.imagem ? (
                                <div><strong>Status:</strong> Imagem carregada do banco de dados</div>
                            ) : (
                                <div><strong>Status:</strong> Usando imagem padrão do sistema</div>
                            )}
                        </div>
                    </div>

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
                            {loading ? (
                                <>
                                    <span className={styles.spinnerSmall}></span>
                                    Salvando...
                                </>
                            ) : "Salvar alterações"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}