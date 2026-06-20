import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { CalendarDays, ShieldCheck } from "lucide-react";
import { useConfig } from "../contexts/ConfigContext";
import styles from "../styles/adminLayout.module.css";

const pageMeta = {
  "/admin/dashboard": {
    title: "Painel institucional",
    description: "Indicadores de gestao, pesquisa e comunicacao do GIEPI.",
  },
  "/admin/membros": {
    title: "Membros",
    description: "Cadastro e acompanhamento da comunidade academica.",
  },
  "/admin/projetos": {
    title: "Projetos",
    description: "Gestao dos projetos vinculados ao grupo.",
  },
  "/admin/linhaspesquisas": {
    title: "Linhas de pesquisa",
    description: "Organizacao das frentes de pesquisa e seus vinculos.",
  },
  "/admin/comunicados": {
    title: "Comunicados",
    description: "Publicacao e acompanhamento dos informes institucionais.",
  },
  "/admin/email-massa": {
    title: "Email em massa",
    description: "Comunicacao direta com membros e pesquisadores.",
  },
  "/admin/notificacoes": {
    title: "Notificacoes",
    description: "Fila de revisao das atualizacoes identificadas.",
  },
  "/admin/config": {
    title: "Configuracoes",
    description: "Parametros gerais da plataforma administrativa.",
  },
};

export default function Topbar() {
  const { pathname } = useLocation();
  const { configuracoesGerais } = useConfig();

  const meta = pageMeta[pathname] || {
    title: "Area administrativa",
    description: "Ambiente de gestao do sistema institucional.",
  };

  const today = useMemo(
    () =>
      new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    []
  );

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarTitle}>
        <span className={styles.eyebrow}>Sistema administrativo</span>
        <h1>{meta.title}</h1>
        <p>{meta.description}</p>
      </div>

      <div className={styles.topbarActions}>
        <div className={styles.infoPill}>
          <CalendarDays size={16} aria-hidden="true" />
          <span>{today}</span>
        </div>

        <div className={styles.userPill}>
          <span>
            {configuracoesGerais?.nomeSistema || "Gestao GIEPI"}
          </span>
          <div className={styles.userAvatar} aria-hidden="true">
            <ShieldCheck size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}
