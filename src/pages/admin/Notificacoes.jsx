// src/pages/admin/Notificacoes.jsx
// Refatorado: usa `api` util em vez de fetch hardcoded com localhost

import { useEffect, useState, useCallback } from "react"
import AdminLayout from "../../layout/AdminLayout"
import Card from "../../ui/Card"
import Button from "../../ui/Button"
import toast from "react-hot-toast"
import { apiRequest } from "../../utils/api"
import {
  FaBell,
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaInbox,
} from "react-icons/fa"
import "../../styles/adminPages/notificacao.css"

function formatarData(valor) {
  if (!valor) return ""
  return new Date(valor).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function tipoLabel(tipo) {
  if (!tipo) return ""
  return tipo.replaceAll("_", " ").toLowerCase()
}

export default function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [aprovandoId, setAprovandoId] = useState(null)
  const [aprovandoTodos, setAprovandoTodos] = useState(false)
  const [erro, setErro] = useState(null)

  const carregarNotificacoes = useCallback(async () => {
    setLoading(true)
    setErro(null)
    try {
      const data = await apiRequest("/adminjv/scrape/notificacoes")
      setNotificacoes(Array.isArray(data) ? data : [])
    } catch (err) {
      setErro("Não foi possível carregar as notificações.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarNotificacoes()
  }, [carregarNotificacoes])

  const handleAprovar = async (id) => {
    setAprovandoId(id)
    try {
      await apiRequest(`/adminjv/scrape/notificacao/aprovar/${id}`, {
        method: "POST",
      })
      setNotificacoes((prev) => prev.filter((n) => n.id !== id))
      toast.success("Notificação aprovada com sucesso!")
    } catch (err) {
      toast.error("Falha ao aprovar notificação.")
    } finally {
      setAprovandoId(null)
    }
  }

  const handleAprovarTodos = async () => {
    if (notificacoes.length === 0) return
    const confirmar = window.confirm(
      `Aprovar todas as ${notificacoes.length} notificações pendentes?`
    )
    if (!confirmar) return

    setAprovandoTodos(true)
    let erros = 0
    for (const n of notificacoes) {
      try {
        await apiRequest(`/adminjv/scrape/notificacao/aprovar/${n.id}`, {
          method: "POST",
        })
      } catch {
        erros++
      }
    }
    setAprovandoTodos(false)

    if (erros === 0) {
      setNotificacoes([])
      toast.success("Todas as notificações foram aprovadas!")
    } else {
      toast.error(`${erros} notificação(ões) falharam. Recarregando...`)
      carregarNotificacoes()
    }
  }

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-4xl space-y-5 p-0 sm:space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-start gap-2 text-xl font-semibold leading-tight text-gray-900 sm:text-2xl">
              <FaBell className="mt-1 shrink-0 text-[#006A4E]" />
              Notificações de Scraping
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Revise e aprove as atualizações encontradas pelo sistema.
            </p>
          </div>

          {notificacoes.length > 0 && (
            <button
              onClick={handleAprovarTodos}
              disabled={aprovandoTodos}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#006A4E] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-800 disabled:opacity-60 sm:w-auto"
            >
              {aprovandoTodos ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaCheckCircle />
              )}
              {aprovandoTodos ? "Aprovando..." : `Aprovar todas (${notificacoes.length})`}
            </button>
          )}
        </div>

        {/* Estados */}
        {loading && (
          <div className="flex items-center gap-3 text-gray-500 py-8">
            <FaSpinner className="animate-spin text-xl" />
            <span>Carregando notificações...</span>
          </div>
        )}

        {erro && !loading && (
          <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 sm:flex-row sm:items-center">
            <FaExclamationTriangle className="shrink-0" />
            <span>{erro}</span>
            <button
              onClick={carregarNotificacoes}
              className="text-left text-sm underline hover:no-underline sm:ml-auto"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !erro && notificacoes.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
            <FaInbox className="text-5xl opacity-40" />
            <p className="text-base">Nenhuma notificação pendente!</p>
            <p className="text-sm">Tudo está em dia por aqui.</p>
          </div>
        )}

        {/* Lista */}
        <div className="space-y-3">
          {notificacoes.map((n) => (
            <div
              key={n.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <span className="inline-block text-xs font-semibold uppercase tracking-wide text-[#006A4E] bg-green-50 border border-green-200 px-2 py-0.5 rounded mb-2">
                    {tipoLabel(n.tipo)}
                  </span>
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {n.descricao}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {formatarData(n.criado_em)}
                  </p>
                </div>

                <button
                  onClick={() => handleAprovar(n.id)}
                  disabled={aprovandoId === n.id || aprovandoTodos}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-green-500 px-3 py-2 text-sm text-white transition-colors hover:bg-green-600 disabled:opacity-60 sm:w-auto"
                >
                  {aprovandoId === n.id ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaCheckCircle />
                  )}
                  {aprovandoId === n.id ? "Aprovando..." : "Aprovar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
