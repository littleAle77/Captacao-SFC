'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import PageContainer from './ui/PageContainer'
import Card from './ui/Card'
import Button from './ui/Button'

export default function ProtegerMercado({
  children,
}: {
  children: ReactNode
}) {
  const router = useRouter()

  const [autorizado, setAutorizado] = useState(false)
  const [verificando, setVerificando] = useState(true)
  const [chave, setChave] = useState('')
  const [erro, setErro] = useState('')
  const [validando, setValidando] = useState(false)

  useEffect(() => {
    const chaveSalva = sessionStorage.getItem('chave_mercado')

    if (chaveSalva) {
      verificarChaveSalva(chaveSalva)
    } else {
      setVerificando(false)
    }
  }, [])

  async function verificarChaveSalva(valor: string) {
    const { data } = await supabase
      .from('chave_acesso_geral')
      .select('chave, destino, ativa')
      .eq('chave', valor)
      .eq('destino', 'mercado')
      .eq('ativa', true)
      .maybeSingle()

    if (data) {
      setAutorizado(true)
    } else {
      sessionStorage.removeItem('chave_mercado')
      setAutorizado(false)
    }

    setVerificando(false)
  }

  async function entrar() {
    if (!chave.trim()) {
      setErro('Digite a chave de acesso.')
      return
    }

    setValidando(true)
    setErro('')

    const { data, error } = await supabase
      .from('chave_acesso_geral')
      .select('chave, destino, ativa')
      .eq('chave', chave.trim())
      .eq('ativa', true)
      .maybeSingle()

    setValidando(false)

    if (error) {
      console.error(error)
      setErro('Erro ao verificar a chave. Tente novamente.')
      return
    }

    if (!data) {
      setErro('Chave de acesso inválida.')
      return
    }

    if (data.destino !== 'mercado') {
      setErro('Esta chave não possui acesso à Análise de Mercado.')
      return
    }

    sessionStorage.setItem('chave_mercado', chave.trim())
    setAutorizado(true)
  }

  if (verificando) {
    return null
  }

  if (autorizado) {
    return <>{children}</>
  }

  return (
    <PageContainer>
      <div
        style={{
          maxWidth: 400,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <Card>
          <h1
            style={{
              fontFamily: 'var(--fonte-titulo)',
              fontSize: 24,
              color: 'var(--branco)',
              marginBottom: 8,
            }}
          >
            Acesso restrito
          </h1>

          <p
            style={{
              color: 'rgba(255,255,255,0.6)',
              marginBottom: 24,
            }}
          >
            Digite a chave de acesso para acessar a Análise de Mercado.
          </p>

          <label className="field-label">
            Chave de acesso
          </label>

          <input
            type="text"
            value={chave}
            onChange={(e) => setChave(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') entrar()
            }}
            className="field"
            placeholder="Digite sua chave"
          />

          {erro && (
            <p
              style={{
                color: '#f87171',
                marginBottom: 16,
                fontSize: 14,
              }}
            >
              {erro}
            </p>
          )}

          <Button
            onClick={entrar}
            disabled={validando}
          >
            {validando ? 'VERIFICANDO...' : 'ENTRAR'}
          </Button>

          <div style={{ marginTop: 12 }}>
  <Button
    variant="outline"
    onClick={() => router.push('/')}
  >
    VOLTAR
  </Button>
</div>
        </Card>
      </div>
    </PageContainer>
  )
}