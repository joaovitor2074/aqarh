import { Router } from "express"
import { MostrarComunicados , AtivarComunicado , ArquivarComunicado, ReativarComunicado  } from "../controllers/comunicados.controller.js"


const router = Router()


// lista comunicados com filtros
// ex:
// /comunicados?status=rascunho
// /comunicados?status=ativo&tipo=linha


router.get("/", MostrarComunicados)
router.post("/:id/ativar", AtivarComunicado);
router.post("/:id/arquivar", ArquivarComunicado);
router.post("/:id/reativar", ReativarComunicado);


export default router
