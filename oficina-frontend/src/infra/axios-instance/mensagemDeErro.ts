import axios from 'axios'

// Transforma qualquer erro do axios na frase que a API mandou ({ type, message })
export const mensagemDeErro = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Sem conexão com o servidor'
    const mensagem = (error.response.data as { message?: string } | undefined)?.message
    if (mensagem) return mensagem
  }
  return 'Algo deu errado. Tente novamente.'
}
