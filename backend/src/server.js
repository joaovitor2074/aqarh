//CONMFIGURACOES GERAIS
import dotenv from "dotenv";
dotenv.config();

//IMPORTS NORMAIS
import express from "express";
import cors from "cors";

//
import authRoutes from "./routes/auth.routes.js";
import membrosRoutes from "./routes/membros.routes.js";
import linhasPesquisaRoutes from "./routes/linhas_pesquisas.routes.js";

//rotas backend
import adminjvRoutes from "./routes/adminjv.routes.js";

import {testScrapeEstudantes} from "./functions/estudantes.js"

const app = express();


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/membros", membrosRoutes);
app.use("/api/linhas-pesquisa", linhasPesquisaRoutes);


// Rotas
app.use("/api", authRoutes);
app.use("/adminjv", adminjvRoutes);

app.get('/test/estudantes', testScrapeEstudantes);

app.listen(process.env.PORT, () => {
  console.log("Servidor rodando na porta " + process.env.PORT);

});
