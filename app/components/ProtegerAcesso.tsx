'use client'

import { useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import bcrypt from 'bcryptjs'
import PageContainer from './ui/PageContainer'
import Card from './ui/Card'
import Button from './ui/Button'

const DEZ_MINUTOS = 10 * 60 * 1000

function sessaoValida() {
  const atividade = localStorage.getItem('sessao_atividade')
  if (!atividade) return false
  return Date.now() - Number(atividade) < DEZ_MINUTOS
}

function areasDaSessao(): string[] {
  if (!sessaoValida()) return []
  const areas = localStorage.getItem('sessao_areas')
  return areas ? JSON.parse(areas) : []
}

function registrarAtividade() {
  localStorage.setItem('sessao_atividade', String(Date.now()))
}

export default function ProtegerAcesso({
  area,
  children,
}: {
  area: string
  children: ReactNode
}) {
  const [autorizado, setAutorizado] = useState(false)
  const [verificando, setVerificando] = useState(true)
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [validando, setValidando] = useState(false)

  useEffect(() => {
    setAutorizado(areasDaSessao().includes(area))
    setVerificando(false)
  }, [area])

  useEffect(() => {
    if (!autorizado) return

    registrarAtividade()

    const eventos = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    const marcar = () => registrarAtividade()
    eventos.forEach((ev) => window.addEventListener(ev, marcar))

    const verificador = setInterval(() => {
      if (!sessaoValida()) {
        localStorage.removeItem('sessao_areas')
        localStorage.removeItem('sessao_atividade')
        setAutorizado(false)
      }
    }, 15000)

    return () => {
      eventos.forEach((ev) => window.removeEventListener(ev, marcar))
      clearInterval(verificador)
    }
  }, [autorizado])

  async function entrar() {
    if (!senha) {
      setErro('Digite sua senha.')
      return
    }

    setValidando(true)
    setErro('')

    const { data, error } = await supabase
      .from('acessos')
      .select('areas, senha_hash, ativo')
      .not('senha_hash', 'is', null)

    if (error || !data) {
      setValidando(false)
      setErro('Erro ao verificar acesso. Tente novamente.')
      return
    }

    let encontrado: { areas: string[] } | null = null
    for (const registro of data) {
      if (!registro.ativo) continue
      const confere = await bcrypt.compare(senha, registro.senha_hash as string)
      if (confere) {
        encontrado = registro as { areas: string[] }
        break
      }
    }

    setValidando(false)

    if (!encontrado || !encontrado.areas.includes(area)) {
      setErro('Senha inválida ou sem permissão para esta área.')
      return
    }

    localStorage.setItem('sessao_areas', JSON.stringify(encontrado.areas))
    registrarAtividade()
    setAutorizado(true)
  }

  if (verificando) return null

  if (!autorizado) {
    return (
      <PageContainer>
        <div style={{ maxWidth: 400, margin: '0 auto', width: '100%' }}>
          <Card>
            <h1 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 24, color: 'var(--branco)', marginBottom: 8 }}>
              Acesso restrito
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
              Digite sua senha para acessar este painel.
            </p>

            <label className="field-label">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && entrar()}
              className="field"
            />

            {erro && <p style={{ color: '#f87171', marginBottom: 16, fontSize: 14 }}>{erro}</p>}

            <Button onClick={entrar} disabled={validando}>
              {validando ? 'VERIFICANDO...' : 'ENTRAR'}
            </Button>
          </Card>
        </div>
      </PageContainer>
    )
  }

  return <>{children}</>
}