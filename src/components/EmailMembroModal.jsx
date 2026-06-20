// src/components/EmailMembroModal.jsx
// Modal para enviar email para um membro específico.
// Usado na página Membros.jsx no botão de envelope de cada linha.

import React, { useState } from "react"
import Modal from "../ui/Modal"
import Button from "../ui/Button"
import Input from "../ui/Input"
import FormGroup from "../ui/FormGroup"
import { api } from "../utils/api"
import toast from "react-hot-toast"
import { FaPaperPlane, FaSpinner, FaEnvelope } from "react-icons/fa"
import styles from "../styles/components/emailMembroModal.module.css"

/**
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - membro: { id, nome, email }
 */
export default function EmailMembroModal({ isOpen, onClose, membro }) {
  const [assunto, setAssunto] = useState("")
  const [corpo, setCorpo] = useState("")
  const [enviando, setEnviando] = useState(false)

  const handleEnviar = async (e) => {
    e.preventDefault()

    if (!assunto.trim()) {
      toast.error("Preencha o assunto.")
      return
    }
    if (!corpo.trim()) {
      toast.error("Preencha a mensagem.")
      return
    }

    setEnviando(true)
    try {
      const data = await api.post("/mail/enviar-individual", {
        membroId: membro.id,
        assunto,
        corpo,
      })
      toast.success(data.message || "Email enviado com sucesso!")
      setAssunto("")
      setCorpo("")
      onClose()
    } catch (err) {
      toast.error(err.message || "Erro ao enviar email.")
    } finally {
      setEnviando(false)
    }
  }

  const handleClose = () => {
    if (!enviando) {
      setAssunto("")
      setCorpo("")
      onClose()
    }
  }

  if (!membro) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <span className={styles.modalTitle}>
          <FaEnvelope />
          Enviar email para {membro.nome}
        </span>
      }
      size="md"
    >
      {!membro.email ? (
        <div className={styles.semEmail}>
          <FaEnvelope className={styles.semEmailIcon} />
          <p>Este membro não possui email cadastrado.</p>
          <p className={styles.semEmailDica}>
            Edite o cadastro do membro e adicione um endereço de email para poder enviar mensagens.
          </p>
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
        </div>
      ) : (
        <form onSubmit={handleEnviar} className={styles.form}>
          {/* Destinatário (somente leitura) */}
          <div className={styles.destinatario}>
            <span className={styles.destinatarioLabel}>Para:</span>
            <span className={styles.destinatarioInfo}>
              <strong>{membro.nome}</strong>
              <span>{membro.email}</span>
            </span>
          </div>

          <FormGroup label="Assunto *">
            <Input
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              placeholder="Assunto do email"
              maxLength={150}
              required
            />
          </FormGroup>

          <FormGroup label="Mensagem *">
            <textarea
              className={styles.textarea}
              value={corpo}
              onChange={(e) => setCorpo(e.target.value)}
              placeholder={`A saudação "Olá, ${membro.nome.split(" ")[0]}!" será adicionada automaticamente.\n\nEscreva sua mensagem aqui...`}
              rows={7}
              required
            />
          </FormGroup>

          <div className={styles.acoes}>
            <Button variant="outline" type="button" onClick={handleClose} disabled={enviando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={enviando}>
              {enviando ? (
                <>
                  <FaSpinner className={styles.spinning} />
                  Enviando...
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  Enviar email
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}