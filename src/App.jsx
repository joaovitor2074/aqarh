import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Projetos from './pages/Projetos'
import Pesquisas from './pages/Pesquisas'
import Publicacoes from './pages/Publicacoes'
import Equipe from './pages/Equipe'
import Login from './pages/Login'

function AppContent() {
  const location = useLocation()

  // Esconde header e footer apenas na página de login
  const hideLayout = location.pathname === "/login"

  return (
    <div className="app-root">
      {!hideLayout && <Header />}

      <main>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/admin/adelton" element={<div>Admin Adelton Dashboard</div>} />
          <Route path="/admin/pesquisador" element={<div>Pesquisador Dashboard</div>} />

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
