/**
 * =====================================================
 * IMPORTAÇÕES PRINCIPAIS
 * =====================================================
 */
import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

/**
 * =====================================================
 * COMPONENTES DE LAYOUT
 * =====================================================
 */
import Header from "./components/Header";
import Footer from "./components/Footer";

/**
 * =====================================================
 * PÁGINAS PÚBLICAS
 * =====================================================
 */
import Home from "./pages/Home";
import Projetos from "./pages/Projetos";
import Pesquisas from "./pages/Pesquisas";
import Publicacoes from "./pages/Publicacoes";
import Equipe from "./pages/Equipe";

/**
 * =====================================================
 * AUTENTICAÇÃO
 * =====================================================
 */
import Login from "./pages/admin/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { setupInterceptor } from "./utils/authInterceptor";

/**
 * =====================================================
 * CONTEXTOS GLOBAIS
 * =====================================================
 */
import { ConfigProvider } from "./contexts/ConfigContext";

/**
 * =====================================================
 * PÁGINAS ADMINISTRATIVAS
 * =====================================================
 */
import Dashboard from "./pages/admin/Dashboard";
import Membros from "./pages/admin/Membros";
import Admprojetos from "./pages/admin/Admprojetos";
import Linhaspesquisas from "./pages/admin/LinhasPesquisa";
import Comunicados from "./pages/admin/Comunicados";
import Notificacoes from "./pages/admin/Notificacoes";
import Config from "./pages/admin/Config";

/**
 * =====================================================
 * NOTIFICAÇÕES (TOAST)
 * =====================================================
 */
import { Toaster } from "react-hot-toast";

/**
 * =====================================================
 * COMPONENTE PRINCIPAL DA APLICAÇÃO
 * =====================================================
 */
function AppContent() {
  const location = useLocation();

  /**
   * =====================================================
   * CONFIGURAÇÃO GLOBAL DE AUTENTICAÇÃO
   * =====================================================
   * - Registra interceptors do Axios
   * - Verifica se existe token salvo
   */
  useEffect(() => {
    setupInterceptor();

    const token = localStorage.getItem("token");
    if (!token && location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }, [location.pathname]);

  /**
   * =====================================================
   * CONTROLE DE LAYOUT (HEADER / FOOTER)
   * =====================================================
   * Oculta Header e Footer nas rotas administrativas
   */
  const hideLayout =
    location.pathname === "/login" ||
    location.pathname.startsWith("/admin");

  return (
    <ConfigProvider>
      <div className="app-root">
        {/* Header global */}
        {!hideLayout && <Header />}

        {/* Toasts globais */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { fontSize: "14px" },
          }}
        />

        {/* Conteúdo principal */}
        <main>
          <Routes>
            {/* ================= LOGIN ================= */}
            <Route path="/login" element={<Login />} />

            {/* ================= ROTAS ADMIN (PROTEGIDAS) ================= */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/membros"
              element={
                <ProtectedRoute>
                  <Membros />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/projetos"
              element={
                <ProtectedRoute>
                  <Admprojetos />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/linhaspesquisas"
              element={
                <ProtectedRoute>
                  <Linhaspesquisas />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/comunicados"
              element={
                <ProtectedRoute>
                  <Comunicados />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/notificacoes"
              element={
                <ProtectedRoute>
                  <Notificacoes />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/config"
              element={
                <ProtectedRoute>
                  <Config />
                </ProtectedRoute>
              }
            />

            {/* ================= ROTAS PÚBLICAS ================= */}
            <Route path="/" element={<Home />} />
            <Route path="/projetos" element={<Projetos />} />
            <Route path="/pesquisas" element={<Pesquisas />} />
            <Route path="/publicacoes" element={<Publicacoes />} />
            <Route path="/equipe" element={<Equipe />} />
          </Routes>
        </main>

        {/* Footer global */}
        {!hideLayout && <Footer />}
      </div>
    </ConfigProvider>
  );
}

/**
 * =====================================================
 * EXPORTAÇÃO PADRÃO
 * =====================================================
 */
export default function App() {
  return <AppContent />;
}
