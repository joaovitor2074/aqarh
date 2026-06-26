/**
 * =====================================================
 * CONFIGURAÇÕES INICIAIS (ENV)
 * =====================================================
 * Carrega variáveis de ambiente do arquivo .env
 */
import dotenv from "dotenv";
dotenv.config();

/**
 * =====================================================
 * IMPORTAÇÕES PRINCIPAIS
 * =====================================================
 */
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import process from "node:process";
import { fileURLToPath } from "url";

/**
 * =====================================================
 * AJUSTE DE __dirname PARA ES MODULES
 * =====================================================
 * Necessário porque estamos usando "type": "module"
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * =====================================================
 * IMPORTAÇÃO DAS ROTAS DA APLICAÇÃO
 * =====================================================
 */
import authRoutes from "./routes/auth.routes.js";
import membrosRoutes from "./routes/membros.routes.js";
import linhasPesquisaRoutes from "./routes/linhas_pesquisas.routes.js";
import comunicadosRoutes from "./routes/comunicados.routes.js";
import projetosRoutes from "./routes/projetos.routes.js";
import adminjvRoutes from "./routes/adminjv.routes.js";

// Rotas de e-mail compiladas pelo TypeScript (dist)

import mailRoutes from "./routes/mail.routes.js";
import { obterDiagnosticoEmail } from "./modules/mail/mail.service.js";
/**
 * =====================================================
 * INICIALIZAÇÃO DO EXPRESS
 * =====================================================
 */
const app = express();
const normalizeOrigin = (origin) => origin.trim().replace(/\/$/, "");
const allowedOrigins = (
  process.env.CORS_ORIGIN || "http://localhost:5173,https://aqarh.vercel.app"
)
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) {
      return callback(null, true);
    }

    return callback(new Error("Origem nao permitida pelo CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

/**
 * =====================================================
 * MIDDLEWARES GLOBAIS
 * =====================================================
 */
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * =====================================================
 * CONFIGURAÇÃO E VERIFICAÇÃO DA PASTA /public
 * =====================================================
 * Responsável por uploads e imagens públicas
 */
const publicPath = path.join(__dirname, "..", "public");

// Cria a pasta public se não existir
if (!fs.existsSync(publicPath)) {
  fs.mkdirSync(publicPath, { recursive: true });
  console.log("📁 Pasta public criada");
}

// Subpastas necessárias
const subfolders = ["img/defaults", "uploads"];

subfolders.forEach((folder) => {
  const folderPath = path.join(publicPath, ...folder.split("/"));
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`📁 Criada pasta: ${folderPath}`);
  }
});

/**
 * =====================================================
 * ARQUIVOS ESTÁTICOS
 * =====================================================
 * Permite acessar arquivos via URL
 * Ex: /uploads/imagem.png
 */
app.use(express.static(publicPath));

/**
 * =====================================================
 * ROTAS DA API
 * =====================================================
 */
app.use("/api", authRoutes);
app.use("/api/membros", membrosRoutes);
app.use("/api/linhas-pesquisa", linhasPesquisaRoutes);
app.use("/api/comunicados", comunicadosRoutes);
app.use("/api/projetos", projetosRoutes);
app.use("/api/mail", mailRoutes);
app.use("/adminjv", adminjvRoutes);

/**
 * =====================================================
 * ROTA DE DEBUG (APENAS DESENVOLVIMENTO)
 * =====================================================
 * Verifica arquivos disponíveis na pasta public
 */
app.get("/debug-public", (req, res) => {
  try {
    const files = {
      defaults: fs.readdirSync(path.join(publicPath, "img", "defaults")),
      uploads: fs.readdirSync(path.join(publicPath, "uploads")),
    };

    res.json({
      publicPath,
      files,
      accessibleUrls: {
        defaults: files.defaults.map(
          (f) => `http://localhost:${PORT}/img/defaults/${f}`
        ),
        uploads: files.uploads.map(
          (f) => `http://localhost:${PORT}/uploads/${f}`
        ),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * =====================================================
 * INICIALIZAÇÃO DO SERVIDOR
 * =====================================================
 */
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log("📁 Pasta public:", publicPath);
  console.log("[MAIL] Configuração carregada:", obterDiagnosticoEmail());
  console.log(
    `🌐 Debug: http://localhost:${PORT}/debug-public`
  );
});

/**
 * =====================================================
 * TESTE DE CONEXÃO COM O BANCO DE DADOS
 * =====================================================
 * Executado apenas na inicialização do servidor
 */
import { db } from "./config/db.js";

(async () => {
  try {
    await db.query("SELECT 1");
    console.log("✅ Conectado ao MySQL com sucesso");
  } catch (err) {
    console.error("❌ Erro ao conectar no MySQL:", err.message);
  }
})();
