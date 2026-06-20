// src/pages/admin/EmailMassa.jsx

import React, { useCallback, useEffect, useState } from "react"
import AdminLayout from "../../layout/AdminLayout"
import Card from "../../ui/Card"
import Button from "../../ui/Button"
import Input from "../../ui/Input"
import FormGroup from "../../ui/FormGroup"
import Select from "../../ui/Select"
import { api } from "../../utils/api"
import toast from "react-hot-toast"
import {
  FaEnvelope,
  FaUsers,
  FaPaperPlane,
  FaEye,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUser,
  FaUserGraduate,
  FaHandshake,
} from "react-icons/fa"
import styles from "../../styles/adminPages/emailMassa.module.css"

const FILTROS = [
  { value: "todos", label: "Todos os membros ativos" },
  { value: "pesquisador", label: "Somente pesquisadores" },
  { value: "estudante", label: "Somente estudantes" },
  { value: "colaborador", label: "Somente colaboradores" },
]

function iconeVinculo(tipo) {
  if (tipo === "pesquisador") return <FaUser />
  if (tipo === "estudante") return <FaUserGraduate />
  return <FaHandshake />
}

export default function EmailMassa() {
  const [filtro, setFiltro] = useState("todos")
  const [assunto, setAssunto] = useState("")
  const [corpo, setCorpo] = useState("")
  const [personalizar, setPersonalizar] = useState(true)

  const [destinatarios, setDestinatarios] = useState([])
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState(null) // { enviados, total, falhas }

  const carregarDestinatarios = useCallback(async () => {
    setLoadingPreview(true)
    setResultado(null)
    try {
      const data = await api.get(`/mail/destinatarios?filtro=${filtro}`)
      setDestinatarios(data.destinatarios || [])
    } catch (err) {
      toast.error("Erro ao carregar destinatários")
      setDestinatarios([])
    } finally {
      setLoadingPreview(false)
    }
  }, [filtro])

  useEffect(() => {
    carregarDestinatarios()
  }, [carregarDestinatarios])

  const handleEnviar = async () => {
    if (!assunto.trim()) {
      toast.error("Preencha o assunto do email.")
      return
    }
    if (!corpo.trim()) {
      toast.error("Preencha o corpo do email.")
      return
    }
    if (destinatarios.length === 0) {
      toast.error("Nenhum destinatário encontrado para este filtro.")
      return
    }

    const confirmar = window.confirm(
      `Você está prestes a enviar um email para ${destinatarios.length} pessoa(s).\n\nAssunto: "${assunto}"\n\nDeseja continuar?`
    )
    if (!confirmar) return

    setEnviando(true)
    setResultado(null)

    try {
      const data = await api.post("/mail/enviar-em-massa", {
        assunto,
        corpo,
        filtro,
        personalizar,
      })

      setResultado(data)
      toast.success(data.message)
    } catch (err) {
      toast.error(err.message || "Erro ao enviar emails.")
    } finally {
      setEnviando(false)
    }
  }

  const handleLimpar = () => {
    setAssunto("")
    setCorpo("")
    setResultado(null)
  }

  const semEmail = destinatarios.filter((d) => !d.email).length
  const comEmail = destinatarios.filter((d) => d.email).length

  return (
    <AdminLayout>
      <div className={styles.container}>
        {/* Cabeçalho */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <FaEnvelope className={styles.titleIcon} />
              Envio de Email em Massa
            </h1>
            <p className={styles.subtitle}>
              Envie comunicados para todos os membros cadastrados com email ativo.
            </p>
          </div>
        </div>

        <div className={styles.layout}>
          {/* Coluna esquerda — Formulário */}
          <div className={styles.formCol}>
            <Card className={styles.formCard}>
              <h3 className={styles.cardTitle}>Compor mensagem</h3>

              {/* Filtro de destinatários */}
              <FormGroup label="Destinatários">
                <Select
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  options={FILTROS}
                />
              </FormGroup>

              {/* Assunto */}
              <FormGroup label="Assunto *">
                <Input
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  placeholder="Ex: Reunião do grupo — 25/06"
                  maxLength={150}
                />
                <span className={styles.charCount}>{assunto.length}/150</span>
              </FormGroup>

              {/* Corpo */}
              <FormGroup label="Mensagem *">
                <textarea
                  className={styles.textarea}
                  value={corpo}
                  onChange={(e) => setCorpo(e.target.value)}
                  placeholder={
                    personalizar
                      ? "A saudação (Olá, [Nome]!) será adicionada automaticamente no início.\n\nEscreva seu comunicado aqui..."
                      : "Escreva seu comunicado aqui..."
                  }
                  rows={10}
                />
              </FormGroup>

              {/* Opção de personalização */}
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={personalizar}
                  onChange={(e) => setPersonalizar(e.target.checked)}
                />
                <span>Adicionar saudação personalizada ("Olá, [Nome]!")</span>
              </label>

              {/* Resultado do envio */}
              {resultado && (
                <div className={`${styles.resultado} ${resultado.falhas?.length > 0 ? styles.resultadoAviso : styles.resultadoSucesso}`}>
                  {resultado.falhas?.length === 0 ? (
                    <FaCheckCircle className={styles.resultadoIcon} />
                  ) : (
                    <FaExclamationTriangle className={styles.resultadoIcon} />
                  )}
                  <div>
                    <strong>
                      {resultado.enviados} de {resultado.total} emails enviados
                    </strong>
                    {resultado.falhas?.length > 0 && (
                      <ul className={styles.falhasList}>
                        {resultado.falhas.map((f) => (
                          <li key={f.email}>
                            {f.email} — {f.erro}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className={styles.acoes}>
                <Button variant="outline" onClick={handleLimpar} disabled={enviando}>
                  Limpar
                </Button>
                <Button
                  onClick={handleEnviar}
                  disabled={enviando || destinatarios.length === 0}
                  className={styles.btnEnviar}
                >
                  {enviando ? (
                    <>
                      <FaSpinner className={styles.spinning} />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      Enviar para {destinatarios.length} pessoa(s)
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Coluna direita — Preview de destinatários */}
          <div className={styles.previewCol}>
            <Card className={styles.previewCard}>
              <div className={styles.previewHeader}>
                <h3 className={styles.cardTitle}>
                  <FaEye />
                  Destinatários
                </h3>
                <span className={styles.badge}>
                  <FaUsers />
                  {loadingPreview ? "..." : destinatarios.length}
                </span>
              </div>

              {semEmail > 0 && (
                <div className={styles.aviso}>
                  <FaExclamationTriangle />
                  {semEmail} membro(s) sem email cadastrado foram excluídos da lista.
                </div>
              )}

              {loadingPreview ? (
                <div className={styles.loadingPreview}>
                  <FaSpinner className={styles.spinning} />
                  <span>Carregando...</span>
                </div>
              ) : destinatarios.length === 0 ? (
                <div className={styles.emptyPreview}>
                  <FaUsers />
                  <p>Nenhum membro com email encontrado para este filtro.</p>
                </div>
              ) : (
                <ul className={styles.destinatariosList}>
                  {destinatarios.map((d) => (
                    <li key={d.id} className={styles.destinatarioItem}>
                      <span className={styles.destinatarioIcone}>
                        {iconeVinculo(d.tipo_vinculo)}
                      </span>
                      <div className={styles.destinatarioInfo}>
                        <strong>{d.nome}</strong>
                        <span>{d.email}</span>
                      </div>
                      <span className={`${styles.tag} ${styles[d.tipo_vinculo]}`}>
                        {d.tipo_vinculo}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}