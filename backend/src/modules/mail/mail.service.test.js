import test from "node:test";
import assert from "node:assert/strict";
import process from "node:process";
import {
  enviarEmail,
  mensagemErroEmail,
  obterConfiguracaoEmail,
  obterDiagnosticoEmail,
} from "./mail.service.js";

const EMAIL_BRAND_NAME =
  "Grupo Interdisciplinar em Ensino, Pesquisa e Inova\u00e7\u00e3o - GIEPI";

const MAIL_KEYS = [
  "MAIL_ENV",
  "MAIL_FROM",
  "EMAIL_ASSET_BASE_URL",
  "APP_URL",
  "SITE_URL",
  "FRONTEND_URL",
  "BREVO_API_KEY",
  "BREVO_FROM",
  "BREVO_FROM_NAME",
  "RESEND_API_KEY",
  "RESEND_FROM",
  "SENDGRID_API_KEY",
  "SENDGRID_FROM",
  "GMAIL_USER",
  "GMAIL_APP_PASSWORD",
  "MAILTRAP_USER",
  "MAILTRAP_PASS",
];

function comAmbiente(values, callback) {
  const original = Object.fromEntries(
    MAIL_KEYS.map((key) => [key, process.env[key]])
  );

  for (const key of MAIL_KEYS) {
    delete process.env[key];
  }

  Object.assign(process.env, values);

  try {
    callback();
  } finally {
    for (const key of MAIL_KEYS) {
      if (original[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = original[key];
      }
    }
  }
}

async function comAmbienteAsync(values, callback) {
  const original = Object.fromEntries(
    MAIL_KEYS.map((key) => [key, process.env[key]])
  );

  for (const key of MAIL_KEYS) {
    delete process.env[key];
  }

  Object.assign(process.env, values);

  try {
    await callback();
  } finally {
    for (const key of MAIL_KEYS) {
      if (original[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = original[key];
      }
    }
  }
}

test("configura Gmail e usa a conta autenticada como remetente", () => {
  comAmbiente(
    {
      MAIL_ENV: " GMAIL ",
      GMAIL_USER: "conta@example.com",
      GMAIL_APP_PASSWORD: "abcd efgh ijkl mnop",
    },
    () => {
      const config = obterConfiguracaoEmail();

      assert.equal(config.provider, "gmail");
      assert.equal(config.transport.auth.pass, "abcdefghijklmnop");
      assert.match(config.from, /conta@example\.com/);
      assert.match(config.from, /Grupo Interdisciplinar/);
    }
  );
});

test("configura Brevo para envio HTTPS no Railway", () => {
  comAmbiente(
    {
      MAIL_ENV: " BREVO ",
      BREVO_API_KEY: "xkeysib-123",
      BREVO_FROM: "conta@example.com",
      BREVO_FROM_NAME: EMAIL_BRAND_NAME,
    },
    () => {
      const config = obterConfiguracaoEmail();

      assert.equal(config.provider, "brevo");
      assert.equal(config.apiKey, "xkeysib-123");
      assert.deepEqual(config.sender, {
        email: "conta@example.com",
        name: EMAIL_BRAND_NAME,
      });
      assert.equal(config.transport, undefined);
    }
  );
});

test("prioriza Brevo quando MAIL_ENV não foi definida", () => {
  comAmbiente(
    {
      BREVO_API_KEY: "xkeysib-123",
      BREVO_FROM: "conta@example.com",
      GMAIL_USER: "conta@example.com",
      GMAIL_APP_PASSWORD: "abcdefghijklmnop",
    },
    () => {
      assert.equal(obterConfiguracaoEmail().provider, "brevo");
    }
  );
});

test("diagnóstico não expõe a chave da Brevo", () => {
  comAmbiente(
    {
      MAIL_ENV: "brevo",
      BREVO_API_KEY: "xkeysib-segredo",
      BREVO_FROM: "conta@example.com",
    },
    () => {
      const diagnostico = obterDiagnosticoEmail();
      const serializado = JSON.stringify(diagnostico);

      assert.equal(diagnostico.configurado, true);
      assert.equal(diagnostico.provider, "brevo");
      assert.equal(diagnostico.remetente, "co***@example.com");
      assert.doesNotMatch(serializado, /xkeysib-segredo/);
    }
  );
});

test("envia pela API HTTPS da Brevo com o payload esperado", async () => {
  const fetchOriginal = globalThis.fetch;
  let requisicao;

  try {
    await comAmbienteAsync(
      {
        MAIL_ENV: "brevo",
        BREVO_API_KEY: "xkeysib-chave-de-teste",
        BREVO_FROM: "conta@example.com",
        EMAIL_ASSET_BASE_URL: "https://site.example.com",
      },
      async () => {
        globalThis.fetch = async (url, options) => {
          requisicao = {
            url,
            options,
            body: JSON.parse(options.body),
          };

          return new Response(
            JSON.stringify({ messageId: "<mensagem@brevo>" }),
            {
              status: 201,
              headers: { "Content-Type": "application/json" },
            }
          );
        };

        const info = await enviarEmail({
          para: "destino@example.com",
          assunto: "Teste",
          corpo: "Mensagem de teste",
          requestId: "teste-request-id",
        });

        assert.equal(info.messageId, "<mensagem@brevo>");
      }
    );
  } finally {
    globalThis.fetch = fetchOriginal;
  }

  assert.equal(requisicao.url, "https://api.brevo.com/v3/smtp/email");
  assert.equal(requisicao.options.method, "POST");
  assert.equal(
    requisicao.options.headers["api-key"],
    "xkeysib-chave-de-teste"
  );
  assert.deepEqual(requisicao.body.sender, {
    email: "conta@example.com",
    name: EMAIL_BRAND_NAME,
  });
  assert.deepEqual(requisicao.body.to, [{ email: "destino@example.com" }]);
  assert.equal(requisicao.body.subject, "Teste");
  assert.match(requisicao.body.htmlContent, /Mensagem de teste/);
  assert.match(
    requisicao.body.htmlContent,
    /https:\/\/site\.example\.com\/img\/email\/imagem-fundo-email\.png/
  );
  assert.match(requisicao.body.htmlContent, /Grupo Interdisciplinar/);
  assert.doesNotMatch(requisicao.body.htmlContent, /Campus Cod/);
});

test("traduz bloqueio de IP da Brevo para mensagem acionavel", () => {
  const error = new Error(
    "We have detected you are using an unrecognised IP address 54.151.71.81. If you performed this action make sure to add the new IP address in this link: https://app.brevo.com/security/authorised_ips"
  );
  error.code = "MAIL_PROVIDER_ERROR";
  error.responseCode = 401;

  const message = mensagemErroEmail(error);

  assert.match(message, /Brevo bloqueou/);
  assert.match(message, /Railway/);
  assert.match(message, /authorised_ips/);
});

test("configura Resend para envio HTTPS no Railway", () => {
  comAmbiente(
    {
      MAIL_ENV: "resend",
      RESEND_API_KEY: "re_123",
      RESEND_FROM: "GIEPI <contato@example.com>",
    },
    () => {
      const config = obterConfiguracaoEmail();

      assert.equal(config.provider, "resend");
      assert.equal(config.apiKey, "re_123");
      assert.equal(config.from, "GIEPI <contato@example.com>");
      assert.equal(config.transport, undefined);
    }
  );
});

test("prioriza Resend quando MAIL_ENV não foi definida", () => {
  comAmbiente(
    {
      RESEND_API_KEY: "re_123",
      RESEND_FROM: "GIEPI <contato@example.com>",
      GMAIL_USER: "conta@example.com",
      GMAIL_APP_PASSWORD: "abcdefghijklmnop",
    },
    () => {
      assert.equal(obterConfiguracaoEmail().provider, "resend");
    }
  );
});

test("configura SendGrid para envio HTTPS com remetente verificado", () => {
  comAmbiente(
    {
      MAIL_ENV: "sendgrid",
      SENDGRID_API_KEY: "SG.123",
      SENDGRID_FROM: "GIEPI <conta@gmail.com>",
    },
    () => {
      const config = obterConfiguracaoEmail();

      assert.equal(config.provider, "sendgrid");
      assert.equal(config.apiKey, "SG.123");
      assert.equal(config.from, "GIEPI <conta@gmail.com>");
      assert.equal(config.transport, undefined);
    }
  );
});

test("detecta Gmail pelas credenciais quando MAIL_ENV não foi definida", () => {
  comAmbiente(
    {
      GMAIL_USER: "conta@example.com",
      GMAIL_APP_PASSWORD: "abcdefghijklmnop",
    },
    () => {
      assert.equal(obterConfiguracaoEmail().provider, "gmail");
    }
  );
});

test("rejeita provedor inválido em vez de usar Mailtrap silenciosamente", () => {
  comAmbiente(
    {
      MAIL_ENV: "gmai",
      GMAIL_USER: "conta@example.com",
      GMAIL_APP_PASSWORD: "abcdefghijklmnop",
    },
    () => {
      assert.throws(
        () => obterConfiguracaoEmail(),
        /Provedor de email "gmai" inválido/
      );
    }
  );
});
