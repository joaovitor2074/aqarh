//CONMFIGURACOES GERAIS
import dotenv from "dotenv";
dotenv.config();

//IMPORTS NORMAIS
import express from "express";
import cors from "cors";
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Importações das rotas
import authRoutes from "./routes/auth.routes.js";
import membrosRoutes from "./routes/membros.routes.js";
import linhasPesquisaRoutes from "./routes/linhas_pesquisas.routes.js";
import adminjvRoutes from "./routes/adminjv.routes.js";
import comunicadosRoutes from "./routes/comunicados.routes.js"

const app = express();

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

// ========== VERIFICAÇÃO DE PASTAS ==========
const publicPath = path.join(__dirname, '..', 'public');

// Verifica se a pasta public existe
if (!fs.existsSync(publicPath)) {
  console.log('📁 Criando pasta public...');
  fs.mkdirSync(publicPath, { recursive: true });
}

// Cria subpastas necessárias
const subfolders = [
  'img/defaults',
  'uploads'
];

subfolders.forEach(folder => {
  const folderPath = path.join(publicPath, ...folder.split('/'));
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`📁 Criada pasta: ${folderPath}`);
  }
});

// ========== ROTAS ESTÁTICAS - APENAS UMA CONFIGURAÇÃO ==========
// Serve TODOS os arquivos estáticos da pasta public
console.log('📁 Servindo arquivos estáticos de:', publicPath);
app.use(express.static(publicPath));

// ========== ROTAS DA API ==========
app.use("/api", authRoutes);
app.use("/api/membros", membrosRoutes);
app.use("/api/linhas-pesquisa", linhasPesquisaRoutes);
app.use('/api/comunicados', comunicadosRoutes);
app.use("/adminjv", adminjvRoutes);

// ========== ROTAS DE DEBUG ==========
app.get('/debug-public', (req, res) => {
  try {
    const files = {
      defaults: fs.readdirSync(path.join(publicPath, 'img', 'defaults')),
      uploads: fs.readdirSync(path.join(publicPath, 'uploads'))
    };
    
    res.json({
      publicPath: publicPath,
      files: files,
      accessibleUrls: {
        defaults: files.defaults.map(f => `http://localhost:${process.env.PORT}/img/defaults/${f}`),
        uploads: files.uploads.map(f => `http://localhost:${process.env.PORT}/uploads/${f}`)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log("🚀 Servidor rodando na porta " + process.env.PORT);
  console.log("📁 Pasta public:", publicPath);
  console.log("\n🌐 URLs para teste:");
  console.log(`   Debug: http://localhost:${process.env.PORT}/debug-public`);
});