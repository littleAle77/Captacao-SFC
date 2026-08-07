'use client'
import Cabecalho from '../components/Cabecalho'
import PageContainer from '../components/ui/PageContainer'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function Inscricao() {
  const [dataNascimento, setDataNascimento] = useState('')
  const [erro, setErro] = useState('')
  const [sugerirMercado, setSugerirMercado] = useState(false)
  const [verificando, setVerificando] = useState(false)
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
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) idade--
    return idade
  }

  async function existeVagaParaCategoria(categoria: number): Promise<boolean> {
    const hoje = new Date().toISOString().split('T')[0]

    const { data: semanas, error: erroSemanas } = await supabase
      .from('semanas_avaliacao')
      .select('*')
      .lte('categoria_min', categoria)
      .gte('categoria_max', categoria)
      .gte('data_inicio', hoje)
      .order('data_inicio', { ascending: true })

    if (erroSemanas || !semanas || semanas.length === 0) {
      return false
    }

    for (const semana of semanas) {
      const { count } = await supabase
        .from('agendamentos')
        .select('*', { count: 'exact', head: true })
        .eq('semana_avaliacao_id', semana.id)

      if ((count || 0) < semana.vagas_totais) {
        return true
      }
    }

    return false
  }

  async function continuar() {
    if (!dataNascimento) {
      setErro('Por favor, informe a data de nascimento.')
      setSugerirMercado(false)
      return
    }

    const categoria = calcularCategoria(dataNascimento)

    if (categoria < 7) {
      setErro('No momento, o clube não possui categoria disponível para atletas com menos de 7 anos.')
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
    setVerificando(true)

    const temVaga = await existeVagaParaCategoria(categoria)

    setVerificando(false)

    if (!temVaga) {
      setErro(
        `No momento não há datas disponíveis para a categoria Sub-${categoria}. ` +
        'Todas as vagas para essa categoria já foram preenchidas nas próximas semanas de avaliação. ' +
        'Por favor, tente novamente mais tarde, quando novas datas forem abertas.'
      )
      return
    }

    sessionStorage.setItem('data_nascimento', dataNascimento)

    const idade = calcularIdade(dataNascimento)
    if (idade < 18) {
      router.push('/inscricao/menor-de-idade')
    } else {
      router.push('/inscricao/dados')
    }
  }


  return (
    <>
      <Cabecalho />
      <PageContainer>
        <div style={{ maxWidth: 460, margin: '0 auto', width: '100%' }}>
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
              Inscrição para avaliação
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 28, lineHeight: 1.5 }}>
              Para começar, informe a data de nascimento do atleta.
            </p>

            <label className="field-label">Data de nascimento</label>
            <input
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              className="field"
            />

            {erro && (
              <p style={{ color: '#f87171', marginBottom: 16, fontSize: 14, lineHeight: 1.5 }}>
                {erro}
              </p>
            )}

            {sugerirMercado && (
              <div style={{ marginBottom: 12 }}>
                <Button onClick={() => router.push('/mercado')}>
                  IR PARA ANÁLISE DE MERCADO
                </Button>
              </div>
            )}

            <Button
              onClick={continuar}
              variant={sugerirMercado ? 'outline' : 'primary'}
              disabled={verificando}
            >
              {verificando ? 'VERIFICANDO DISPONIBILIDADE...' : 'CONTINUAR'}
            </Button>
          </Card>
        </div>
      </PageContainer>
    </>
  )
}