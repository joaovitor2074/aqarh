// src/components/ui/StatCard.jsx

import React from "react";

/*
 * StatCard.jsx
 * Componente de card de estatísticas reutilizável.
 * Mostra ícone, título e valor.
 * 
 * Uso:
 * <StatCard icon={<UsersIcon />} title="Membros" value={32} />
 */

export default function StatCard({ icon, title, value }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
      {/* Ícone */}
      <div className="w-12 h-12 bg-[#006A4E]/10 text-[#006A4E] rounded-lg flex items-center justify-center">
        {icon}
      </div>

      {/* Texto */}
      <div>
        <h3 className="text-sm text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}