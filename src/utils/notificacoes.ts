
export type PesquisadorNormalizado = {
  nome: string
  espelhoUrl: string
  linhas_pesquisa: {
    linha_pesquisa: string
  }[]
}

export type StatusNotificacao = "pendente" | "aprovado" | "rejeitado"

export type NotificacaoScraping = {
  id: string
  tipo: "NOVO_PESQUISADOR"
  status: StatusNotificacao
  criado_em: Date
  avaliado_em?: Date
  avaliado_por?: string
  dados: PesquisadorNormalizado
}

export type AcaoNotificacao = "APROVAR" | "REJEITAR"

export type ProcessarNotificacaoDTO = {
  notificacaoId: string
  acao: AcaoNotificacao
  adminId: string
}

export type ProcessarNotificacaoResponse = {
  sucesso: boolean
  status_final: StatusNotificacao
  mensagem: string
}

export async function processarNotificacao(
  payload: ProcessarNotificacaoDTO
): Promise<ProcessarNotificacaoResponse> {
  // validação + lógica aqui
  return {
    sucesso: true,
    status_final: "aprovado",
    mensagem: "Pesquisador aprovado com sucesso",
  }
}
