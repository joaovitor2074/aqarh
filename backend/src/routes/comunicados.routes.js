import { Router } from "express"
import { 
  MostrarComunicados, 
  CriarComunicado,
  AtualizarComunicado,
  AtivarComunicado, 
  ArquivarComunicado, 
  ReativarComunicado,
  MostrarQuantidadeComunicados,
  DeletarComunicado
} from "../controllers/comunicados.controller.js"
import { upload } from "../middlewares/upload.js"

const router = Router()

// GET /comunicados - Listar comunicados (com filtros)
router.get("/", MostrarComunicados)

// POST /comunicados - Criar novo comunicado
router.post("/", upload.single("imagem"), CriarComunicado)

// PUT /comunicados/:id - Atualizar comunicado
router.put("/:id", upload.single("imagem"), AtualizarComunicado)

// POST /comunicados/:id/ativar - Ativar comunicado
router.post("/:id/ativar", AtivarComunicado)

// POST /comunicados/:id/arquivar - Arquivar comunicado
router.post("/:id/arquivar", ArquivarComunicado)

// POST /comunicados/:id/reativar - Reativar comunicado
router.post("/:id/reativar", ReativarComunicado)

// GET /comunicados/quantidade - Estatísticas
router.get("/quantidade", MostrarQuantidadeComunicados)

// DELETE /comunicados/:id - Deletar comunicado
router.delete("/:id", DeletarComunicado)

export default router