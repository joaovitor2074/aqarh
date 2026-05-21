import React, { useEffect, useState } from "react"
import AdminLayout from "../../layout/AdminLayout"
import StatCard from "../../ui/StatCard"
import Card from "../../ui/Card"
import Button from "../../ui/Button"
import toast from "react-hot-toast"
import {
  FaUsers,
  FaProjectDiagram,
  FaFlask,
  FaBullhorn,
  FaSync,
  FaChartLine,
  FaCalendarAlt,
  FaRocket
} from "react-icons/fa"

import styles from "../../styles/adminPages/dashboard.module.css"

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMembros: 0,
    totalLinhas: 0,
    totalComunicados: 0,
    totalProjetos: 14,
    comunicadosAtivos: 0,
    comunicadosRascunhos: 0
  })
  const [loadingScrape, setLoadingScrape] = useState(false)
  const [ultimasLinhas, setUltimasLinhas] = useState([])
  const [atividades, setAtividades] = useState([])



  /* =========================
     CARREGAMENTO DE TOTAIS
  ========================= */
  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true)

        const [
          membrosRes,
          linhasRes,
          comunicadosRes,
          ultimasLinhasRes,
          atividadesres
        ] = await Promise.allSettled([
          fetch("http://localhost:3000/api/membros/quantidade"),
          fetch("http://localhost:3000/api/linhas-pesquisa/quantidade"),
          fetch("http://localhost:3000/api/comunicados/quantidade"),
          fetch("http://localhost:3000/api/linhas-pesquisa/ultimas"),
          fetch("http://localhost:3000/api/comunicados/recentes")

        ])

        const totalMembros =
          membrosRes.status === "fulfilled"
            ? (await membrosRes.value.json()).total || 0
            : 0

        const totalLinhas =
          linhasRes.status === "fulfilled"
            ? (await linhasRes.value.json()).total || 0
            : 0

        const comunicadosData =
          comunicadosRes.status === "fulfilled"
            ? await comunicadosRes.value.json()
            : { total: 0, ativos: 0, rascunhos: 0 }

        const ultimasLinhas =
          ultimasLinhasRes.status === "fulfilled"
            ? await ultimasLinhasRes.value.json()
            : []

        const atividadesRecente =
          atividadesres.status === "fulfilled"
            ? await atividadesres.value.json()
            : []

        setStats({
          totalMembros,
          totalLinhas,
          totalComunicados: comunicadosData.total || 0,
          totalProjetos: 14, // mock
          comunicadosAtivos: comunicadosData.ativos || 0,
          comunicadosRascunhos: comunicadosData.rascunhos || 0
        })

        // 👉 estado separado para as últimas linhas
        setUltimasLinhas(ultimasLinhas)
        setAtividades(atividadesRecente)

      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        toast.error("Erro ao carregar dados do dashboard")
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [])


  /* =========================
     SCRAPING
  ========================= */
  const handleScrape = async () => {
    try {
      setLoadingScrape(true)
      toast.loading("Executando scraping...", { id: "scrape", duration: 5000 })

      const res = await fetch(
        "http://localhost:3000/adminjv/scrape/run",
        { method: "POST" }
      )

      if (!res.ok) throw new Error("Erro ao rodar scraping")

      toast.success("Scraping iniciado com sucesso! Os dados serão atualizados em breve.", {
        id: "scrape",
        duration: 4000
      })
    } catch (error) {
      toast.error("Erro ao iniciar scraping: " + error.message, {
        id: "scrape",
        duration: 4000
      })
    } finally {
      setLoadingScrape(false)
    }
  }

  return (
    <AdminLayout>
      <div className={styles.dashboardContainer}>

        {/* Cabeçalho */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>
              Visão geral do sistema Giepi
            </p>
          </div>

          <Button
            onClick={handleScrape}
            disabled={loadingScrape}
            className={styles.scrapeButton}
          >
            <FaSync className={loadingScrape ? styles.spinning : ''} />
            {loadingScrape ? " Executando..." : " Verificar atualizações"}
          </Button>
        </div>

        {/* Estatísticas em tempo real */}
        <div className={styles.statsGrid}>
          <StatCard
            icon={<FaUsers className={styles.icon} />}
            title="Total de Membros"
            value={loading ? "..." : stats.totalMembros}
            color="primary"
            trend="+2 este mês"
            loading={loading}
          />

          <StatCard
            icon={<FaProjectDiagram className={styles.icon} />}
            title="Projetos Ativos"
            value={stats.totalProjetos}
            color="success"
            trend="3 em andamento"
            loading={loading}
          />

          <StatCard
            icon={<FaFlask className={styles.icon} />}
            title="Linhas de Pesquisa"
            value={loading ? "..." : stats.totalLinhas}
            color="warning"
            trend=""
            loading={loading}
          />

          <StatCard
            icon={<FaBullhorn className={styles.icon} />}
            title="Comunicados"
            value={loading ? "..." : stats.totalComunicados}
            color="info"
            trend={`${stats.comunicadosAtivos} ativos`}
            subtitle={`${stats.comunicadosRascunhos} rascunhos`}
            loading={loading}
          />
        </div>

        {/* Grid de conteúdo */}
        <div className={styles.contentGrid}>
          {/* Últimas linhas de pesquisa */}
          {ultimasLinhas.length === 0 ? (
            <p>Nenhuma linha cadastrada</p>
          ) : (
            <Card className={styles.projectsCard}>
              <div className={styles.cardHeader}>
                <FaRocket className={styles.cardIcon} />
                <h3>Últimas Linhas de pesquisa</h3>
              </div>

              <div className={styles.projectsList}>
                {ultimasLinhas.map((linha) => (
                  <div key={linha.id} className={styles.projectItem}>
                    <div className={styles.projectInfo}>
                      <h4>{linha.nome}</h4>
                      <p className={styles.projectDesc}>
                        {linha.grupo || "Sem descrição cadastrada"}
                      </p>
                    </div>

                    <span
                      className={`${styles.projectStatus} ${linha.status === "concluido"
                          ? styles.statusCompleted
                          : ""
                        }`}
                    >
                      {linha.status || "Em andamento"}
                    </span>
                  </div>
                ))}
              </div>

              <Button className={styles.viewAllButton}>
                Ver todas as linhas
              </Button>
            </Card>
          )}


          {/* Atividades recentes */}
          <Card className={styles.activityCard}>
            <div className={styles.cardHeader}>
              <FaCalendarAlt className={styles.cardIcon} />
              <h3>Atividades Recentes</h3>
            </div>

            <div className={styles.activityList}>
              {atividades.length === 0 ? (
                <p>Nenhuma atividade recente</p>
              ) : (
                atividades.map((item) => (
                  <div key={item.id} className={styles.activityItem}>
                    <div className={styles.activityDot}></div>

                    <div className={styles.activityContent}>
                      <p>{item.titulo}</p>

                      <small className={styles.activityTime}>
                        {new Date(item.criado_em).toLocaleString("pt-BR")}
                      </small>
                      {item.descricao && (
                        <p>
                          <small className={styles.activityDesc}>
                            {item.descricao}
                          </small>
                        </p>
                      )}

                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>


          {/* Estatísticas rápidas
          <Card className={styles.quickStatsCard}>
            <div className={styles.cardHeader}>
              <FaChartLine className={styles.cardIcon} />
              <h3>Estatísticas Rápidas</h3>
            </div>

            <div className={styles.quickStats}>
              <div className={styles.quickStat}>
                <span className={styles.statLabel}>Taxa de crescimento</span>
                <span className={styles.statValue}>+12%</span>
              </div>

              <div className={styles.quickStat}>
                <span className={styles.statLabel}>Novos membros (30 dias)</span>
                <span className={styles.statValue}>8</span>
              </div>

              <div className={styles.quickStat}>
                <span className={styles.statLabel}>Projetos ativos</span>
                <span className={styles.statValue}>6</span>
              </div>

              <div className={styles.quickStat}>
                <span className={styles.statLabel}>Taxa de conclusão</span>
                <span className={styles.statValue}>78%</span>
              </div>
            </div>
          </Card> */}
        </div>

      </div>
    </AdminLayout>
  )
}