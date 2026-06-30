<<<<<<< HEAD
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/auth.js";

export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        code: "TOKEN_MISSING",
        message: "Token nao fornecido",
      });
    }

    const [scheme, token, ...extraParts] = authHeader.trim().split(/\s+/);

    if (!/^Bearer$/i.test(scheme) || !token || extraParts.length > 0) {
      return res.status(401).json({
        code: "TOKEN_MALFORMED",
        message: "Token mal formatado",
      });
    }

    const decoded = jwt.verify(token, getJwtSecret());

    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.user = decoded;

    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        code: "TOKEN_EXPIRED",
        message: "Sessao expirada",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        code: "TOKEN_INVALID",
        message: "Token invalido",
      });
    }

    console.error("Erro no middleware de autenticacao:", error.message);
=======
// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import process from "node:process";

export function authMiddleware(req, res, next) {
  const requestId = req.headers["x-railway-request-id"] || "local";

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.warn("[AUTH] Token não fornecido", { requestId });
      return res.status(401).json({ message: "Token não fornecido" });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2) {
      console.warn("[AUTH] Formato do token inválido", { requestId });
      return res.status(401).json({ message: "Formato do token inválido" });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme) || !token) {
      console.warn("[AUTH] Token mal formatado", { requestId });
      return res.status(401).json({ message: "Token mal formatado" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("[AUTH] JWT_SECRET não configurado", { requestId });
      return res.status(500).json({ message: "Erro interno no servidor" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.warn("[AUTH] Token inválido", {
          requestId,
          reason: err.name,
        });
        return res.status(401).json({ message: "Token inválido" });
      }

      console.log("[AUTH] Token válido", {
        requestId,
        userId: decoded.id,
        role: decoded.role,
      });
      req.userId = decoded.id;
      req.userEmail = decoded.email;
      next();
    });
  } catch (error) {
    console.error("[AUTH] Erro no middleware", {
      requestId,
      message: error.message,
    });
>>>>>>> 213fcd10a04cf9029784d9f9e3439dd9cfb674e5
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
}
