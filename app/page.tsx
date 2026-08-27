'use client'

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
              Participar da Seletiva
            </h2>

            <p className={styles.cardText}>
              Processo destinado aos atletas que estão
              dentro da faixa etária das seletivas abertas.
            </p>

            <Button href="/inscricao">
              PARTICIPAR
            </Button>

          </div>

        </Card>

        <Card hover>

        <div className={styles.cardContent}>

          <FileText
            size={56}
            className={styles.icon}
          />

          <h2 className={styles.cardTitle}>
            Inscrição para Avaliação com o Grupo 
          </h2>

          <p className={styles.cardText}>
            Destinado aos atletas indicados a 
            realizar avaliação com o grupo.
          </p>

          <Button href="/inscricao-especial">
            ACESSAR
          </Button>

          </div>

          </Card>

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

      </section>

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