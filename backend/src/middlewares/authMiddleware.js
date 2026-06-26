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
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
}
