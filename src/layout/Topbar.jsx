// src/components/layout/Topbar.jsx

import React from "react";

export default function Topbar({ userName = "Administrador" }) {
  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Título da página (opcional, pode ser controlado por cada page) */}
      <h1 className="text-xl font-semibold text-gray-800 capitalize">
        Dashboard
      </h1>

      {/* Saudação e avatar */}
      <div className="flex items-center gap-4">
        <span className="text-gray-600 hidden md:block">
          Olá, {userName}
        </span>

        <div className="w-10 h-10 rounded-full bg-[#006A4E] text-white flex items-center justify-center font-semibold uppercase shadow-sm">
          {userName.slice(0, 1)}
        </div>
      </div>
    </header>
  );
}
