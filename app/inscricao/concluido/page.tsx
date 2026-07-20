'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Cabecalho from '../../components/Cabecalho'
import PageContainer from '../../components/ui/PageContainer'
import Card from '../../components/ui/Card'

export default function Concluido() {
  const [carregando, setCarregando] = useState(true)
  const [status, setStatus] = useState<string | null>(null)
  const [pendencias, setPendencias] = useState<string | null>(null)
  const [semana, setSemana] = useState<{ data_inicio: string; data_fim: string } | null>(null)

  useEffect(() => { buscarResultado() }, [])

  async function buscarResultado() {
    const atletaId = sessionStorage.getItem('atleta_id')
    if (!atletaId) { setCarregando(false); return }

    const { data: atleta } = await supabase
      .from('atletas')
      .select('status_triagem, pendencias')
      .eq('id', atletaId)
      .single()

    if (atleta) {
      setStatus(atleta.status_triagem)
      setPendencias(atleta.pendencias)
    }

    const { data: agendamento } = await supabase
      .from('agendamentos')
      .select('semana_avaliacao_id, semanas_avaliacao(data_inicio, data_fim)')
      .eq('atleta_id', atletaId)
      .maybeSingle()

    if (agendamento?.semanas_avaliacao) setSemana(agendamento.semanas_avaliacao as any)
    setCarregando(false)
  }

  function formatarData(data: string) {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  if (carregando) {
    return (
      <>
        <Cabecalho />
        <PageContainer>
          <div style={{ maxWidth: 480, margin: '0 auto', width: '100%', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>Carregando...</p>
          </div>
        </PageContainer>
      </>
    )
  }

  return (
    <>
      <Cabecalho />
      <PageContainer>
        <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              {status === 'apto' && semana ? (
                <>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                  <h1 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 26, color: 'var(--branco)', marginBottom: 8 }}>
                    Inscrição aprovada!
                  </h1>
                  <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
                    Seus documentos foram validados com sucesso. Você está agendado para a semana de avaliação:
                  </p>
                  <div style={{ background: 'rgba(184,150,62,0.1)', border: '1px solid var(--dourado)', borderRadius: 10, padding: 20, marginBottom: 16 }}>
                    <p style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 20, fontWeight: 700, color: 'var(--dourado-claro)' }}>
                      {formatarData(semana.data_inicio)} A {formatarData(semana.data_fim)}
                    </p>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                    Apresente-se na segunda-feira, {formatarData(semana.data_inicio)}, no horário e local combinados pelo clube.
                  </p>
                </>
              ) : status === 'apto' && !semana ? (
                <>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                  <h1 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 26, color: 'var(--branco)', marginBottom: 8 }}>
                    Documentos aprovados!
                  </h1>
                  <p style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Seus documentos foram validados, mas ainda não há vaga disponível em nenhuma semana de avaliação.
                    Em breve entraremos em contato assim que uma vaga abrir.
                  </p>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                  <h1 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 26, color: 'var(--branco)', marginBottom: 8 }}>
                    Pendências na inscrição
                  </h1>
                  <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
                    Alguns documentos precisam de atenção antes de confirmarmos sua vaga:
                  </p>
                  <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(248,113,113,0.4)', borderRadius: 10, padding: 16, textAlign: 'left' }}>
                    {pendencias?.split(' | ').map((p, i) => (
                      <p key={i} style={{ color: '#f87171', fontSize: 14, marginBottom: 4 }}>• {p}</p>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </PageContainer>
    </>
  )
}