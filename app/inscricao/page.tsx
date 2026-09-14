'use client'

import Cabecalho from '../components/Cabecalho'
import PageContainer from '../components/ui/PageContainer'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useState } from 'react'
import ProtegerInscricao from '../components/ProtegerSeletiva'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

function InscricaoConteudo() {
  const [dataNascimento, setDataNascimento] = useState('')
  const [erro, setErro] = useState('')
  const [sugerirMercado, setSugerirMercado] = useState(false)

  const [chave, setChave] = useState('')
  const [pedindoChave, setPedindoChave] = useState(false)
  const [erroChave, setErroChave] = useState('')
  const [verificandoChave, setVerificandoChave] = useState(false)

  const router = useRouter()

  function calcularCategoria(data: string) {
    const anoNascimento = new Date(data).getFullYear()
    const anoAtual = new Date().getFullYear()
    return anoAtual - anoNascimento
  }

  function calcularIdade(data: string) {
    const nascimento = new Date(data)
    const hoje = new Date()

    let idade = hoje.getFullYear() - nascimento.getFullYear()

    const mes = hoje.getMonth() - nascimento.getMonth()

    if (
      mes < 0 ||
      (mes === 0 && hoje.getDate() < nascimento.getDate())
    ) {
      idade--
    }

    return idade
  }

  async function validarChaveSeletiva() {
    if (!chave.trim()) {
      setErroChave(
        'Digite a chave de acesso.'
      )
      return
    }

    setVerificandoChave(true)
    setErroChave('')

    const { data, error } = await supabase
      .from('chave_acesso_geral')
      .select('id')
      .eq('chave', chave.trim())
      .eq('ativa', true)
      .eq('destino', 'seletiva')
      .maybeSingle()

    setVerificandoChave(false)

    if (error || !data) {
      setErroChave(
        'Chave de acesso inválida.'
      )
      return
    }

    sessionStorage.setItem(
      'data_nascimento',
      dataNascimento
    )

    const idade =
      calcularIdade(dataNascimento)

    if (idade < 18) {
      router.push(
        '/inscricao/menor-de-idade'
      )
    } else {
      router.push(
        '/inscricao/dados'
      )
    }
  }

  function continuar() {
    if (!dataNascimento) {
      setErro(
        'Por favor, informe a data de nascimento.'
      )
      setSugerirMercado(false)
      return
    }

    const categoria =
      calcularCategoria(dataNascimento)

    if (categoria < 7) {
      setErro(
        'No momento, o clube não possui categoria disponível para atletas com menos de 7 anos.'
      )
      setSugerirMercado(false)
      return
    }

    if (categoria > 16) {
      setErro(
        'Avaliamos presencialmente apenas atletas das categorias Sub-7 a Sub-16. ' +
        'Para a sua categoria, o caminho indicado é o envio de material para a Análise de Mercado.'
      )

      setSugerirMercado(true)

      return
    }

    setErro('')
    setSugerirMercado(false)
    setPedindoChave(true)
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
                fontFamily:
                  'var(--fonte-titulo)',
                fontSize: 30,
                fontWeight: 700,
                color: 'var(--branco)',
                marginBottom: 8,
              }}
            >
              Inscrição para avaliação
            </h1>

            <p
              style={{
                color:
                  'rgba(255,255,255,0.6)',
                marginBottom: 28,
                lineHeight: 1.5,
              }}
            >
              Para começar, informe a data
              de nascimento do atleta.
            </p>

            <label className="field-label">
              Data de nascimento
            </label>

            <input
              type="date"
              value={dataNascimento}
              onChange={(e) =>
                setDataNascimento(
                  e.target.value
                )
              }
              className="field"
            />

            {erro && (
              <p
                style={{
                  color: '#f87171',
                  marginBottom: 16,
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                {erro}
              </p>
            )}

            {sugerirMercado && (
              <div
                style={{
                  marginBottom: 12,
                }}
              >
                <Button
                  onClick={() =>
                    router.push('/mercado')
                  }
                >
                  IR PARA ANÁLISE DE MERCADO
                </Button>
              </div>
            )}

            {!pedindoChave && (
              <Button
                onClick={continuar}
                variant={
                  sugerirMercado
                    ? 'outline'
                    : 'primary'
                }
              >
                CONTINUAR
              </Button>
            )}

            {pedindoChave && (
              <div
                style={{
                  marginTop: 20,
                  paddingTop: 20,
                  borderTop:
                    '1px solid rgba(255,255,255,0.1)',
                }}
              >

                <label className="field-label">
                  Chave de acesso da Seletiva
                </label>

                <input
                  type="text"
                  placeholder="Digite sua chave de acesso"
                  value={chave}
                  onChange={(e) => {
                    setChave(e.target.value)
                    setErroChave('')
                  }}
                  className="field"
                />

                {erroChave && (
                  <p
                    style={{
                      color: '#f87171',
                      marginTop: 8,
                      marginBottom: 12,
                      fontSize: 14,
                    }}
                  >
                    {erroChave}
                  </p>
                )}

                <Button
                  onClick={
                    validarChaveSeletiva
                  }
                  disabled={
                    verificandoChave
                  }
                >
                  {verificandoChave
                    ? 'VERIFICANDO...'
                    : 'ENTRAR NA SELETIVA'}
                </Button>

                <div
                  style={{
                    marginTop: 12,
                  }}
                >
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPedindoChave(false)
                      setChave('')
                      setErroChave('')
                    }}
                  >
                    VOLTAR
                  </Button>
                </div>

              </div>
            )}

          </Card>

        </div>

      </PageContainer>
    </>
  )
}

export default function Inscricao() {
  return (
    <ProtegerInscricao>
      <InscricaoConteudo />
    </ProtegerInscricao>
  )
}