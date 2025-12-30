import React, { useEffect, useState, useCallback } from "react";
import AdminLayout from "../../layout/AdminLayout";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import Input from "../../ui/Input";
import FormGroup from "../../ui/FormGroup";
import { apiRequest } from "../../utils/api";
import toast from "react-hot-toast";

export default function Membros() {
  const [filtroAtivo, setFiltroAtivo] = useState("ativos"); // ativos | inativos | todos
  const [filtroVinculo, setFiltroVinculo] = useState("todos"); // pesquisador | estudante | todos

  const [openModal, setOpenModal] = useState(false);
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    nome: "",
    titulacao_maxima: "",
    data_inclusao: "",
    email: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Função para montar query string e carregar membros
  const carregarMembros = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (filtroAtivo === "ativos") params.set("ativo", "1");
      else if (filtroAtivo === "inativos") params.set("ativo", "0");

      if (filtroVinculo && filtroVinculo !== "todos")
        params.set("tipo_vinculo", filtroVinculo);

      const query = params.toString();
      const path = query ? `/membros?${query}` : "/membros";

      const data = await apiRequest(path);
      setMembros(data || []);
    } catch (error) {
      console.error("❌ Erro ao carregar membros:", error);
      toast.error(error.message || "Erro ao carregar membros");
    } finally {
      setLoading(false);
    }
  }, [filtroAtivo, filtroVinculo]);

  // recarrega quando filtros mudam
  useEffect(() => {
    carregarMembros();
  }, [carregarMembros]);

  async function handleAddMembro() {
    try {
      await apiRequest("/membros", {
        method: "POST",
        body: JSON.stringify(form),
      });

      toast.success("Membro cadastrado com sucesso");
      // reset correto do form
      setForm({ nome: "", titulacao_maxima: "", data_inclusao: "", email: "" });
      setOpenModal(false);
      carregarMembros();
    } catch (error) {
      toast.error(error.message || "Erro ao cadastrar membro");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Deseja realmente excluir este membro?")) return;

    try {
      await apiRequest(`/membros/${id}`, { method: "DELETE" });
      toast.success("Membro excluído com sucesso");
      setMembros((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      toast.error("Erro ao excluir membro");
    }
  }

  async function saveEdit() {
    try {
      await apiRequest(`/membros/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify(editing),
      });

      toast.success("Membro atualizado com sucesso");
      setEditing(null);
      carregarMembros();
    } catch (error) {
      toast.error("Erro ao atualizar membro");
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">Pesquisadores</h2>
          <div className="flex gap-3">
            <select
              value={filtroAtivo}
              onChange={(e) => setFiltroAtivo(e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos (Egressos)</option>
              <option value="todos">Todos</option>
            </select>

            <select
              value={filtroVinculo}
              onChange={(e) => setFiltroVinculo(e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="todos">Todos</option>
              <option value="pesquisador">Pesquisadores</option>
              <option value="estudante">Estudantes</option>
            </select>
          </div>

          <Button onClick={() => setOpenModal(true)}>Adicionar membro</Button>
        </div>

        {/* Lista */}
        <Card>
          {loading ? (
            <p className="text-gray-500">Carregando membros...</p>
          ) : membros.length === 0 ? (
            <p className="text-gray-500">Nenhum membro cadastrado.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3">Nome</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Titulação</th>
                  <th className="pb-3">Incluído</th>
                  <th className="pb-3">Tipo vínculo</th>
                  <th className="pb-3">Ativo</th>
                  <th className="pb-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {membros.map((membro) => (
                  <tr key={membro.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{membro.nome}</td>
                    <td className="py-3">{membro.email ?? "—"}</td>
                    <td className="py-3">{membro.titulacao_maxima ?? "—"}</td>
                    <td className="py-3">
                      {membro.data_inclusao
                        ? new Date(membro.data_inclusao).toLocaleDateString("pt-BR")
                        : "—"}
                    </td>
                    <td className="py-3 capitalize">{membro.tipo_vinculo ?? "—"}</td>
                    <td className="py-3">{membro.ativo ? "Ativo" : "Inativo"}</td>

                    <td className="py-3 flex gap-2">
                      <button
                        onClick={() => setEditing(membro)}
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(membro.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* Modal Novo */}
        <Modal isOpen={openModal} onClose={() => setOpenModal(false)} title="Novo membro">
          <div className="space-y-4">
            <FormGroup label="Nome">
              <Input name="nome" value={form.nome} onChange={handleChange} />
            </FormGroup>

            <FormGroup label="Titulação Máxima">
              <Input
                name="titulacao_maxima"
                value={form.titulacao_maxima}
                onChange={handleChange}
              />
            </FormGroup>

            <FormGroup label="Email">
              <Input name="email" value={form.email} onChange={handleChange} />
            </FormGroup>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpenModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddMembro}>Salvar</Button>
            </div>
          </div>
        </Modal>

        {/* Modal Editar */}
        <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar membro">
          {editing && (
            <div className="space-y-4">
              <Input
                value={editing.nome}
                onChange={(e) => setEditing({ ...editing, nome: e.target.value })}
              />

              <Input
                value={editing.titulacao_maxima}
                onChange={(e) =>
                  setEditing({ ...editing, titulacao_maxima: e.target.value })
                }
              />

              <Input
                value={editing.email}
                onChange={(e) => setEditing({ ...editing, email: e.target.value })}
              />

              {/* opcional: allow editing tipo_vinculo e ativo */}
              <div className="flex gap-2">
                <select
                  value={editing.tipo_vinculo || "pesquisador"}
                  onChange={(e) => setEditing({ ...editing, tipo_vinculo: e.target.value })}
                  className="border rounded px-2 py-1"
                >
                  <option value="pesquisador">pesquisador</option>
                  <option value="estudante">estudante</option>
                </select>

                <select
                  value={editing.ativo ? "1" : "0"}
                  onChange={(e) => setEditing({ ...editing, ativo: Number(e.target.value) })}
                  className="border rounded px-2 py-1"
                >
                  <option value="1">Ativo</option>
                  <option value="0">Inativo</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setEditing(null)}>
                  Cancelar
                </Button>
                <Button onClick={saveEdit}>Salvar</Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
