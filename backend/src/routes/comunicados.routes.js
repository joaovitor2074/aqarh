import { Router } from "express"
import { MostrarComunicados , AtivarComunicado , ArquivarComunicado, ReativarComunicado,EditarComunicado,AtualizarComunicado,MostrarQuantidadeComunicados  } from "../controllers/comunicados.controller.js"

import { upload } from "../middlewares/upload.js"


const router = Router()


// lista comunicados com filtros
// ex:
// /comunicados?status=rascunho
// /comunicados?status=ativo&tipo=linha


router.get("/", MostrarComunicados)
router.post("/:id/ativar", AtivarComunicado);
router.post("/:id/arquivar", ArquivarComunicado);
router.post("/:id/reativar", ReativarComunicado);
router.put("/:id", EditarComunicado);
router.get("/quantcomunicados", MostrarQuantidadeComunicados)

router.put(
  "/comunicados/:id",
  upload.single("imagem"), // 🔥 nome TEM que ser "imagem"
  AtualizarComunicado
)


export default router
