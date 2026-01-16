import { db } from "../config/db.js"
import path from "path"
import { fileURLToPath } from 'url'
import fs from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Helper para caminhos de imagem
const getImagePath = (filename) => {
  return filename ? `/uploads/${filename}` : null
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

    // Adiciona URL completa para imagens
    const comunicadosComImagem = rows.map(com => ({
      ...com,
      imagem: com.imagem ? `${req.protocol}://${req.get('host')}${com.imagem}` : null
    }))

    return res.status(200).json({
      total: rows.length,
      comunicados: comunicadosComImagem
    })
  } catch (error) {
    console.error("Erro ao listar comunicados:", error)
    return res.status(500).json({
      error: "Erro interno ao listar comunicados"
    })
  }
}

export async function CriarComunicado(req, res) {
  try {
    const { titulo, descricao, tipo } = req.body
    const imagem = req.file ? getImagePath(req.file.filename) : null

    const [result] = await db.query(
      `INSERT INTO comunicados (titulo, descricao, tipo, imagem, status) 
       VALUES (?, ?, ?, ?, 'rascunho')`,
      [titulo, descricao, tipo, imagem]
    )

    const [novoComunicado] = await db.query(
      `SELECT * FROM comunicados WHERE id = ?`,
      [result.insertId]
    )

    return res.status(201).json({
      message: "Comunicado criado com sucesso",
      comunicado: {
        ...novoComunicado[0],
        imagem: novoComunicado[0].imagem ? `${req.protocol}://${req.get('host')}${novoComunicado[0].imagem}` : null
      }
    })
  } catch (error) {
    console.error("Erro ao criar comunicado:", error)
    return res.status(500).json({
      error: "Erro interno ao criar comunicado"
    })
  }
}

export async function AtualizarComunicado(req, res) {
  try {
    const { id } = req.params
    const { titulo, descricao, tipo } = req.body
    const novaImagem = req.file

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

    // 3. Deletar imagem antiga se houver nova
    let imagemFinal = comunicadoAtual[0].imagem
    if (novaImagem && comunicadoAtual[0].imagem) {
      const oldImagePath = path.join(__dirname, '..', 'public', comunicadoAtual[0].imagem)
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath)
      }
      imagemFinal = getImagePath(novaImagem.filename)
    }

    // 4. Atualizar no banco
    await db.query(
      `UPDATE comunicados 
       SET titulo = ?, descricao = ?, tipo = ?, imagem = ?
       WHERE id = ?`,
      [titulo || comunicadoAtual[0].titulo,
       descricao || comunicadoAtual[0].descricao,
       tipo || comunicadoAtual[0].tipo,
       imagemFinal,
       id]
    )

    // 5. Buscar dados atualizados
    const [comunicadoAtualizado] = await db.query(
      `SELECT * FROM comunicados WHERE id = ?`,
      [id]
    )

    return res.status(200).json({
      message: "Comunicado atualizado com sucesso",
      comunicado: {
        ...comunicadoAtualizado[0],
        imagem: comunicadoAtualizado[0].imagem ? `${req.protocol}://${req.get('host')}${comunicadoAtualizado[0].imagem}` : null
      }
    })
  } catch (error) {
    console.error("Erro ao atualizar comunicado:", error)
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
    console.error("Erro ao ativar comunicado:", error)
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
    console.error("Erro ao arquivar comunicado:", error)
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
    console.error("Erro ao reativar comunicado:", error)
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
    console.error(error)
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

    // Deletar imagem se existir
    if (comunicado[0].imagem) {
      const imagePath = path.join(__dirname, '..', 'public', comunicado[0].imagem)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    await db.query(`DELETE FROM comunicados WHERE id = ?`, [id])

    return res.status(200).json({
      message: "Comunicado deletado com sucesso"
    })
  } catch (error) {
    console.error("Erro ao deletar comunicado:", error)
    return res.status(500).json({
      error: "Erro interno ao deletar comunicado"
    })
  }
}