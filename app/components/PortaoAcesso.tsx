'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '../lib/supabase'

const VERIFICA_A_CADA = 60000

export default function PortaoAcesso({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const [liberado, setLiberado] = useState(false)
  const [verificando, setVerificando] = useState(true)
  const [chave, setChave] = useState('')
  const [erro, setErro] = useState('')
  const [validando, setValidando] = useState(false)

  async function buscarChave(valor: string) {
    if (!valor) return null
    const { data } = await supabase
      .from('chave_acesso_geral')
      .select('id, destino')
      .eq('chave', valor)
      .eq('ativa', true)
      .maybeSingle()
    return data
  }

  function redirecionarSeNecessario(destino: string) {
    if (destino === 'especial' && !pathname.startsWith('/inscricao-especial')) {
      router.push('/inscricao-especial/nascimento')
    }
  }

  useEffect(() => {
    async function verificarInicial() {
      const salva = sessionStorage.getItem('chave_geral_valor')
      const registro = salva ? await buscarChave(salva) : null
      if (registro) {
        setLiberado(true)
        redirecionarSeNecessario(registro.destino)
      }
      setVerificando(false)
    }
    verificarInicial()
  }, [])

  useEffect(() => {
    if (!liberado) return
    const intervalo = setInterval(async () => {
      const salva = sessionStorage.getItem('chave_geral_valor')
      const registro = await buscarChave(salva || '')
      if (!registro) {
        sessionStorage.removeItem('chave_geral_valor')
        setLiberado(false)
      }
    }, VERIFICA_A_CADA)
    return () => clearInterval(intervalo)
  }, [liberado])

  async function entrar() {
    if (!chave) { setErro('Digite a chave de acesso.'); return }
    setValidando(true)
    setErro('')
    const registro = await buscarChave(chave.trim())
    setValidando(false)
    if (!registro) { setErro('Chave de acesso inválida.'); return }
    sessionStorage.setItem('chave_geral_valor', chave.trim())
    setLiberado(true)
    redirecionarSeNecessario(registro.destino)
  }

  if (verificando) return null

  if (!liberado) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #0a0a0a 0%, #1c1c1e 100%)',
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 380,
            width: '100%',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: 32,
            backdropFilter: 'blur(12px)',
          }}
        >
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, color: '#fff', marginBottom: 8 }}>
            Acesso restrito
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 20, fontSize: 14 }}>
            Este site está disponível apenas para convidados. Digite a chave de acesso fornecida pelo clube.
          </p>
          <input
            type="text"
            value={chave}
            onChange={(e) => setChave(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && entrar()}
            className="field"
            placeholder="Chave de acesso"
          />
          {erro && <p style={{ color: '#f87171', marginBottom: 12, fontSize: 14 }}>{erro}</p>}
          <button onClick={entrar} disabled={validando} className="btn-primary">
            {validando ? 'VERIFICANDO...' : 'ENTRAR'}
          </button>
        </div>
      </main>
    )
  }

  return <>{children}</>
}