import { useEffect, useState } from "react"
import AdminLayout from "../../layout/AdminLayout"
import toast, { Toaster } from "react-hot-toast"
import "../../styles/adminPages/notificacao.css"

export default function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    async function carregarNotificacoes() {
      try {
        const res = await fetch(
          "http://localhost:3000/adminjv/scrape/notificacoes"
        )

        if (!res.ok) throw new Error("Erro ao buscar notificações")

        const data = await res.json()
        setNotificacoes(data)
      } catch (err) {
        setErro(err.message)
      } finally {
        setLoading(false)
      }
    }

    carregarNotificacoes()
  }, [])

  const handleAprovar = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:3000/adminjv/scrape/notificacao/aprovar/${id}`,
        { method: "POST" }
      )

      if (!res.ok) throw new Error("Falha ao aprovar")

      setNotificacoes(prev => prev.filter(n => n.id !== id))
      toast.success("Notificação aprovada ✅")
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleAprovarTodos = async () => {
    try {
      for (const n of notificacoes) {
        const res = await fetch(
          `http://localhost:3000/adminjv/scrape/notificacao/aprovar/${n.id}`,
          { method: "POST" }
        )
        if (!res.ok) throw new Error("Erro ao aprovar notificações")
      }

      setNotificacoes([])
      toast.success("Todas as notificações aprovadas ✅")
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <AdminLayout>
      <Toaster position="top-right" />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">
            Notificações de Scraping
          </h1>

          <button
            onClick={handleAprovarTodos}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Aprovar todas
          </button>
        </div>

        {loading && <p>Carregando notificações...</p>}
        {erro && <p className="text-red-500">{erro}</p>}

        {!loading && notificacoes.length === 0 && (
          <p>Nenhuma notificação pendente 🎉</p>
        )}

        <div className="space-y-4">
          {notificacoes.map(n => (
            <div
              key={n.id}
              className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <strong className="text-sm uppercase text-gray-700">
                  {n.tipo.replaceAll("_", " ")}
                </strong>
                <span className="text-xs text-gray-400">
                  {new Date(n.criado_em).toLocaleString()}
                </span>
              </div>

              <p className="mt-2 text-gray-700">
                {n.descricao}
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleAprovar(n.id)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Aprovar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
