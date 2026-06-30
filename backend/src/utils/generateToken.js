import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/auth.js";

export function generateToken(id, role) {
  return jwt.sign(
    { id, role },
    getJwtSecret(),
    { expiresIn: "1d" }
  );
}
