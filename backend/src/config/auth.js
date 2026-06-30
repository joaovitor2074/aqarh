const DEVELOPMENT_JWT_SECRET = "aqarh-development-only-secret";

export function getJwtSecret() {
  const secret = globalThis.process.env.JWT_SECRET?.trim();

  if (secret) return secret;

  if (globalThis.process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET nao configurado no ambiente de producao");
  }

  return DEVELOPMENT_JWT_SECRET;
}
