'use client'

import { useRouter } from 'next/navigation'
import Cabecalho from '../../components/Cabecalho'
import PageContainer from '../../components/ui/PageContainer'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

export default function MenorDeIdadeEspecial() {
  const router = useRouter()
  const linkModelo = 'https://rhvtkntqdglrlmlwgqjd.supabase.co/storage/v1/object/public/documentos-modelo/Termo%20de%20Responsabilidade%20Menor%20de%20Idade%20-%20Santos%20Futebol%20Clube%20v2.pdf'

  return (
    <>
      <Cabecalho />
      <PageContainer>
        <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
          <Card>
            <h1 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 26, color: 'var(--branco)', marginBottom: 8 }}>
              Atenção: atleta menor de idade
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 20, lineHeight: 1.5 }}>
              Como o atleta é menor de 18 anos, é necessário um documento adicional
              de autorização assinado pelo responsável.
            </p>

            <a
              href={linkModelo}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '12px 20px',
                background: 'var(--dourado)',
                color: 'var(--preto-santos)',
                fontFamily: 'var(--fonte-titulo)',
                fontWeight: 700,
                letterSpacing: '0.03em',
                borderRadius: 8,
                textDecoration: 'none',
                marginBottom: 24,
              }}
            >
              📄 BAIXAR MODELO DO DOCUMENTO
            </a>

            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24, lineHeight: 1.5 }}>
              Baixe, preencha e assine o documento. Você vai anexá-lo junto com os
              outros documentos na próxima etapa.
            </p>

            <Button onClick={() => router.push('/inscricao-especial/dados')}>
              JÁ TENHO O DOCUMENTO, CONTINUAR
            </Button>
          </Card>
        </div>
      </PageContainer>
    </>
  )
}