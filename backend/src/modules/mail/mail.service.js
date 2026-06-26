// src/modules/mail/mail.service.js
// Substituir o mail.service.ts por esta versão JS com Nodemailer real

import nodemailer from "nodemailer";
import process from "node:process";

const TEMPOS_SMTP = {
  connectionTimeout: 15_000,
  greetingTimeout: 15_000,
  socketTimeout: 30_000,
};

function valorEnv(nome) {
  return (process.env[nome] || "").trim();
}

function erroConfiguracao(message) {
  const error = new Error(message);
  error.code = "MAIL_CONFIGURATION_ERROR";
  return error;
}

/**
 * Retorna a configuração efetiva do provedor e valida as credenciais antes
 * de tentar abrir uma conexão SMTP.
 */
export function obterConfiguracaoEmail() {
  const brevoApiKey = valorEnv("BREVO_API_KEY");
  const brevoFrom = valorEnv("BREVO_FROM") || valorEnv("MAIL_FROM");
  const brevoFromName = valorEnv("BREVO_FROM_NAME") || "GIEPI IFMA";
  const resendApiKey = valorEnv("RESEND_API_KEY");
  const resendFrom = valorEnv("RESEND_FROM") || valorEnv("MAIL_FROM");
  const sendgridApiKey = valorEnv("SENDGRID_API_KEY");
  const sendgridFrom = valorEnv("SENDGRID_FROM") || valorEnv("MAIL_FROM");
  const gmailUser = valorEnv("GMAIL_USER");
  const gmailPassword = valorEnv("GMAIL_APP_PASSWORD").replace(/\s/g, "");
  const mailtrapUser = valorEnv("MAILTRAP_USER");
  const mailtrapPassword = valorEnv("MAILTRAP_PASS");
  const providerInformado = valorEnv("MAIL_ENV").toLowerCase();

  const provider =
    providerInformado ||
    (brevoApiKey
      ? "brevo"
      : resendApiKey
        ? "resend"
        : sendgridApiKey
          ? "sendgrid"
          : gmailUser && gmailPassword
            ? "gmail"
            : mailtrapUser && mailtrapPassword
              ? "mailtrap"
              : "");

  if (!provider) {
    throw erroConfiguracao(
      "O serviço de email não está configurado. Defina MAIL_ENV e as credenciais do provedor."
    );
  }

  if (provider === "brevo") {
    if (!brevoApiKey || !brevoFrom) {
      throw erroConfiguracao(
        "A configuração da Brevo está incompleta. Verifique BREVO_API_KEY e BREVO_FROM."
      );
    }

    return {
      provider,
      apiKey: brevoApiKey,
      sender: {
        email: brevoFrom,
        name: brevoFromName,
      },
    };
  }

  if (provider === "resend") {
    if (!resendApiKey || !resendFrom) {
      throw erroConfiguracao(
        "A configuração do Resend está incompleta. Verifique RESEND_API_KEY e RESEND_FROM."
      );
    }

    return {
      provider,
      apiKey: resendApiKey,
      from: resendFrom,
    };
  }

  if (provider === "sendgrid") {
    if (!sendgridApiKey || !sendgridFrom) {
      throw erroConfiguracao(
        "A configuração do SendGrid está incompleta. Verifique SENDGRID_API_KEY e SENDGRID_FROM."
      );
    }

    return {
      provider,
      apiKey: sendgridApiKey,
      from: sendgridFrom,
    };
  }

  if (provider === "gmail") {
    if (!gmailUser || !gmailPassword) {
      throw erroConfiguracao(
        "A configuração do Gmail está incompleta. Verifique GMAIL_USER e GMAIL_APP_PASSWORD."
      );
    }

    return {
      provider,
      from: valorEnv("MAIL_FROM") || `"GIEPI IFMA" <${gmailUser}>`,
      transport: {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: gmailUser,
          pass: gmailPassword,
        },
        ...TEMPOS_SMTP,
      },
    };
  }

  if (provider === "mailtrap") {
    if (!mailtrapUser || !mailtrapPassword) {
      throw erroConfiguracao(
        "A configuração do Mailtrap está incompleta. Verifique MAILTRAP_USER e MAILTRAP_PASS."
      );
    }

    return {
      provider,
      from: valorEnv("MAIL_FROM") || '"GIEPI IFMA" <no-reply@giepi.local>',
      transport: {
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        secure: false,
        auth: {
          user: mailtrapUser,
          pass: mailtrapPassword,
        },
        ...TEMPOS_SMTP,
      },
    };
  }

  throw erroConfiguracao(
    `Provedor de email "${providerInformado}" inválido. Use MAIL_ENV=brevo, sendgrid, resend, gmail ou mailtrap.`
  );
}

export function mensagemErroEmail(error) {
  if (error?.code === "MAIL_CONFIGURATION_ERROR") {
    return error.message;
  }

  if (error?.code === "EAUTH" || error?.responseCode === 535) {
    return "O provedor recusou a autenticação. Verifique o usuário e a senha de aplicativo.";
  }

  if (error?.code === "MAIL_PROVIDER_ERROR") {
    return error.message;
  }

  if (
    ["ECONNECTION", "ECONNREFUSED", "ETIMEDOUT", "ESOCKET"].includes(
      error?.code
    )
  ) {
    return "Não foi possível conectar ao servidor de email. Tente novamente em alguns instantes.";
  }

  return "O provedor de email não conseguiu entregar a mensagem.";
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
  const config = obterConfiguracaoEmail();
  return {
    config,
    transporter: nodemailer.createTransport(config.transport),
  };
}

async function enviarComResend({ config, para, assunto, corpoFinal, html }) {
  let response;

  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.from,
        to: [para],
        subject: assunto,
        text: corpoFinal,
        html,
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (error) {
    error.code ||= "ECONNECTION";
    throw error;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.message || `O Resend recusou o envio (HTTP ${response.status}).`
    );
    error.code = "MAIL_PROVIDER_ERROR";
    error.responseCode = response.status;
    throw error;
  }

  return {
    messageId: data.id,
    response: data,
  };
}

async function enviarComBrevo({ config, para, assunto, html }) {
  let response;

  try {
    response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": config.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: config.sender,
        to: [{ email: para }],
        subject: assunto,
        htmlContent: html,
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (error) {
    error.code ||= "ECONNECTION";
    throw error;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.message || `A Brevo recusou o envio (HTTP ${response.status}).`
    );
    error.code = "MAIL_PROVIDER_ERROR";
    error.responseCode = response.status;
    throw error;
  }

  return {
    messageId: data.messageId,
    response: data,
  };
}

function separarEndereco(remetente) {
  const match = remetente.match(/^\s*(.*?)\s*<([^<>]+)>\s*$/);

  if (!match) {
    return { email: remetente };
  }

  return {
    email: match[2].trim(),
    ...(match[1].trim() && { name: match[1].trim().replace(/^"|"$/g, "") }),
  };
}

async function enviarComSendGrid({ config, para, assunto, corpoFinal, html }) {
  let response;

  try {
    response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: para }] }],
        from: separarEndereco(config.from),
        subject: assunto,
        content: [
          { type: "text/plain", value: corpoFinal },
          { type: "text/html", value: html },
        ],
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (error) {
    error.code ||= "ECONNECTION";
    throw error;
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error = new Error(
      data.errors?.[0]?.message ||
        `O SendGrid recusou o envio (HTTP ${response.status}).`
    );
    error.code = "MAIL_PROVIDER_ERROR";
    error.responseCode = response.status;
    throw error;
  }

  return {
    messageId: response.headers.get("x-message-id"),
  };
}

/**
 * Monta o HTML do email.
 * Template simples e limpo, compatível com a identidade do GIEPI/IFMA.
 */
function montarHTML({ assunto, corpo, remetente = "GIEPI – IFMA Campus Codó" }) {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${assunto}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Cabeçalho verde IFMA -->
          <tr>
            <td style="background:#006A4E;padding:24px 32px;">
              <p style="margin:0;color:#ffffff;font-size:13px;letter-spacing:1px;text-transform:uppercase;opacity:0.8;">
                ${remetente}
              </p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:700;line-height:1.3;">
                ${assunto}
              </h1>
            </td>
          </tr>

          <!-- Corpo do email -->
          <tr>
            <td style="padding:32px;">
              <div style="color:#374151;font-size:15px;line-height:1.7;white-space:pre-line;">
                ${corpo}
              </div>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.5;">
                Este email foi enviado automaticamente pelo sistema GIEPI.<br/>
                IFMA – Instituto Federal do Maranhão, Campus Codó.
              </p>
            </td>
          </tr>

        </table>
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
  const config = obterConfiguracaoEmail();

  const corpoFinal = nomeDestinatario
    ? `Olá, ${nomeDestinatario}!\n\n${corpo}`
    : corpo;
  const html = montarHTML({ assunto, corpo: corpoFinal });

  const info =
    config.provider === "brevo"
      ? await enviarComBrevo({
          config,
          para,
          assunto,
          html,
        })
      : config.provider === "resend"
      ? await enviarComResend({
          config,
          para,
          assunto,
          corpoFinal,
          html,
        })
      : config.provider === "sendgrid"
        ? await enviarComSendGrid({
            config,
            para,
            assunto,
            corpoFinal,
            html,
          })
      : await criarTransporter().transporter.sendMail({
          from: config.from,
          to: para,
          subject: assunto,
          text: corpoFinal,
          html,
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
      resultados.falhas.push({
        email: dest.email,
        erro: mensagemErroEmail(err),
      });
    }
  }

  console.log(
    `[MAIL] Campanha concluída: ${resultados.enviados}/${resultados.total} enviados, ${resultados.falhas.length} falhas`
  );

  return resultados;
}
