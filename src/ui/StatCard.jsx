import React from "react";
import Card from "./Card";

/*
 * StatCard.jsx
 * Card de estatísticas reutilizável.
 * Usa o componente base Card do GIEPI.
 *
 * Uso:
 * <StatCard icon={<UsersIcon />} title="Membros" value={32} />
 */

export default function StatCard({ icon, title, value }) {
  return (
    <Card className="flex items-center gap-4">
      {/* Ícone */}
      <div className="w-12 h-12 bg-[#006A4E]/10 text-[#006A4E] rounded-lg flex items-center justify-center">
        {icon}
      </div>

      {/* Texto */}
      <div>
        <h3 className="text-sm text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </Card>
  );
}
