// src/pages/admin/Dashboard.jsx

import React from "react";
import AdminLayout from "../../layout/AdminLayout";
import StatCard from "../../ui/StatCard";

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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Últimos Projetos</h3>
          <ul className="space-y-3">
            <li className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">Análise de compostos bioativos</li>
            <li className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">Estudos sobre recursos hídricos no nordeste</li>
            <li className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">Modelagem em química orgânica avançada</li>
          </ul>
        </div>

      </div>
    </AdminLayout>
  );
}
