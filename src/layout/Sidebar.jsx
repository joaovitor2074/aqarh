import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  FlaskConical,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Mail,
  Megaphone,
  Settings,
  UsersRound,
} from "lucide-react";
import styles from "../styles/adminLayout.module.css";

const menu = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Membros", path: "/admin/membros", icon: UsersRound },
  { label: "Projetos", path: "/admin/projetos", icon: FolderKanban },
  { label: "Linhas de Pesquisa", path: "/admin/linhaspesquisas", icon: FlaskConical },
  { label: "Comunicados", path: "/admin/comunicados", icon: Megaphone },
  { label: "Email em Massa", path: "/admin/email-massa", icon: Mail },
  { label: "Notificacoes", path: "/admin/notificacoes", icon: Bell },
  { label: "Configuracoes", path: "/admin/config", icon: Settings },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brandBlock}>
        <div className={styles.brandMark}>
          <Building2 size={24} aria-hidden="true" />
        </div>

        <div className={styles.brandText}>
          <strong>GIEPI</strong>
          <span>IFMA | Campus Codo</span>
        </div>
      </div>

      <nav className={styles.navList} aria-label="Navegacao administrativa">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
              }
            >
              <Icon size={18} strokeWidth={2} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className={styles.logoutPanel}>
        <button type="button" onClick={handleLogout} className={styles.logoutButton}>
          <LogOut size={18} aria-hidden="true" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
