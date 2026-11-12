import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useOrdensService } from '../../../../../../use-cases/ordens'
import { Aviso, Carregando } from '../../../../../components'
import { EditorOrdem } from './EditorOrdem'

export const DetalheOrdem = () => {
  const { IdOrdemServico } = useParams<{ IdOrdemServico: string }>()
  const { ordemAtual, carregarOrdem } = useOrdensService()
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!IdOrdemServico) return
    carregarOrdem(IdOrdemServico).then((r) => setErro(r.ok ? null : r.mensagem))
    // de propósito só depende da URL: carregarOrdem muda de identidade a cada OS carregada
  }, [IdOrdemServico])

  if (erro) return <Aviso>{erro}</Aviso>
  if (!ordemAtual || ordemAtual._id !== IdOrdemServico) return <Carregando />

  // key: quando a OS muda no servidor o editor recomeça com os dados novos
  return <EditorOrdem key={ordemAtual.updatedAt} ordem={ordemAtual} />
}
