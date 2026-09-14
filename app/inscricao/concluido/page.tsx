'use client'

import Cabecalho from '../../components/Cabecalho'
import PageContainer from '../../components/ui/PageContainer'
import Card from '../../components/ui/Card'

export default function Concluido() {
  return (
    <>
      <Cabecalho />

      <PageContainer>
        <div style={{ maxWidth: 520, margin: '0 auto', width: '100%' }}>
          <Card>
            <div style={{ textAlign: 'center' }}>

              <div style={{ fontSize: 56, marginBottom: 16 }}>
                ✅
              </div>

              <h1
                style={{
                  fontFamily: 'var(--fonte-titulo)',
                  fontSize: 28,
                  color: 'var(--branco)',
                  marginBottom: 14,
                }}
              >
                Ficha enviada com sucesso!
              </h1>

              <p
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 1.6,
                  marginBottom: 20,
                }}
              >
                A inscrição do atleta foi recebida pelo Departamento de Captação.
              </p>

              <div
                style={{
                  background: 'rgba(184,150,62,0.12)',
                  border: '1px solid rgba(184,150,62,0.5)',
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 24,
                }}
              >
                <p
                  style={{
                    color: 'var(--dourado-claro)',
                    fontSize: 18,
                    fontWeight: 700,
                    lineHeight: 1.4,
                    margin: '0 0 8px',
                  }}
                >
                  ⚠️ Agora é só aguardar o retorno do clube.
                </p>

                <p
                  style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: 14,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  A equipe responsável irá analisar a ficha e, caso o atleta
                  avance para uma próxima etapa, o clube entrará em contato
                  pelos canais informados no cadastro.
                </p>
              </div>

              <p
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 13,
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                O envio da inscrição não garante a participação em uma
                avaliação.
              </p>

            </div>
          </Card>
        </div>
      </PageContainer>
    </>
  )
}
