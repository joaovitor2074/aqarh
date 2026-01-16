//CONMFIGURACOES GERAIS
import dotenv from "dotenv";
dotenv.config();

//IMPORTS NORMAIS
import express from "express";
import cors from "cors";
import path from "path"
import { fileURLToPath } from "url"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


//
import authRoutes from "./routes/auth.routes.js";
import membrosRoutes from "./routes/membros.routes.js";
import linhasPesquisaRoutes from "./routes/linhas_pesquisas.routes.js";

//rotas backend
import adminjvRoutes from "./routes/adminjv.routes.js";

import {testScrapeEstudantes} from "./functions/estudantes.js"
import comunicadosRoutes from "./routes/comunicados.routes.js"

const app = express();




app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }))

app.use(express.json());
app.use("/api/membros", membrosRoutes);
app.use("/api/linhas-pesquisa", linhasPesquisaRoutes);


// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'public/img/defaults')))

// Rotas
app.use("/api", authRoutes);
app.use("/adminjv", adminjvRoutes);

// app.get('/test/estudantes', testScrapeEstudantes);
// Rotas - TODAS com /api
app.use('/api/comunicados', comunicadosRoutes)


app.use("/uploads", express.static(path.resolve("uploads")))

app.listen(process.env.PORT, () => {
  console.log("Servidor rodando na porta " + process.env.PORT);

});
