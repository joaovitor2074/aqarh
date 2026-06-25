import test from "node:test";
import assert from "node:assert/strict";
import process from "node:process";
import { obterConfiguracaoEmail } from "./mail.service.js";

const MAIL_KEYS = [
  "MAIL_ENV",
  "MAIL_FROM",
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
    }
  );
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
