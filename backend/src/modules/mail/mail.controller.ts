import { Request, Response } from "express";
import { MailService, MailPayload } from "./mail.service.js";

export class MailController {
  private mailService: MailService;

  constructor() {
    this.mailService = new MailService();
  }

  async preview(req: Request, res: Response) {
    try {
      const payload = req.body as MailPayload;

      const result = await this.mailService.preview(payload);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao gerar preview do email",
      });
    }
  }

  async send(req: Request, res: Response) {
    try {
      const payload = req.body as MailPayload;

      const result = await this.mailService.send(payload);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao enviar email",
      });
    }
  }
}
