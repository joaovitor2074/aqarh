import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Projetos from './pages/Projetos'
import Pesquisas from './pages/Pesquisas'
import Publicacoes from './pages/Publicacoes'
import Equipe from './pages/Equipe'



export default function App() {
  return (
    <div className="app-root">
      <Header />


      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projetos" element={<Projetos />} />
          <Route path="/pesquisas" element={<Pesquisas />} />
          <Route path="/publicacoes" element={<Publicacoes />} />
          <Route path="/equipe" element={<Equipe />} />
        </Routes>
      </main>


      <Footer />
    </div>
  )
}