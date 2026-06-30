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
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <FaBell className="text-[#006A4E]" />
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
              className="flex items-center gap-2 px-4 py-2 bg-[#006A4E] text-white rounded-md hover:bg-green-800 disabled:opacity-60 transition-colors text-sm font-medium"
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
          <div className="flex items-center gap-3 text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
            <FaExclamationTriangle />
            <span>{erro}</span>
            <button
              onClick={carregarNotificacoes}
              className="ml-auto text-sm underline hover:no-underline"
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
              className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
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
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 disabled:opacity-60 transition-colors whitespace-nowrap"
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