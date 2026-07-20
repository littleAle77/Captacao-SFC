'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Cabecalho from '../../components/Cabecalho'
import PageContainer from '../../components/ui/PageContainer'
import Card from '../../components/ui/Card'

export default function ConcluidoEspecial() {
  const [carregando, setCarregando] = useState(true)
  const [status, setStatus] = useState<string | null>(null)
  const [pendencias, setPendencias] = useState<string | null>(null)

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
    setCarregando(false)
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
              {status === 'apto' ? (
                <>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                  <h1 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 26, color: 'var(--branco)', marginBottom: 8 }}>
                    Inscrição aprovada!
                  </h1>
                  <p style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Seus documentos foram validados com sucesso. O clube entrará em contato
                    diretamente com você para os próximos passos.
                  </p>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                  <h1 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 26, color: 'var(--branco)', marginBottom: 8 }}>
                    Pendências na inscrição
                  </h1>
                  <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
                    Alguns documentos precisam de atenção:
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