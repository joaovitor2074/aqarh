import { MailService } from "./modules/mail/mail.service.js";

const mailService = new MailService();

await mailService.preview({
  to: "teste@email.com",
  subject: "Teste TS + ESM",
  template: "comunicado",
  data: { nome: "JV" }
});
