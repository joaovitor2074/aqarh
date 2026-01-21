import { Router } from "express";
import { MailController } from "../modules/mail/mail.controller.js";

const router = Router();
const mailController = new MailController();

// Preview de email (sem enviar)
router.post("/preview", (req:any, res:any) => {
  mailController.preview(req, res);
});

// Envio simulado
router.post("/send", (req:any, res:any) => {
  mailController.send(req, res);
});

export default router;
