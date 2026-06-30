const TOKEN_KEY = "token";
const USER_KEY = "user";

function getStorage() {
  return typeof window !== "undefined" ? window.localStorage : null;
}

export function getStoredToken() {
  const token = getStorage()?.getItem(TOKEN_KEY);
  return token?.trim() || null;
}

export function saveSession(token, user) {
  const normalizedToken = String(token || "").trim();

  if (!normalizedToken) {
    throw new Error("O servidor nao retornou um token de acesso.");
  }

  const storage = getStorage();
  storage?.setItem(TOKEN_KEY, normalizedToken);
  storage?.setItem(USER_KEY, JSON.stringify(user || null));
}

export function clearSession() {
  const storage = getStorage();
  storage?.removeItem(TOKEN_KEY);
  storage?.removeItem(USER_KEY);
}

export function decodeTokenPayload(token) {
  try {
    const payload = String(token || "").split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "="
    );

    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function isTokenUsable(token = getStoredToken(), now = Date.now()) {
  if (!token) return false;

  const payload = decodeTokenPayload(token);
  if (!payload || typeof payload.exp !== "number") return false;

  return payload.exp * 1000 > now;
}
