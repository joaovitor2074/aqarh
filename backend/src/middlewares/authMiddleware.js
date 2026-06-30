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
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
}
