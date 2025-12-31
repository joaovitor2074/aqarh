import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Projetos from './pages/Projetos'
import Pesquisas from './pages/Pesquisas'
import Publicacoes from './pages/Publicacoes'
import Equipe from './pages/Equipe'
import Login from './pages/admin/Login'

//admin
import Dashboard from './pages/admin/Dashboard'
import Membros from './pages/admin/Membros'
import Admprojetos from './pages/admin/Admprojetos'
import Linhaspesquisas from './pages/admin/LinhasPesquisa'
import Comunicados from './pages/admin/Comunicados'

//extras
import Config from './pages/admin/Config'



import ProtectedRoute from './components/ProtectedRoute'

function AppContent() {
  const location = useLocation()

  // Esconde header e footer na página de login
  const hideLayout = location.pathname === "/login" || location.pathname === "/admin/adelton" || location.pathname === "/admin/pesquisador" || location.pathname === "/admin/membros" || location.pathname === "/admin/projetos" || location.pathname === "/admin/linhaspesquisas" || location.pathname === "/admin/comunicados" || location.pathname === "/admin/config" || location.pathname === "/admin/dashboard"

  return (
    <div className="app-root">
      {!hideLayout && <Header />}

      <main>
        <Routes>

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas */}
          <Route
            path="/admin/adelton"
            element={
              <ProtectedRoute>
                <Dashboard/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard/>
              </ProtectedRoute>
            }/>

          

          <Route
            path="/admin/pesquisador"
            element={
              <ProtectedRoute>
                <div>Pesquisador Dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/membros"
            element={
              <ProtectedRoute>
                <Membros/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/projetos"
            element={
              <ProtectedRoute>
                <Admprojetos/>
              </ProtectedRoute>
            }
          />

          <Route 
            path="/admin/linhaspesquisas"
            element={
              <ProtectedRoute>
                <Linhaspesquisas/>
              </ProtectedRoute>
            }
          />

          <Route 
            path="/admin/comunicados"
            element={
              <ProtectedRoute>
                <Comunicados/>
              </ProtectedRoute>
            }
          />





          {/* rotas extras */}
            <Route
            path="/admin/config"
            element={
              <ProtectedRoute>
                <Config/>
              </ProtectedRoute>
            }
          />




          {/* Rotas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/projetos" element={<Projetos />} />
          <Route path="/pesquisas" element={<Pesquisas />} />
          <Route path="/publicacoes" element={<Publicacoes />} />
          <Route path="/equipe" element={<Equipe />} />

        </Routes>
      </main>

      {!hideLayout && <Footer />}
    </div>
  )
}

export default function App() {
  return <AppContent />
}
