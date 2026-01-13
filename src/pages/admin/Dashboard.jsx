import React, { useEffect, useState } from "react"
import AdminLayout from "../../layout/AdminLayout"
import StatCard from "../../ui/StatCard"
import Card from "../../ui/Card"
import Button from "../../ui/Button"
import toast from "react-hot-toast"

import {
  UsersIcon,
  ProjectsIcon,
  FlaskIcon,
  MegaphoneIcon
} from "../../icons"

export default function Dashboard() {
  const [totalMembros, setTotalMembros] = useState(0)
  const [totalLinhas, setTotalLinhas] = useState(0)
  const [totalComunicados, setTotalComunicados] = useState(0)
  const [loadingScrape, setLoadingScrape] = useState(false)

  /* =========================
     CARREGAMENTO DE TOTAIS
  ========================= */
  useEffect(() => {
    async function carregarDados() {
      try {
        const [membrosRes, linhasRes, comunicadosRes] = await Promise.all([
          fetch("http://localhost:3000/api/membros/quantidade"),
          fetch("http://localhost:3000/api/linhas-pesquisa/quantidade"),
          fetch("http://localhost:3000/comunicados/rascunhos"),
        ])

        const membros = await membrosRes.json()
        const linhas = await linhasRes.json()
        const comunicados = await comunicadosRes.json()

        setTotalMembros(membros.total)
        setTotalLinhas(linhas.total)
        setTotalComunicados(comunicados.length)
      } catch (error) {
        console.error(error)
        toast.error("Erro ao carregar dados do dashboard")
      }
    }

    carregarDados()
  }, [])

  /* =========================
     SCRAPING
  ========================= */
  const handleScrape = async () => {
    try {
      setLoadingScrape(true)
      toast.loading("Executando scraping...", { id: "scrape" })

      const res = await fetch(
        "http://localhost:3000/adminjv/scrape/run",
        { method: "POST" }
      )

      if (!res.ok) throw new Error("Erro ao rodar scraping")

      toast.success("Scraping iniciado com sucesso", { id: "scrape" })
    } catch (error) {
      toast.error("Erro ao iniciar scraping", { id: "scrape" })
    } finally {
      setLoadingScrape(false)
    }
  }

  return (
    <AdminLayout>
      <div className="w-full space-y-8">

        {/* Cabeçalho */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Visão Geral
          </h2>

          <Button onClick={handleScrape} disabled={loadingScrape}>
            {loadingScrape ? "Executando..." : "Verificar atualizações"}
          </Button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<UsersIcon className="w-6 h-6" />}
            title="Membros"
            value={totalMembros}
          />

          <StatCard
            icon={<ProjectsIcon className="w-6 h-6" />}
            title="Projetos"
            value={14}
          />

          <StatCard
            icon={<FlaskIcon className="w-6 h-6" />}
            title="Linhas de Pesquisa"
            value={totalLinhas}
          />

          <StatCard
            icon={<MegaphoneIcon className="w-6 h-6" />}
            title="Comunicados (rascunho)"
            value={totalComunicados}
          />
        </div>

        {/* Projetos */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">
            Últimos Projetos
          </h3>

          <ul className="space-y-3">
            <li className="p-3 border rounded-lg hover:bg-gray-50">
              Análise de compostos bioativos
            </li>
            <li className="p-3 border rounded-lg hover:bg-gray-50">
              Estudos sobre recursos hídricos no nordeste
            </li>
            <li className="p-3 border rounded-lg hover:bg-gray-50">
              Modelagem em química orgânica avançada
            </li>
          </ul>

          <Button className="mt-4">
            Adicionar Projeto
          </Button>
        </Card>

      </div>
    </AdminLayout>
  )
}
