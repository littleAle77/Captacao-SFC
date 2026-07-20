'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function Boasvindas() {
  const router = useRouter()

  return (
    <main
      className="hero-stripes"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 24,
      }}
    >
      <div className="hero-crest" style={{ marginBottom: 24 }}>
        <Image src="/logo-santos.png" alt="Santos Futebol Clube" width={110} height={110} />
      </div>

      <p
        className="hero-fade-1"
        style={{
          color: 'var(--dourado-claro)',
          fontFamily: 'var(--fonte-titulo)',
          letterSpacing: '0.15em',
          fontSize: 14,
          marginBottom: 12,
        }}
      >
        BEM-VINDO À BASE DO PEIXE
      </p>

      <h1
        className="hero-fade-2"
        style={{
          color: 'var(--branco)',
          fontSize: 'clamp(32px, 6vw, 52px)',
          maxWidth: 640,
          lineHeight: 1.05,
          marginBottom: 16,
        }}
      >
        Seu talento começa aqui
      </h1>

      <p
        className="hero-fade-2"
        style={{
          color: '#c9c9c9',
          fontSize: 16,
          maxWidth: 480,
          marginBottom: 40,
        }}
      >
        Preencha sua inscrição
        para a avaliação e dê o primeiro passo rumo à Vila Belmiro.
      </p>

      <button
        className="hero-fade-3 hero-btn"
        onClick={() => router.push('/inscricao/nascimento')}
        style={{
          padding: '14px 36px',
          fontSize: 16,
          fontFamily: 'var(--fonte-titulo)',
          fontWeight: 700,
          letterSpacing: '0.05em',
          background: 'var(--dourado)',
          color: 'var(--preto-santos)',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        INICIAR INSCRIÇÃO
      </button>

      <p className="hero-fade-3" style={{ marginTop: 24, color: '#777', fontSize: 13 }}>
      </p>
    </main>
  )
}