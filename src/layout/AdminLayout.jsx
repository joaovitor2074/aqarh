// src/components/layout/AdminLayout.jsx

import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

/*
 * AdminLayout.jsx
 * 
 * Esse componente envolve toda a área administrativa.
 * Ele coloca a Sidebar fixa na esquerda, o Topbar no topo,
 * e deixa o conteúdo da página dentro da área principal.
 * 
 * Uso:
 *
 * <AdminLayout>
 *    <Dashboard />
 * </AdminLayout>
 */

export default function AdminLayout({ children, userName = "Administrador" }) {
  return (
    <div className="min-h-screen w-full flex bg-gray-100">
      {/* SIDEBAR */}
      <Sidebar />

      {/* ÁREA PRINCIPAL */}
      <div className="flex flex-col flex-1">
        {/* TOPBAR */}
        <Topbar userName={userName} />
            
        {/* CONTEÚDO */}
        <main className="p-6 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}