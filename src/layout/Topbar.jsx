// src/components/layout/Topbar.jsx

import React from "react";
import { useConfig } from "../contexts/ConfigContext";

export default function Topbar() {
  const { configuracoesGerais } = useConfig(); // ✅ AQUI DENTRO

  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-800 capitalize">
        Dashboard
      </h1>

      <div className="flex items-center gap-4">
        <span className="text-gray-600 hidden md:block">
          Olá, {configuracoesGerais?.nomeSistema}
        </span>

        <div className="w-10 h-10 rounded-full bg-[#006A4E] text-white flex items-center justify-center font-semibold uppercase shadow-sm">
        </div>
      </div>
    </header>
  );
}
