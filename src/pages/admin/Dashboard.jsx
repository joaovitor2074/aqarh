import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import AdminLayout from "../../layout/AdminLayout"
import StatCard from "../../ui/StatCard"
import Card from "../../ui/Card"
import Button from "../../ui/Button"
import toast from "react-hot-toast"
import { API_URL, api, apiRequest } from "../../utils/api"
import {
  FaUsers,
  FaProjectDiagram,
  FaFlask,
  FaBullhorn,
  FaSync,
  FaCalendarAlt,
  FaRocket,
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa"

import styles from "../../styles/adminPages/dashboard.module.css"

const FINAL_STATUSES = new Set(["sucesso", "erro", "erro_parcial", "cancelando"])

function formatDate(value) {
  if (!value) return "Sem registro"

  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getStatusLabel(status) {
  const labels = {
    parado: "Parado",
    iniciando: "Iniciando",
    executando: "Em execucao",
    sucesso: "Concluido",
    erro: "Erro",
    erro_parcial: "Erro parcial",
    cancelando: "Cancelando",
  }

  return labels[status] || status || "Parado"
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMembros: 0,
    totalLinhas: 0,
    totalComunicados: 0,
    totalProjetos: 14,
    comunicadosAtivos: 0,
    comunicadosRascunhos: 0,
  })
  const [loadingScrape, setLoadingScrape] = useState(false)
  const [ultimasLinhas, setUltimasLinhas] = useState([])
  const [atividades, setAtividades] = useState([])
  const [notificacoesPendentes, setNotificacoesPendentes] = useState(0)
  const [scrapeEvent, setScrapeEvent] = useState(null)
  const [scrapeLog, setScrapeLog] = useState([])
  const [scrapeConnection, setScrapeConnection] = useState("conectando")

  const scrapeStatus = scrapeEvent?.status || "parado"
  const scrapeRunning = loadingScrape || scrapeStatus === "iniciando" || scrapeStatus === "executando"
  const displayStatus = scrapeRunning && scrapeEvent?.etapa !== "final" ? "executando" : scrapeStatus

  const statusClass = useMemo(() => {
    if (displayStatus === "sucesso") return styles.statusSuccess
    if (displayStatus === "erro" || displayStatus === "erro_parcial") return styles.statusError
    if (scrapeRunning) return styles.statusRunning
    return styles.statusIdle
  }, [displayStatus, scrapeRunning])

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true)

      const [
        membrosRes,
        linhasRes,
        comunicadosRes,
        ultimasLinhasRes,
        atividadesRes,
        notificacoesRes,
      ] = await Promise.allSettled([
        api.get("/membros/quantidade"),
        api.get("/linhas-pesquisa/quantidade"),
        api.get("/comunicados/quantidade"),
        api.get("/linhas-pesquisa/ultimas"),
        api.get("/comunicados/recentes"),
        apiRequest("/adminjv/scrape/notificacoes"),
      ])

      const membrosData = membrosRes.status === "fulfilled" ? membrosRes.value : {}
      const linhasData = linhasRes.status === "fulfilled" ? linhasRes.value : {}
      const comunicadosData =
        comunicadosRes.status === "fulfilled"
          ? comunicadosRes.value
          : { total: 0, ativos: 0, rascunhos: 0 }

      setStats({
        totalMembros: membrosData.total || 0,
        totalLinhas: linhasData.total || 0,
        totalComunicados: comunicadosData.total || 0,
        totalProjetos: 14,
        comunicadosAtivos: comunicadosData.ativos || 0,
        comunicadosRascunhos: comunicadosData.rascunhos || 0,
      })

      setUltimasLinhas(
        ultimasLinhasRes.status === "fulfilled" && Array.isArray(ultimasLinhasRes.value)
          ? ultimasLinhasRes.value
          : []
      )
      setAtividades(
        atividadesRes.status === "fulfilled" && Array.isArray(atividadesRes.value)
          ? atividadesRes.value
          : []
      )
      setNotificacoesPendentes(
        notificacoesRes.status === "fulfilled" && Array.isArray(notificacoesRes.value)
          ? notificacoesRes.value.length
          : 0
      )
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      toast.error("Erro ao carregar dados do dashboard")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  useEffect(() => {
    let source

    async function prepararStatus() {
      try {
        const snapshot = await apiRequest("/adminjv/scrape/snapshot")
        if (snapshot?.lastEvent) {
          setScrapeEvent(snapshot.lastEvent)
        }
        setLoadingScrape(Boolean(snapshot?.isScraping))
      } catch (error) {
        console.warn("Nao foi possivel carregar snapshot do scraping:", error)
      }

      source = new EventSource(`${API_URL}/adminjv/scrape/status`)
      source.onopen = () => setScrapeConnection("online")
      source.onerror = () => setScrapeConnection("offline")
      source.onmessage = (message) => {
        try {
          const event = JSON.parse(message.data)
          const snapshot = event.snapshot

          if (snapshot?.lastEvent) {
            setScrapeEvent(snapshot.lastEvent)
            setLoadingScrape(Boolean(snapshot.isScraping))
            return
          }

          if (event.etapa === "heartbeat") {
            return
          }

          setScrapeEvent(event)
          setScrapeLog((prev) => [event, ...prev].slice(0, 6))

          const isFinalEvent = event.etapa === "final" || event.etapa === "cancelamento"

          if (isFinalEvent && FINAL_STATUSES.has(event.status)) {
            setLoadingScrape(false)
            carregarDados()
          } else if (event.status === "iniciando" || event.status === "executando" || !isFinalEvent) {
            setLoadingScrape(true)
          }
        } catch (error) {
          console.warn("Evento de scraping invalido:", error)
        }
      }
    }

    prepararStatus()

    return () => {
      if (source) source.close()
    }
  }, [carregarDados])

  const handleScrape = async () => {
    try {
      setLoadingScrape(true)
      toast.loading("Iniciando scraping...", { id: "scrape" })

      const result = await apiRequest("/adminjv/scrape/run", {
        method: "POST",
      })

      setScrapeEvent({
        scrapeId: result.scrapeId,
        etapa: "inicio",
        status: "iniciando",
        mensagem: result.message || "Scraping iniciado",
        timestamp: new Date().toISOString(),
      })

      toast.success("Scraping iniciado. Acompanhe o progresso no dashboard.", {
        id: "scrape",
        duration: 4000,
      })
    } catch (error) {
      setLoadingScrape(false)
      toast.error(`Erro ao iniciar scraping: ${error.message}`, {
        id: "scrape",
        duration: 5000,
      })
    }
  }

  return (
    <AdminLayout>
      <div className={styles.dashboardContainer}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>
              Visao geral do sistema GIEPI e das atualizacoes do scraping
            </p>
          </div>

          <div className={styles.headerActions}>
            <Button
              onClick={() => navigate("/admin/notificacoes")}
              variant={notificacoesPendentes > 0 ? "warning" : "outline"}
              className={styles.notificationButton}
            >
              <FaBell />
              {notificacoesPendentes} pendente(s)
            </Button>

            <Button
              onClick={handleScrape}
              disabled={scrapeRunning}
              className={styles.scrapeButton}
            >
              <FaSync className={scrapeRunning ? styles.spinning : ""} />
              {scrapeRunning ? "Executando..." : "Verificar atualizacoes"}
            </Button>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <StatCard
            icon={<FaUsers className={styles.icon} />}
            title="Total de Membros"
            value={loading ? "..." : stats.totalMembros}
            color="primary"
            trend={`${stats.totalMembros} cadastrados`}
            loading={loading}
          />

          <StatCard
            icon={<FaProjectDiagram className={styles.icon} />}
            title="Projetos Ativos"
            value={stats.totalProjetos}
            color="success"
            trend="Base atual"
            loading={loading}
          />

          <StatCard
            icon={<FaFlask className={styles.icon} />}
            title="Linhas de Pesquisa"
            value={loading ? "..." : stats.totalLinhas}
            color="warning"
            trend="Sincronizadas via scraping"
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

        <Card className={styles.scrapeCard}>
          <div className={styles.scrapeHeader}>
            <div>
              <div className={styles.cardHeaderCompact}>
                <FaSync className={styles.cardIcon} />
                <h3>Atualizacao por scraping</h3>
              </div>
              <p className={styles.scrapeDescription}>
                Execute a coleta, acompanhe o progresso e aprove as novidades encontradas.
              </p>
            </div>

            <span className={`${styles.scrapeStatus} ${statusClass}`}>
              {scrapeRunning ? <FaSync className={styles.spinning} /> : <FaCheckCircle />}
              {getStatusLabel(displayStatus)}
            </span>
          </div>

          <div className={styles.scrapeGrid}>
            <div className={styles.scrapeSummary}>
              <span className={styles.summaryLabel}>Ultimo evento</span>
              <strong>{scrapeEvent?.mensagem || "Nenhum evento registrado"}</strong>
              <small>{formatDate(scrapeEvent?.timestamp)}</small>
              <small>Conexao: {scrapeConnection === "online" ? "ativa" : "reconectando"}</small>
            </div>

            <div className={styles.scrapeSummary}>
              <span className={styles.summaryLabel}>Pendencias</span>
              <strong>{notificacoesPendentes}</strong>
              <small>Itens aguardando aprovacao administrativa</small>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/notificacoes")}
              >
                Revisar notificacoes
              </Button>
            </div>

            <div className={styles.scrapeSummary}>
              <span className={styles.summaryLabel}>Acao rapida</span>
              <strong>{scrapeRunning ? "Coleta em andamento" : "Pronto para nova verificacao"}</strong>
              <small>
                {scrapeRunning
                  ? "Aguarde a conclusao antes de iniciar outra coleta."
                  : "O processo roda em segundo plano."}
              </small>
              <Button size="sm" onClick={handleScrape} disabled={scrapeRunning}>
                <FaSync className={scrapeRunning ? styles.spinning : ""} />
                Executar
              </Button>
            </div>
          </div>

          <div className={styles.scrapeLog}>
            {scrapeLog.length === 0 ? (
              <div className={styles.emptyInline}>
                <FaExclamationTriangle />
                Aguardando novos eventos de scraping.
              </div>
            ) : (
              scrapeLog.map((event, index) => (
                <div key={`${event.timestamp}-${index}`} className={styles.logItem}>
                  <span>{event.etapa}</span>
                  <strong>{event.mensagem}</strong>
                  <small>{formatDate(event.timestamp)}</small>
                </div>
              ))
            )}
          </div>
        </Card>

        <div className={styles.contentGrid}>
          <Card className={styles.projectsCard}>
            <div className={styles.cardHeader}>
              <FaRocket className={styles.cardIcon} />
              <h3>Ultimas linhas de pesquisa</h3>
            </div>

            <div className={styles.projectsList}>
              {ultimasLinhas.length === 0 ? (
                <p className={styles.emptyText}>Nenhuma linha cadastrada</p>
              ) : (
                ultimasLinhas.map((linha) => (
                  <div key={linha.id} className={styles.projectItem}>
                    <div className={styles.projectInfo}>
                      <h4>{linha.nome}</h4>
                      <p className={styles.projectDesc}>
                        {linha.grupo || "Sem grupo cadastrado"}
                      </p>
                    </div>

                    <span
                      className={`${styles.projectStatus} ${
                        linha.ativo ? styles.statusCompleted : ""
                      }`}
                    >
                      {linha.ativo ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                ))
              )}
            </div>

            <Button className={styles.viewAllButton} onClick={() => navigate("/admin/linhaspesquisas")}>
              Ver todas as linhas
            </Button>
          </Card>

          <Card className={styles.activityCard}>
            <div className={styles.cardHeader}>
              <FaCalendarAlt className={styles.cardIcon} />
              <h3>Atividades recentes</h3>
            </div>

            <div className={styles.activityList}>
              {atividades.length === 0 ? (
                <p className={styles.emptyText}>Nenhuma atividade recente</p>
              ) : (
                atividades.map((item) => (
                  <div key={item.id} className={styles.activityItem}>
                    <div className={styles.activityDot}></div>

                    <div className={styles.activityContent}>
                      <p>{item.titulo}</p>

                      <small className={styles.activityTime}>
                        {formatDate(item.criado_em)}
                      </small>

                      {item.descricao && (
                        <small className={styles.activityDesc}>
                          {item.descricao}
                        </small>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
