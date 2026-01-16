import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Garante que a pasta uploads existe
const uploadDir = path.join(process.cwd(), "public/uploads")

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const nome = `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`
    cb(null, nome)
  }
})

// Filtro de arquivos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    cb(null, true)
  } else {
    cb(new Error("Apenas imagens são permitidas"))
  }
}

// Limites
const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB
  files: 1
}

export const upload = multer({
  storage,
  fileFilter,
  limits
})

// Helper para deletar arquivos antigos
export const deleteFile = (filePath) => {
  if (filePath && !filePath.includes('/defaults/')) {
    const fullPath = path.join(uploadDir, path.basename(filePath))
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath)
    }
  }
}