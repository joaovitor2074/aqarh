import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import membrosRoutes from "./routes/membros.routes.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/membros", membrosRoutes);

// Rotas
app.use("/api", authRoutes);

app.listen(process.env.PORT, () => {
  console.log("Servidor rodando na porta " + process.env.PORT);

});
