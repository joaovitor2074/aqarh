import AdminLayout from '../../layout/AdminLayout'
import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../../ui/Button'
import Card from '../../ui/Card'
import { FaPen, FaTrash } from 'react-icons/fa'
import styles from '../../styles/adminPages/comunicados.module.css'
import Modal from '../../ui/Modal'
import FormGroup from '../../ui/FormGroup'
import Input from '../../ui/Input'
import { useState, useEffect } from 'react'

export default function Comunicados() {
    const [openModal, setOpenModal] = useState(false);
    const [form, setForm] = useState({
        titulo: "",
        descricao: "",
       data: "",
    });
    return (
        <AdminLayout>
            < div className="flex justify-between items-center mb-6 mt-10">
                <h1 className={`${styles.tituloCom} text-4xl font-black`}>Comunicados</h1>
                <Button
                    onClick={() => setOpenModal(true)}
                    className={`btn my-5 ${styles.novoComBtn}`}
                >
                    Novo Comunicado
                </Button>
            </div>

            <Card>
                <table className="table-auto w-full">
                    <thead>
                        <tr>
                            <th className={`px-4 py-2 text-left`}>Título</th>
                            <th className="px-4 py-2 text-left">Descrição</th>
                            <th className="px-4 py-2 text-left">Data</th>
                            <th className="px-4 py-2 text-left">Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {[1, 2, 3].map((_, index) => (
                            <tr key={index} className={styles.row}>
                                <th className={styles.titulo}>JV</th>
                                <th className={styles.descricao}>Perdido</th>
                                <th className={styles.data}>24/12/25</th>
                                <th className={styles.acoes}>
                                    <Button className={styles.editarBtn}>
                                        <FaPen />
                                    </Button>
                                    <Button
                                        variant="danger"
                                        className={styles.deleteBtn}
                                    >
                                        <FaTrash />
                                    </Button>
                                </th>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>


            {/* Modal Novo */}
            <Modal isOpen={openModal} onClose={() => setOpenModal(false)} title="Novo Comunicado">
                <div className="space-y-4">
                    <FormGroup label="titulo">
                        <Input name="titulo" value={form.titulo} onChange="" />
                    </FormGroup>

                    <FormGroup label="Descricao">
                        <Input name="descricao" value={form.descricao} onChange="" />
                    </FormGroup>

                    <FormGroup label="Data">
                        <Input name="data" value={form.data} onChange="" />
                    </FormGroup>

                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setOpenModal(false)}>Cancelar</Button>
                        <Button onClick="">Salvar</Button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    )
}
