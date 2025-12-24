// src/components/layout/Sidebar.jsx

import React from "react";
import { NavLink } from "react-router-dom";

// Tailwind classes usando o estilo IFMA
// Verde IFMA: #006A4E

export default function Sidebar() {
  const menu = [
    { label: "Dashboard", path: "/admin/dashboard", icon: HomeIcon },
    { label: "Membros", path: "/admin/membros", icon: UsersIcon },
    { label: "Projetos", path: "/admin/projetos", icon: ProjectsIcon },
    { label: "Linhas de Pesquisa", path: "/admin/linhaspesquisas", icon: FlaskIcon },
    { label: "Comunicados", path: "/admin/comunicados", icon: MegaphoneIcon },
    { label: "Configurações", path: "/admin/config", icon: ConfigIcon },
  ];

  return (
    <aside className="w-64 bg-[#006A4E] text-white min-h-screen flex flex-col">
      {/* Header da Sidebar */}
      <div className="px-6 py-6 flex items-center gap-3 border-b border-green-900/20">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <LogoIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="font-bold text-lg">GIEPI</div>
          <div className="text-sm text-green-200">IFMA • Campus Codó</div>
        </div>
      </div>

      {/* Menu */}
      <nav className="mt-6 px-3 flex-1 space-y-1">
        {menu.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-md transition-all ${
                isActive
                  ? "bg-green-800 text-white"
                  : "text-white hover:bg-green-700/70"
              }`
            }
          >
            <item.icon className="w-5 h-5 opacity-90" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Botão de Logout */}
      <div className="p-4 border-t border-green-900/20">
        <button className="w-full bg-white/10 text-white px-3 py-2 rounded-md text-left hover:bg-white/20">
          Sair
        </button>
      </div>
    </aside>
  );
}

/******************************
 * ÍCONES (SVG Inline)
 ******************************/

function LogoIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C9.79 2 8 3.79 8 6c0 1.9 1.19 3.53 2.86 4.12C10.31 10.42 9 12.56 9 15c0 1.66.67 3.16 1.76 4.24A6 6 0 0018 15c0-3.31-2.69-6-6-6-1.31 0-2.5.42-3.5 1.12C9.41 8.97 10 7.55 10 6c0-2.21-1.79-4-4-4z" />
    </svg>
  );
}

function HomeIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 4l9 5.75v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8z" />
    </svg>
  );
}

function UsersIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 11a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function ProjectsIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3v4M8 3v4M3 11h18" />
    </svg>
  );
}

function FlaskIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M8 7v6a4 4 0 004 4v0a4 4 0 004-4V7" />
    </svg>
  );
}

function MegaphoneIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5l7 4v6l-7 4V5zM4 9v6" />
    </svg>
  );
}

function ConfigIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.282.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
