import { Router } from "express"

const router = Router()

import { MostrarComunicados } from "../controllers/comunicados.controller.js"

router.get('/rascunhos', MostrarComunicados)

export default router