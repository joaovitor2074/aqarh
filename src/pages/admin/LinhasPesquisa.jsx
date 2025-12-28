import React, { useEffect, useState } from "react";
import AdminLayout from "../../layout/AdminLayout";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import { apiRequest } from "../../utils/api";
import toast from "react-hot-toast";

export default function LinhasPesquisas() {
  const [linhas, setLinhas] = useState([]);
  const [loading, setLoading] = useState(true);

  async function carregarLinhasPesquisa() {
    try {
      setLoading(true);

      const data = await apiRequest("/linhas-pesquisa");

      console.log("📦 Dados recebidos da API /linhas-pesquisa:", data);

      setLinhas(data);
    } catch (error) {
      console.error("❌ Erro ao carregar linhas de pesquisa:", error);
      toast.error(error.message || "Erro ao carregar linhas de pesquisa");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarLinhasPesquisa();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">
          Linhas de Pesquisa – Área Administrativa
        </h1>

        <Card>
          {loading ? (
            <p>Carregando...</p>
          ) : linhas.length === 0 ? (
            <p>Nenhuma linha de pesquisa cadastrada.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2">Nome</th>
                  <th className="pb-2">Pesquisadores</th>
                  <th className="pb-2">Grupo</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((linha) => (
                  <tr key={linha.id} className="border-b last:border-0">
                    <td className="py-2">{linha.nome}</td>
                    <td className="py-2">{linha.pesquisadores || "-"}</td>
                    <td className="py-2">{linha.grupo || "-"}</td>
                    <td className="py-2">
                      {linha.ativo ? "Ativo" : "Inativo"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
