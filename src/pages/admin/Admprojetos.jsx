import React, { use } from 'react'
import AdminLayout from "../../layout/AdminLayout";
import Button from '../../ui/Button';
import Card from '../../ui/Card';
import Modal from '../../ui/Modal';
import { useState,useEffect } from 'react';


import toast from 'react-hot-toast'

// toast.success('Ação realizada com sucesso')
// toast.error('Algo deu errado')
// toast.loading('Processando...')

export default function Admprojetos() {
    const [openModal, setOpenModal] = useState(false);
    const [Projetos, setProjetos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);



    async function carregarProjetos(){
        try {
            setLoading(true);
            const data = await apiRequest("/projetos");
            setProjetos(data);
            toast.success("Projetos carregados com sucesso");
        } catch (error) {
            toast.error(error.message || "Erro ao carregar projetos");
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        carregarProjetos();
    }, []);


    return (
        <AdminLayout>
            <div className={`projetocabecalho `}>
                <h1>Administração de Projetos</h1>
                <Button>Cadastrar Novo Projeto</Button>
            </div>

            <div>
                <Card>
                    <h2>Projeto Exemplo 1</h2>
                    <p>Descrição do projeto exemplo 1.</p>
                    <Button>Editar</Button>
                    <Button variant="danger">Excluir</Button>
                </Card>
                <Card>
                    <h2>Projeto Exemplo 1</h2>
                    <p>Descrição do projeto exemplo 1.</p>
                    <Button>Editar</Button>
                    <Button variant="danger">Excluir</Button>
                </Card>
            </div>

        </AdminLayout>
    )
}