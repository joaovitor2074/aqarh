import React, { useEffect, useState } from "react";
import AdminLayout from "../../layout/AdminLayout";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import Input from "../../ui/Input";
import FormGroup from "../../ui/FormGroup";
import { apiRequest } from "../../utils/api";

import toast from 'react-hot-toast'

toast.success('Ação realizada com sucesso')
toast.error('Algo deu errado')
toast.loading('Processando...')

export default function Membros() {
    const [openModal, setOpenModal] = useState(false);
    const [membros, setMembros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);

    const [form, setForm] = useState({
        nome: "",
        funcao: "",
        email: ""
    });

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function carregarMembros() {
        try {
            setLoading(true);
            const data = await apiRequest("/membros");
            setMembros(data);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleAddMembro() {
        try {
            await apiRequest("/membros", {
                method: "POST",
                body: JSON.stringify(form),
            });

            toast.success("Membro cadastrado com sucesso");

            setForm({ nome: "", funcao: "", email: "" });
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
            setMembros(membros.filter(m => m.id !== id));
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


    useEffect(() => {
        carregarMembros();
    }, []);

    return (
        <AdminLayout>
            <div className="space-y-6">

                {/* Cabeçalho */}
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-800">Membros</h2>
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
                                    <th className="pb-3">Função</th>
                                    <th className="pb-3">Email</th>
                                    <th className="pb-3">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {membros.map((membro) => (
                                    <tr key={membro.id} className="border-b last:border-0">
                                        <td className="py-3 font-medium">{membro.nome}</td>
                                        <td className="py-3">{membro.funcao}</td>
                                        <td className="py-3">{membro.email}</td>
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

                        <FormGroup label="Função">
                            <Input name="funcao" value={form.funcao} onChange={handleChange} />
                        </FormGroup>

                        <FormGroup label="Email">
                            <Input name="email" value={form.email} onChange={handleChange} />
                        </FormGroup>

                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => setOpenModal(false)}>Cancelar</Button>
                            <Button onClick={handleAddMembro}>Salvar</Button>
                        </div>
                    </div>
                </Modal>

                {/* Modal Editar */}
                <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar membro">
                    {editing && (
                        <div className="space-y-4">
                            <Input value={editing.nome} onChange={e => setEditing({ ...editing, nome: e.target.value })} />
                            <Input value={editing.funcao} onChange={e => setEditing({ ...editing, funcao: e.target.value })} />
                            <Input value={editing.email} onChange={e => setEditing({ ...editing, email: e.target.value })} />

                            <div className="flex justify-end gap-2">
                                <Button variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button>
                                <Button onClick={saveEdit}>Salvar</Button>
                            </div>
                        </div>
                    )}
                </Modal>

            </div>
        </AdminLayout>
    );
}
