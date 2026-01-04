// src/pages/admin/Dashboard.jsx

import React from "react";

import { useEffect, useState } from "react";

//layout
import AdminLayout from "../../layout/AdminLayout";

//ui components
import StatCard from "../../ui/StatCard";
import Card from "../../ui/Card";
import Button from "../../ui/Button";

//funcoes
import toast from "react-hot-toast";



//icons
import {
  HomeIcon,
  UsersIcon,
  ProjectsIcon,
  ConfigIcon,
  FlaskIcon,
  LogoIcon,
  MegaphoneIcon
} from "../../icons";
const TOAST_ID = "scrape-processo"

const handleScrapeToast = ({ etapa = "processo", status, mensagem }) => {
  if (status === "iniciando") {
    // toast.loading(`⏳ ${etapa} iniciando...`, { id: TOAST_ID })
  }

  if (status === "pronto") {
    toast.loading(`⚙️ ${etapa} pronto`, { id: TOAST_ID })
  }

  if (status === "finalizado") {
    toast.loading(`📦 ${etapa} finalizado`, { id: TOAST_ID })
  }

  if (status === "sucesso") {
    toast.success(`🚀 ${mensagem || "Scraping finalizado com sucesso"}`, {
      id: TOAST_ID,
    })
  }

  if (status === "erro") {
    toast.error(
      `❌ Erro em ${etapa}: ${mensagem || "Erro desconhecido"}`,
      { id: TOAST_ID }
    )
  }
}




export default function Dashboard() {
  const [totalMembros, setTotalMembros] = useState(0);
  const [totalLinhas, setTotalLinhas] = useState(0);
  const [loading, setLoading] = useState(false);

useEffect(() => {
  const eventSource = new EventSource(
    "http://localhost:3000/adminjv/scrape/status"
  )

  eventSource.onmessage = (event) => {
    console.log("🔥 SSE RAW:", event.data)

    let data
    try {
      data = JSON.parse(event.data)
    } catch {
      console.warn("⚠️ SSE inválido:", event.data)
      return
    }

    const { etapa, status, mensagem } = data

    console.log("📡 SSE:", { etapa, status, mensagem })

    /* =========================
       CONTROLE DE LOADING
    ========================= */
    

    /* =========================
       TOAST CENTRALIZADO
    ========================= */
    handleScrapeToast({ etapa, status, mensagem })
  }

  // 🔴 ISSO AQUI É O QUE FALTAVA
  return () => {
    console.log("🔌 Fechando conexão SSE")
    eventSource.close()
  }
}, [])

  useEffect(() => {
    async function carregarTotal() {
      const response = await fetch("http://localhost:3000/api/membros/quantidade", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      setTotalMembros(data.total); // ← CORRETO
    }
    async function carregarlinhas() {
      const response = await fetch("http://localhost:3000/api/linhas-pesquisa/quantidade", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      setTotalLinhas(data.total); // ← CORRETO
    }

    carregarTotal();
    carregarlinhas();
  }, []);


  const handleScrape = async () => {
    try {

      const response = await fetch("http://localhost:3000/adminjv/scrape/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Erro HTTP ${response.status}: ${text}`)
      }

      const data = await response.json()
      console.log("Resposta do scrape:", data)

    } catch (error) {
      console.error("Erro ao verificar atualizações", error)
    } finally {
    }
  }








  return (
    <AdminLayout>
      <div className="w-full space-y-6">

        <h2 className="text-2xl font-semibold text-gray-800 flex">Visão Geral</h2>

        <Button onClick={handleScrape} disabled={loading}>
          {loading ? "Executando scraping..." : "Verificar atualizações"}
        </Button>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<UsersIcon className="w-6 h-6" />} title="Membros" value={totalMembros} />
          <StatCard icon={<ProjectsIcon className="w-6 h-6" />} title="Projetos" value={14} />
          <StatCard icon={<FlaskIcon className="w-6 h-6" />} title="Pesquisas" value={totalLinhas} />
          <StatCard icon={<MegaphoneIcon className="w-6 h-6" />} title="Comunicados" value={7} />
        </div>

        {/* Últimos Projetos */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Últimos Projetos</h3>
          <ul className="space-y-3">
            <li className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              Análise de compostos bioativos
            </li>
            <li className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              Estudos sobre recursos hídricos no nordeste
            </li>
            <li className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              Modelagem em química orgânica avançada
            </li>
          </ul>

          <p className="bg-red-500">falta adiconar botao e melhroar estilizacaoa </p>

          <Button className="mt-4">Adicionar Projeto</Button>
        </Card>

      </div>
    </AdminLayout>
  );
}


