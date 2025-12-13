// src/pages/admin/Dashboard.jsx

import React from "react";

//layout
import AdminLayout from "../../layout/AdminLayout";

//ui components
import StatCard from "../../ui/StatCard";
import Card from "../../ui/Card";
import Button from "../../ui/Button";


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
  return (
    <AdminLayout>
      <div className="w-full space-y-6">

        {/* Título */}
        <h2 className="text-2xl font-semibold text-gray-800">Visão Geral</h2>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<UsersIcon className="w-6 h-6" />} title="Membros" value={32} />
          <StatCard icon={<ProjectsIcon className="w-6 h-6" />} title="Projetos" value={14} />
          <StatCard icon={<FlaskIcon className="w-6 h-6" />} title="Pesquisas" value={27} />
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
