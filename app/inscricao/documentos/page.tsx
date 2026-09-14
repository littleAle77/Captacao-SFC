'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Cabecalho from '../../components/Cabecalho'
import PageContainer from '../../components/ui/PageContainer'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

type Documento = {
  id: string
  nome: string
  tem_validade: boolean
  dias_validade: number | null
  somente_menor: boolean
  validade_ano_atual: boolean
}

export default function Documentos() {
  const router = useRouter()
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [arquivos, setArquivos] = useState<{ [id: string]: File | null }>({})
  const [datas, setDatas] = useState<{ [id: string]: string }>({})
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const atletaId = sessionStorage.getItem('atleta_id')
    if (!atletaId) {
      router.push('/inscricao/nascimento')
      return
    }
    buscarDocumentos()
  }, [])

  async function buscarDocumentos() {
    const dataNascimento = sessionStorage.getItem('data_nascimento')!
    const nascimento = new Date(dataNascimento)
    const hoje = new Date()
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) idade--
    const menor = idade < 18

    let query = supabase.from('documentos_exigidos').select('*')
    if (!menor) query = query.eq('somente_menor', false)

    const { data, error } = await query
    if (error) {
      setErro('Erro ao carregar documentos.')
      return
    }
    setDocumentos(data || [])
  }

  function selecionarArquivo(docId: string, file: File | null) {
    setArquivos((prev) => ({ ...prev, [docId]: file }))
  }

  function selecionarData(docId: string, data: string) {
    setDatas((prev) => ({ ...prev, [docId]: data }))
  }

  function verificarDocumento(doc: Documento): { valido: boolean; motivo?: string } {
    if (!arquivos[doc.id]) return { valido: false, motivo: `${doc.nome}: não enviado` }

    if (doc.tem_validade) {
      const dataInformada = datas[doc.id]
      if (!dataInformada) return { valido: false, motivo: `${doc.nome}: data de emissão não informada` }

      const emissao = new Date(dataInformada)
      const hoje = new Date()

      if (doc.validade_ano_atual) {
        if (emissao.getFullYear() !== hoje.getFullYear()) {
          return { valido: false, motivo: `${doc.nome}: precisa ser do ano atual` }
        }
      } else if (doc.dias_validade) {
        const expiracao = new Date(emissao)
        expiracao.setDate(expiracao.getDate() + doc.dias_validade)
        if (expiracao < hoje) {
          return { valido: false, motivo: `${doc.nome}: vencido (validade era até ${expiracao.toLocaleDateString('pt-BR')})` }
        }
      }
    }
    return { valido: true }
  }

  async function enviarTudo() {
    setErro('')

    for (const doc of documentos) {
      if (!arquivos[doc.id]) { setErro(`Falta anexar: ${doc.nome}`); return }
      if (doc.tem_validade && !datas[doc.id]) { setErro(`Informe a data de emissão de: ${doc.nome}`); return }
    }

    setEnviando(true)
    const atletaId = sessionStorage.getItem('atleta_id')!

    for (const doc of documentos) {
      const file = arquivos[doc.id]!
      const caminho = `${atletaId}/${doc.id}-${file.name}`

      const { error: erroUpload } = await supabase.storage
        .from('documentos-atletas')
        .upload(caminho, file, { upsert: true })

      if (erroUpload) {
        setErro(`Erro ao enviar ${doc.nome}: ${erroUpload.message}`)
        setEnviando(false)
        return
      }

      const { data: urlData } = supabase.storage.from('documentos-atletas').getPublicUrl(caminho)
      const resultado = verificarDocumento(doc)

      const { error: erroInsert } = await supabase.from('documentos_enviados').insert({
        atleta_id: atletaId,
        documento_exigido_id: doc.id,
        arquivo_url: urlData.publicUrl,
        data_validade: doc.tem_validade ? datas[doc.id] : null,
        status: resultado.valido ? 'valido' : 'vencido',
      })

      if (erroInsert) {
        setErro(`Erro ao registrar ${doc.nome}: ${erroInsert.message}`)
        setEnviando(false)
        return
      }
    }

    setEnviando(false)
    router.push('/inscricao/concluido')
  }

  return (
    <>
      <Cabecalho />
      <PageContainer>
        <div style={{ maxWidth: 560, margin: '0 auto', width: '100%' }}>
          <Card>
            <h1 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 28, color: 'var(--branco)', marginBottom: 8 }}>
              Envio de documentos
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
              Anexe todos os documentos abaixo para concluir sua inscrição.
            </p>

            {documentos.map((doc) => (
              <div
                key={doc.id}
                style={{
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 10,
                  padding: 18,
                  marginBottom: 16,
                }}
              >
                <p style={{ fontWeight: 600, marginBottom: 10, color: 'var(--branco)' }}>{doc.nome}</p>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => selecionarArquivo(doc.id, e.target.files?.[0] || null)}
                  style={{ marginBottom: 10, display: 'block', color: 'rgba(255,255,255,0.75)' }}
                />
                {doc.tem_validade && (
                  <>
                    <label className="field-label">Data de emissão do documento</label>
                    <input
                      type="date"
                      value={datas[doc.id] || ''}
                      onChange={(e) => selecionarData(doc.id, e.target.value)}
                      className="field"
                      style={{ marginBottom: 0, maxWidth: 200 }}
                    />
                  </>
                )}
              </div>
            ))}

            {erro && <p style={{ color: '#f87171', marginBottom: 16, fontSize: 14 }}>{erro}</p>}

            <Button onClick={enviarTudo} disabled={enviando}>
              {enviando ? 'ENVIANDO...' : 'ENVIAR DOCUMENTOS'}
            </Button>
          </Card>
        </div>
      </PageContainer>
    </>
  )
}