'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'
import PageContainer from './components/ui/PageContainer'
import Card from './components/ui/Card'
import Button from './components/ui/Button'
import Cabecalho from './components/Cabecalho'

import {
  Trophy,
  Video,
  FileText,
} from 'lucide-react'

export default function Home() {
  const [temAcessoMercado, setTemAcessoMercado] = useState(false)

  useEffect(() => {
    const areas = localStorage.getItem('sessao_areas')

    if (!areas) return

    try {
      const areasUsuario = JSON.parse(areas)

      if (areasUsuario.includes('mercado')) {
        setTemAcessoMercado(true)
      }
    } catch {
      setTemAcessoMercado(false)
    }
  }, [])

  return (
    <>
      <Cabecalho />
      <PageContainer>

      <section className={styles.hero}>

        <img
          src="/logo-santos.png"
          alt="Santos Futebol Clube"
          className={styles.logo}
        />

        <h1 className={styles.title}>
          Departamento de Captação
        </h1>

        <p className={styles.subtitle}>
          Portal oficial para inscrição em seletivas e envio de
          material para análise do Departamento de Captação.
        </p>

      </section>

    
      <section className={styles.cards}>

        <Card hover>

          <div className={styles.cardContent}>

            <Trophy
              size={56}
              className={styles.icon}
            />

            <h2 className={styles.cardTitle}>
              Inscrição para Avaliação
            </h2>

            <p className={styles.cardText}>
              Faça sua inscrição para avaliação pelo
              Departamento de Captação.
            </p>

            <Button href="/inscricao">
              PARTICIPAR
            </Button>

          </div>

        </Card>

      </section>
      
            {temAcessoMercado && (
        <Card hover>

          <div className={styles.cardContent}>

            <Video
              size={56}
              className={styles.icon}
            />

            <h2 className={styles.cardTitle}>
              Análise de Mercado
            </h2>

            <p className={styles.cardText}>
              Envie o vídeo do atleta para avaliação
              da equipe de captação do clube.
            </p>

            <Button href="/mercado">
              ENVIAR MATERIAL
            </Button>

          </div>

        </Card>
      )}

      <section className={styles.info}>

        <h3>Informações importantes</h3>

        <p>
          • As seletivas seguem o calendário oficial do clube.
        </p>

        <p>
          • O envio de material não garante convocação.
        </p>

      </section>

    </PageContainer>
  </>
  )
}