// src/modules/mail/mail.service.ts

export interface MailPayload {
  to: string | string[];
  subject: string;
  template: "comunicado" | "projeto" | "aviso";
  data?: Record<string, unknown>;
}

export class MailService {
  constructor() {
    // futuramente: inicializar transporte SMTP aqui
  }

  async preview(payload: MailPayload) {
    return {
      success: true,
      message: "Preview de e-mail gerado com sucesso",
      payload
    };
  }

  async send(payload: MailPayload) {
    // envio real será implementado depois
    console.log("[MAIL:SEND]", payload);

    return {
      success: true,
      message: "Envio de e-mail simulado",
    };
  }
}
