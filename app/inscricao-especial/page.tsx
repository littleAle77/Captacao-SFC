'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import Cabecalho from '../components/Cabecalho'
import PageContainer from '../components/ui/PageContainer'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function InscricaoEspecial() {
  const router = useRouter()

  const [chave, setChave] = useState('')
  const [erro, setErro] = useState('')
  const [verificando, setVerificando] = useState(false)

  async function entrar() {
    if (!chave.trim()) {
      setErro('Digite a chave de acesso.')
      return
    }

    setVerificando(true)
    setErro('')

    const { data, error } = await supabase
      .from('chave_acesso_geral')
      .select('id')
      .eq('chave', chave.trim())
      .eq('ativa', true)
      .eq('destino', 'especial')
      .maybeSingle()

    setVerificando(false)

    if (error || !data) {
      setErro('Chave de acesso inválida.')
      return
    }

    sessionStorage.setItem(
      'chave_especial_valor',
      chave.trim()
    )

    router.push('/inscricao-especial/nascimento')
  }

  return (
    <>
      <Cabecalho />

      <PageContainer>
        <div
          style={{
            maxWidth: 460,
            margin: '0 auto',
            width: '100%',
          }}
        >
          <Card>

            <h1
              style={{
                fontFamily: 'var(--fonte-titulo)',
                fontSize: 30,
                fontWeight: 700,
                color: 'var(--branco)',
                marginBottom: 8,
              }}
            >
              Avaliação com o grupo
            </h1>

            <p
              style={{
                color: 'rgba(255,255,255,0.6)',
                marginBottom: 28,
                lineHeight: 1.5,
              }}
            >
              Para acessar a inscrição da avaliação
              com o grupo, informe a chave de acesso
              fornecida pelo clube.
            </p>

            <label className="field-label">
              Chave de acesso
            </label>

            <input
              type="text"
              value={chave}
              onChange={(e) => {
                setChave(e.target.value)
                setErro('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  entrar()
                }
              }}
              className="field"
              placeholder="Digite sua chave de acesso"
            />

            {erro && (
              <p
                style={{
                  color: '#f87171',
                  marginTop: 8,
                  marginBottom: 16,
                  fontSize: 14,
                }}
              >
                {erro}
              </p>
            )}

            <Button
              onClick={entrar}
              disabled={verificando}
            >
              {verificando
                ? 'VERIFICANDO...'
                : 'ENTRAR'}
            </Button>

            <div
              style={{
                marginTop: 12,
              }}
            >
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
    </>
  )
}