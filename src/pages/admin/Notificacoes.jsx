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

  const handleAprovar = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/adminjv/scrape/notificacao/aprovar/${id}`, {
        method: "POST"
      })
      if (!res.ok) throw new Error("Falha ao aprovar")

      // Remove notificação aprovada da lista
      setNotificacoes((prev) => prev.filter(n => n.id !== id))
      toast.success("Notificação aprovada ✅")
    } catch (err) {
      toast.error(err.message)
    }
  }

const handleIgnorar = () => {
  setNotificacoes([]);
  toast("notificações ignoradas 🗑️", { icon: "🗑️" });
};

const handleIgnorartodos = () => {
  setNotificacoes([]);
  toast("todas as notificações ignoradas 🗑️", { icon: "🗑️" });
}


 const handleAprovarTodos = async () => {
  try {
    // Percorre todas as notificações
    for (const n of notificacoes) {
      const res = await fetch(
        `http://localhost:3000/adminjv/scrape/notificacao/aprovar/${n.id}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error(`Falha ao aprovar ${n.tipo}`);
    }

    // Limpa a lista de notificações
    setNotificacoes([]);
    toast.success("Todas as notificações foram aprovadas ✅");
  } catch (err) {
    toast.error(err.message);
  }
};


  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="p-6">
        <div className="flex ">
          <h1 className="text-2xl font-semibold mb-6">
            Notificações de Scraping
          </h1>
          <div className="btns-not flex float-end">
             <button
                      onClick={() => handleAprovarTodos()}
                      className="px-5 py-6 bg-green-500 text-white rounded hover:bg-green-600 transition"
                    >
                      Aprovar todos
              </button>
             <button
                      onClick={() => handleIgnorartodos()}
                      className="px-5 py-6 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      ignorar todos
              </button>
          </div>
        </div>



        {loading && <p>Carregando notificações...</p>}
        {erro && <p className="text-red-500">{erro}</p>}

        {!loading && notificacoes.length === 0 && (
          <p>Nenhuma notificação pendente 🎉</p>
        )}

        <div className="space-y-4">
          {notificacoes.map((n) => (
            <div
              key={n.id}
              className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <strong className="capitalize">{n.tipo.replaceAll("_", " ")}</strong>
                <span className="text-sm text-gray-500">
                  {new Date(n.criado_em).toLocaleString()}
                </span>
              </div>

              <pre className="mt-3 text-sm bg-gray-50 p-3 rounded overflow-auto">
                {JSON.stringify(n.dados, null, 2)}
              </pre>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleAprovar(n.id)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  Aprovar
                </button>
                <button
                  onClick={() => handleIgnorar(n.id)}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                >
                  Ignorar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
