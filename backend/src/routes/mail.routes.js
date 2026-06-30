// src/routes/mail.routes.js
// Substitui o mail.routes.ts (TypeScript) por versão JS pura

import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  enviarEmMassa,
  enviarIndividual,
  listarDestinatarios,
  statusEmail,
} from "../controllers/mail.controller.js";

const router = Router();

// Preview de destinatários (sem enviar)
router.get("/destinatarios", authMiddleware, listarDestinatarios);
router.get("/status", authMiddleware, statusEmail);

// Envio em massa
router.post("/enviar-em-massa", authMiddleware, enviarEmMassa);

// Envio individual
router.post("/enviar-individual", authMiddleware, enviarIndividual);

export default router;
