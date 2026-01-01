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

export default function Dashboard() {
  const [totalMembros, setTotalMembros] = useState(0);
  const [totalLinhas, setTotalLinhas] = useState(0);
  const [loading, setLoading] = useState(true);


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
    setLoading(true)

    const response = await fetch("http://localhost:3000/adminjv/scrape/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
    })

    const data = await response.json()
        // ex: { membros_verificados: 12, alteracoes_encontradas: 3 }

  } catch (error) {
    console.error("Erro ao verificar atualizações", error)
  } finally {
    setLoading(false)
  }
}






  return (
    <AdminLayout>
      <div className="w-full space-y-6">

        {/* Título da Página */}
        <h2 className="text-2xl font-semibold text-gray-800 flex">Visão Geral</h2>

        <Button onClick={handleScrape}>
          {"Verificar atualizações"}
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
