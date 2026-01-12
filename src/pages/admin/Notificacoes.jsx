import { useEffect, useState } from "react"
import AdminLayout from "../../layout/AdminLayout"

export default function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    async function carregarNotificacoes() {
      try {
        const res = await fetch("http://localhost:3000/adminjv/scrape/notificacoes")
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

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">
          Notificações de Scraping
        </h1>

        {loading && <p>Carregando notificações...</p>}
        {erro && <p className="text-red-500">{erro}</p>}

        {!loading && notificacoes.length === 0 && (
          <p>Nenhuma notificação pendente 🎉</p>
        )}

        <div className="space-y-4">
          {notificacoes.map((n) => (
            <div
              key={n.id}
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              <div className="flex justify-between items-center">
                <strong>{n.tipo}</strong>
                <span className="text-sm text-gray-500">
                  {new Date(n.criado_em).toLocaleString()}
                </span>
              </div>

              <pre className="mt-3 text-sm bg-gray-100 p-3 rounded overflow-auto">
                {JSON.stringify(n.dados, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
