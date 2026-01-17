import { db } from "../config/db.js"
import path from "path"
import { fileURLToPath } from 'url'
import fs from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Caminho para imagens defaults
// Caminho para imagens defaults
const DEFAULT_IMAGES_PATH = path.join(__dirname, '..', '..', 'public', 'img', 'defaults')
const UPLOADS_PATH = path.join(__dirname, '..', '..', 'public', 'uploads')
// Helper para caminhos de imagem
const getImagePath = (filename) => {
    if (!filename) return null
    // Remove qualquer prefixo de uploads se já existir
    const cleanFilename = filename.replace(/^\/?uploads\//, '')
    return `/uploads/${cleanFilename}`
}

// Helper para imagem default
const getImagemDefaultPath = (tipo) => {
    const defaults = {
        estudante: 'comunicado-estudante.png',
        pesquisador: 'comunicado-pesquisador.png',
        linha: 'comunicado-linha.png'
    }
    
    const filename = defaults[tipo] || defaults.estudante
    const filePath = path.join(DEFAULT_IMAGES_PATH, filename)
    
    // Verifica se o arquivo existe
    if (fs.existsSync(filePath)) {
        return `/img/defaults/${filename}`
    }
    
    console.log(`⚠️ Imagem default não encontrada: ${filePath}`)
    return null
}
const verificarImagem = (imagePath) => {
    if (!imagePath) return false
    
    // Se for URL completa, assume que existe
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return true
    }
    
    // Remove o prefixo do host se existir
    let localPath = imagePath
    if (imagePath.includes('://')) {
        const url = new URL(imagePath)
        localPath = url.pathname
    }
    
    // Caminho físico no servidor
    const fullPath = path.join(__dirname, '..', '..', 'public', localPath)
    
    // Verifica se o arquivo existe
    if (fs.existsSync(fullPath)) {
        console.log(`✅ Imagem existe: ${fullPath}`)
        return true
    } else {
        console.log(`❌ Imagem NÃO existe: ${fullPath}`)
        return false
    }
}
// Helper para URL completa
const getImageUrl = (imagePath, req) => {
    if (!imagePath) return null
    
    // Se já for uma URL completa, retorna como está
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
    }
    
    // Constrói a URL completa baseada na requisição
    const baseUrl = `${req.protocol}://${req.get('host')}`
    
    // Garante que o caminho comece com /
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
    
    return `${baseUrl}${cleanPath}`
}

export async function MostrarComunicados(req, res) {
    try {
        const { status, tipo } = req.query

        const filtros = []
        const valores = []

        if (status && status !== 'todos') {
            filtros.push("status = ?")
            valores.push(status)
        }

        if (tipo && tipo !== 'todos') {
            filtros.push("tipo = ?")
            valores.push(tipo)
        }

        const whereClause = filtros.length > 0 ? `WHERE ${filtros.join(" AND ")}` : ""

        const [rows] = await db.query(
            `SELECT * FROM comunicados ${whereClause} ORDER BY criado_em DESC`,
            valores
        )

        console.log(`📊 Encontrados ${rows.length} comunicados no banco`);

        // Processar imagens
        const comunicadosComImagem = rows.map(com => {
            let imagemUrl = null
            
            // Verifica se tem imagem específica no banco
            if (com.imagem) {
                console.log(`🔍 Verificando imagem do comunicado ${com.id}: ${com.imagem}`);
                
                if (verificarImagem(com.imagem)) {
                    imagemUrl = getImageUrl(com.imagem, req)
                    console.log(`✅ Imagem válida: ${imagemUrl}`);
                } else {
                    console.log(`⚠️ Imagem inválida, usando default`);
                    // Se não existe, usa default
                    const defaultPath = getImagemDefaultPath(com.tipo)
                    if (defaultPath) {
                        imagemUrl = getImageUrl(defaultPath, req)
                    }
                }
            } else {
                // Se não tem imagem, usa default
                console.log(`📭 Comunicado ${com.id} sem imagem, usando default`);
                const defaultPath = getImagemDefaultPath(com.tipo)
                if (defaultPath) {
                    imagemUrl = getImageUrl(defaultPath, req)
                }
            }
            
            return {
                ...com,
                imagem: imagemUrl
            }
        })

        return res.status(200).json({
            total: rows.length,
            comunicados: comunicadosComImagem
        })
    } catch (error) {
        console.error("❌ Erro ao listar comunicados:", error)
        return res.status(500).json({
            error: "Erro interno ao listar comunicados"
        })
    }
}



export async function CriarComunicado(req, res) {
    try {
        const { titulo, descricao, tipo } = req.body
        const imagem = req.file

        console.log("📝 Criando comunicado:", { 
            titulo, 
            tipo, 
            hasImage: !!imagem,
            imagemName: imagem?.filename 
        })

        // Determinar o caminho da imagem
        let imagemPath = null
        
        if (imagem && imagem.filename) {
            imagemPath = getImagePath(imagem.filename)
            console.log("🖼️ Caminho da imagem salvo:", imagemPath)
            
            // Verifica se o arquivo foi realmente salvo
            const fullPath = path.join(UPLOADS_PATH, imagem.filename)
            if (fs.existsSync(fullPath)) {
                console.log(`✅ Arquivo salvo em: ${fullPath}`)
            } else {
                console.log(`❌ Arquivo NÃO salvo em: ${fullPath}`)
            }
        } else {
            // Se não enviou imagem, usar default
            imagemPath = getImagemDefaultPath(tipo || 'estudante')
            console.log("⚙️ Usando imagem default:", imagemPath)
        }

        const [result] = await db.query(
            `INSERT INTO comunicados (titulo, descricao, tipo, imagem, status) 
             VALUES (?, ?, ?, ?, 'rascunho')`,
            [titulo, descricao, tipo, imagemPath]
        )

        const [novoComunicado] = await db.query(
            `SELECT * FROM comunicados WHERE id = ?`,
            [result.insertId]
        )

        // Preparar resposta com URL completa
        let imagemUrl = null
        if (novoComunicado[0].imagem) {
            imagemUrl = getImageUrl(novoComunicado[0].imagem, req)
            console.log("🌐 URL da imagem retornada:", imagemUrl)
        }

        return res.status(201).json({
            message: "Comunicado criado com sucesso",
            comunicado: {
                ...novoComunicado[0],
                imagem: imagemUrl
            }
        })
    } catch (error) {
        console.error("❌ Erro ao criar comunicado:", error)
        return res.status(500).json({
            error: "Erro interno ao criar comunicado"
        })
    }
}



export async function AtualizarComunicado(req, res) {
    try {
        const { id } = req.params
        const { titulo, descricao, tipo, usarImagemDefault } = req.body
        const novaImagem = req.file

        console.log("🔄 Atualizando comunicado:", { 
            id, 
            titulo, 
            tipo, 
            hasNewImage: !!novaImagem,
            usarImagemDefault,
            novaImagemName: novaImagem?.filename 
        })

        // 1. Buscar comunicado atual
        const [comunicadoAtual] = await db.query(
            `SELECT * FROM comunicados WHERE id = ?`,
            [id]
        )

        if (comunicadoAtual.length === 0) {
            return res.status(404).json({
                error: "Comunicado não encontrado"
            })
        }

        // 2. Verificar se pode editar (apenas rascunhos)
        if (comunicadoAtual[0].status !== 'rascunho') {
            return res.status(400).json({
                error: "Apenas comunicados em rascunho podem ser editados"
            })
        }

        // 3. Determinar imagem final
        let imagemFinal = comunicadoAtual[0].imagem
        
        if (novaImagem && novaImagem.filename) {
            console.log("🖼️ Nova imagem recebida:", novaImagem.filename);
            
            // Deletar imagem antiga se existir (exceto defaults)
            if (imagemFinal && !imagemFinal.includes('/img/defaults/')) {
                const oldImagePath = path.join(__dirname, '..', '..', 'public', imagemFinal)
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath)
                    console.log("🗑️ Imagem antiga deletada:", oldImagePath)
                }
            }
            imagemFinal = getImagePath(novaImagem.filename)
            console.log("🖼️ Nova imagem definida:", imagemFinal)
            
            // Verifica se o novo arquivo foi salvo
            const fullPath = path.join(UPLOADS_PATH, novaImagem.filename)
            if (fs.existsSync(fullPath)) {
                console.log(`✅ Novo arquivo salvo em: ${fullPath}`)
            } else {
                console.log(`❌ Novo arquivo NÃO salvo em: ${fullPath}`)
            }
        } else if (usarImagemDefault) {
            // Usar imagem default
            console.log("⚙️ Solicitado usar imagem default");
            imagemFinal = getImagemDefaultPath(tipo || comunicadoAtual[0].tipo)
            console.log("⚙️ Usando imagem default:", imagemFinal)
        }

        // 4. Atualizar no banco
        await db.query(
            `UPDATE comunicados 
             SET titulo = ?, descricao = ?, tipo = ?, imagem = ?
             WHERE id = ?`,
            [
                titulo || comunicadoAtual[0].titulo,
                descricao || comunicadoAtual[0].descricao,
                tipo || comunicadoAtual[0].tipo,
                imagemFinal,
                id
            ]
        )

        // 5. Buscar dados atualizados
        const [comunicadoAtualizado] = await db.query(
            `SELECT * FROM comunicados WHERE id = ?`,
            [id]
        )

        // 6. Preparar resposta
        let imagemUrl = null
        if (comunicadoAtualizado[0].imagem) {
            imagemUrl = getImageUrl(comunicadoAtualizado[0].imagem, req)
            console.log("🌐 URL da imagem atualizada:", imagemUrl)
        }

        console.log("✅ Comunicado atualizado com sucesso")

        return res.status(200).json({
            message: "Comunicado atualizado com sucesso",
            comunicado: {
                ...comunicadoAtualizado[0],
                imagem: imagemUrl
            }
        })
    } catch (error) {
        console.error("❌ Erro ao atualizar comunicado:", error)
        return res.status(500).json({
            error: "Erro interno ao atualizar comunicado"
        })
    }
}


export async function AtivarComunicado(req, res) {
    try {
        const { id } = req.params

        const [rows] = await db.query(
            `SELECT status FROM comunicados WHERE id = ?`,
            [id]
        )

        if (rows.length === 0) {
            return res.status(404).json({
                error: "Comunicado não encontrado"
            })
        }

        if (rows[0].status !== 'rascunho') {
            return res.status(400).json({
                error: "Apenas comunicados em rascunho podem ser ativados"
            })
        }

        await db.query(
            `UPDATE comunicados SET status = 'ativo' WHERE id = ?`,
            [id]
        )

        return res.status(200).json({
            message: "Comunicado ativado com sucesso"
        })
    } catch (error) {
        console.error("❌ Erro ao ativar comunicado:", error)
        return res.status(500).json({
            error: "Erro interno ao ativar comunicado"
        })
    }
}

export async function ArquivarComunicado(req, res) {
    try {
        const { id } = req.params

        const [rows] = await db.query(
            `SELECT status FROM comunicados WHERE id = ?`,
            [id]
        )

        if (rows.length === 0) {
            return res.status(404).json({
                error: "Comunicado não encontrado"
            })
        }

        if (rows[0].status !== 'ativo') {
            return res.status(400).json({
                error: "Apenas comunicados ativos podem ser arquivados"
            })
        }

        await db.query(
            `UPDATE comunicados SET status = 'arquivado' WHERE id = ?`,
            [id]
        )

        return res.status(200).json({
            message: "Comunicado arquivado com sucesso"
        })
    } catch (error) {
        console.error("❌ Erro ao arquivar comunicado:", error)
        return res.status(500).json({
            error: "Erro interno ao arquivar comunicado"
        })
    }
}

export async function ReativarComunicado(req, res) {
    try {
        const { id } = req.params

        const [rows] = await db.query(
            `SELECT status FROM comunicados WHERE id = ?`,
            [id]
        )

        if (rows.length === 0) {
            return res.status(404).json({
                error: "Comunicado não encontrado"
            })
        }

        if (rows[0].status !== 'arquivado') {
            return res.status(400).json({
                error: "Apenas comunicados arquivados podem ser reativados"
            })
        }

        await db.query(
            `UPDATE comunicados SET status = 'ativo' WHERE id = ?`,
            [id]
        )

        return res.status(200).json({
            message: "Comunicado reativado com sucesso"
        })
    } catch (error) {
        console.error("❌ Erro ao reativar comunicado:", error)
        return res.status(500).json({
            error: "Erro interno ao reativar comunicado"
        })
    }
}

export async function MostrarQuantidadeComunicados(req, res) {
    try {
        const [rows] = await db.query(`
            SELECT 
                COUNT(*) AS total,
                SUM(status = 'ativo') AS ativos,
                SUM(status = 'rascunho') AS rascunhos,
                SUM(status = 'arquivado') AS arquivados
            FROM comunicados
        `)

        res.status(200).json(rows[0])
    } catch (error) {
        console.error("❌ Erro ao buscar quantidade de comunicados:", error)
        res.status(500).json({
            erro: "Erro ao buscar quantidade de comunicados"
        })
    }
}

export async function DeletarComunicado(req, res) {
    try {
        const { id } = req.params

        const [comunicado] = await db.query(
            `SELECT imagem FROM comunicados WHERE id = ?`,
            [id]
        )

        if (comunicado.length === 0) {
            return res.status(404).json({
                error: "Comunicado não encontrado"
            })
        }

        // Deletar imagem se existir e não for default
        if (comunicado[0].imagem && !comunicado[0].imagem.includes('/img/defaults/')) {
            const imagePath = path.join(__dirname, '..', 'public', comunicado[0].imagem)
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath)
                console.log("🗑️ Imagem deletada:", imagePath)
            }
        }

        await db.query(`DELETE FROM comunicados WHERE id = ?`, [id])

        return res.status(200).json({
            message: "Comunicado deletado com sucesso"
        })
    } catch (error) {
        console.error("❌ Erro ao deletar comunicado:", error)
        return res.status(500).json({
            error: "Erro interno ao deletar comunicado"
        })
    }
}