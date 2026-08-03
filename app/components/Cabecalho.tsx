'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Cabecalho() {
  const [areas, setAreas] = useState<string[]>([])

  useEffect(() => {
    const salvo = localStorage.getItem('sessao_areas')
    if (salvo) setAreas(JSON.parse(salvo))
  }, [])

  function sair() {
    localStorage.removeItem('sessao_areas')
    localStorage.removeItem('sessao_atividade')
    setAreas([])
    window.location.href = '/'
  }

  const linkStyle = {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    fontFamily: 'var(--fonte-titulo)',
    letterSpacing: '0.03em',
    textDecoration: 'none',
  }

  return (
    <header
      style={{
        background: 'var(--preto-santos)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '4px solid var(--dourado)',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
        <Image src="/logo-santos.png" alt="Santos Futebol Clube" width={44} height={44} />
        <div>
          <p style={{ fontFamily: 'var(--fonte-titulo)', color: 'var(--branco)', fontSize: 20, fontWeight: 700, letterSpacing: '0.04em', lineHeight: 1 }}>
            SANTOS F.C.
          </p>
          <p style={{ color: 'var(--dourado-claro)', fontSize: 12, letterSpacing: '0.08em' }}>
            AVALIAÇÃO DE ATLETAS
          </p>
        </div>
      </Link>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {areas.length > 0 ? (
          <>
            {areas.includes('seletiva') && <Link href="/admin" style={linkStyle}>PAINEL SELETIVA</Link>}
            {areas.includes('mercado') && <Link href="/admin/mercado" style={linkStyle}>PAINEL MERCADO</Link>}
            {areas.includes('chaves') && <Link href="/gerenciar-chave" style={linkStyle}>CHAVES DE ACESSO</Link>}
            {areas.includes('especial') && <Link href="/admin/especial" style={linkStyle}>AVALIAÇÃO C/ GRUPO</Link>}
            <Link href="/trocar-senha" style={linkStyle}>TROCAR SENHA</Link>
            <button
              onClick={sair}
              style={{ ...linkStyle, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              SAIR
            </button>
          </>
        ) : (
          <Link href="/entrar" style={{ ...linkStyle, opacity: 0.5, fontSize: 12 }}>
            FAZER LOGIN
          </Link>
        )}
      </nav>
    </header>
  )
}