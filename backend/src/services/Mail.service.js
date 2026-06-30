// src/modules/mail/mail.service.js
// Substituir o mail.service.ts por esta versão JS com Nodemailer real

import nodemailer from "nodemailer";

const EMAIL_BRAND_NAME =
  "Grupo Interdisciplinar em Ensino, Pesquisa e Inova\u00e7\u00e3o - GIEPI";
const EMAIL_BACKGROUND_IMAGE_PATH = "/img/email/imagem-fundo-email.png";
const DEFAULT_SITE_URL = "https://aqarh.vercel.app";

function valorEnv(nome) {
  return (process.env[nome] || "").trim();
}

function obterBaseUrlPublica() {
  return (
    valorEnv("EMAIL_ASSET_BASE_URL") ||
    valorEnv("APP_URL") ||
    valorEnv("SITE_URL") ||
    valorEnv("FRONTEND_URL") ||
    DEFAULT_SITE_URL
  ).replace(/\/+$/, "");
}

function obterUrlImagemFundoEmail() {
  try {
    return new URL(EMAIL_BACKGROUND_IMAGE_PATH, `${obterBaseUrlPublica()}/`)
      .toString();
  } catch {
    return `${DEFAULT_SITE_URL}${EMAIL_BACKGROUND_IMAGE_PATH}`;
  }
}

function escaparHtml(valor = "") {
  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Cria o transporter baseado no ambiente.
 * Em desenvolvimento usa Mailtrap, em produção usa Gmail.
 *
 * VARIÁVEIS DE AMBIENTE NECESSÁRIAS:
 *
 * Para Mailtrap (desenvolvimento/testes):
 *   MAIL_ENV=mailtrap
 *   MAILTRAP_USER=seu_usuario_mailtrap
 *   MAILTRAP_PASS=sua_senha_mailtrap
 *
 * Para Gmail (produção):
 *   MAIL_ENV=gmail
 *   GMAIL_USER=seuemail@gmail.com
 *   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx   ← App Password de 16 dígitos
 *
 * Como gerar Gmail App Password:
 *   1. Acesse myaccount.google.com
 *   2. Segurança → Verificação em duas etapas (ativar se necessário)
 *   3. Segurança → Senhas de app → Selecionar app "Outro" → Gerar
 *   4. Copie os 16 dígitos e cole em GMAIL_APP_PASSWORD
 */
function criarTransporter() {
  const env = process.env.MAIL_ENV || "mailtrap";

  if (env === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  // Padrão: Mailtrap (para testes — emails não chegam de verdade)
  return nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });
}

/**
 * Monta o HTML do email.
 * Template com fundo institucional e conteudo central legivel.
 */
function montarHTML({ assunto, corpo, remetente = EMAIL_BRAND_NAME }) {
  const assuntoSeguro = escaparHtml(assunto);
  const remetenteSeguro = escaparHtml(remetente);
  const corpoSeguro = escaparHtml(corpo);
  const imagemFundoSeguro = escaparHtml(obterUrlImagemFundoEmail());

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${assuntoSeguro}</title>
</head>
<body style="margin:0;padding:0;background:#063d2e;font-family:Arial,Helvetica,sans-serif;color:#24312b;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;line-height:0;">
    ${remetenteSeguro} - ${assuntoSeguro}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" background="${imagemFundoSeguro}" style="width:100%;background-color:#063d2e;background-image:url('${imagemFundoSeguro}');background-repeat:no-repeat;background-position:center top;background-size:cover;padding:42px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid rgba(255,255,255,0.28);box-shadow:0 18px 42px rgba(0,0,0,0.28);">

          <tr>
            <td style="background:#00543f;padding:30px 34px 28px;border-bottom:4px solid #36c66a;">
              <p style="margin:0;color:#bff4d1;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">
                Comunicado institucional
              </p>
              <h1 style="margin:12px 0 0;color:#ffffff;font-size:24px;font-weight:700;line-height:1.32;">
                ${assuntoSeguro}
              </h1>
              <p style="margin:14px 0 0;color:#d8f8e5;font-size:13px;line-height:1.55;">
                ${remetenteSeguro}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:34px 36px 32px;background:#ffffff;">
              <div style="margin:0 0 22px;padding:0 0 0 16px;border-left:4px solid #1b8f5a;">
                <p style="margin:0;color:#0f5132;font-size:13px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;">
                  Mensagem
                </p>
              </div>
              <div style="color:#2f3b46;font-size:15px;line-height:1.78;white-space:pre-line;">
                ${corpoSeguro}
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 36px;background:#eef7f1;border-top:1px solid #d8eadf;">
              <p style="margin:0 0 6px;color:#426855;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
                Enviado por
              </p>
              <p style="margin:0;color:#0b3d2e;font-size:14px;font-weight:700;line-height:1.5;">
                ${remetenteSeguro}
              </p>
              <p style="margin:12px 0 0;color:#63746a;font-size:12px;line-height:1.55;">
                Este email foi enviado automaticamente pelo sistema GIEPI.
              </p>
            </td>
          </tr>

        </table>
        <p style="margin:18px 0 0;color:#c9f3d8;font-size:11px;line-height:1.5;">
          ${remetenteSeguro}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Envia um email para um único destinatário.
 *
 * @param {object} opcoes
 * @param {string} opcoes.para - Email do destinatário
 * @param {string} opcoes.assunto - Assunto do email
 * @param {string} opcoes.corpo - Corpo em texto/html simples
 * @param {string} [opcoes.nomeDestinatario] - Nome para personalizar saudação
 */
export async function enviarEmail({ para, assunto, corpo, nomeDestinatario }) {
  const transporter = criarTransporter();

  const corpoFinal = nomeDestinatario
    ? `Olá, ${nomeDestinatario}!\n\n${corpo}`
    : corpo;

  const info = await transporter.sendMail({
    from:
      process.env.MAIL_FROM ||
      `"${EMAIL_BRAND_NAME}" <no-reply@giepi.ifma.edu.br>`,
    to: para,
    subject: assunto,
    text: corpoFinal,
    html: montarHTML({ assunto, corpo: corpoFinal }),
  });

  console.log(`[MAIL] Enviado para ${para} — ID: ${info.messageId}`);
  return info;
}

/**
 * Envia email em massa para uma lista de destinatários.
 * Envia individualmente para personalizar a saudação.
 *
 * @param {object} opcoes
 * @param {Array<{email: string, nome: string}>} opcoes.destinatarios
 * @param {string} opcoes.assunto
 * @param {string} opcoes.corpo
 * @param {boolean} [opcoes.personalizar] - Se true, adiciona "Olá, [nome]!" no início
 */
export async function enviarEmailEmMassa({ destinatarios, assunto, corpo, personalizar = true }) {
  const resultados = {
    total: destinatarios.length,
    enviados: 0,
    falhas: [],
  };

  for (const dest of destinatarios) {
    try {
      await enviarEmail({
        para: dest.email,
        assunto,
        corpo,
        nomeDestinatario: personalizar ? dest.nome : null,
      });
      resultados.enviados++;
    } catch (err) {
      console.error(`[MAIL] Falha ao enviar para ${dest.email}:`, err.message);
      resultados.falhas.push({ email: dest.email, erro: err.message });
    }
  }

  console.log(
    `[MAIL] Campanha concluída: ${resultados.enviados}/${resultados.total} enviados, ${resultados.falhas.length} falhas`
  );

  return resultados;
}
