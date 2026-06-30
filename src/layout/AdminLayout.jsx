// src/components/layout/AdminLayout.jsx

import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import styles from "../styles/adminLayout.module.css";

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
    <div className={styles.adminShell}>
      {/* SIDEBAR */}
      <Sidebar />

      {/* ÁREA PRINCIPAL */}
      <div className={styles.mainPanel}>
        {/* TOPBAR */}
        <Topbar userName={userName} />
            
        {/* CONTEÚDO */}
        <main className={styles.contentArea}>
          {children}
        </main>
      </div>
    </div>
  );
}
