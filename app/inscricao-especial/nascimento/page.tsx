'use client'
import Cabecalho from '../../components/Cabecalho'
import PageContainer from '../../components/ui/PageContainer'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function InscricaoEspecialNascimento() {
  const [dataNascimento, setDataNascimento] = useState('')
  const [erro, setErro] = useState('')
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

  function continuar() {
    if (!dataNascimento) { setErro('Por favor, informe a data de nascimento.'); return }

    const categoria = calcularCategoria(dataNascimento)
    if (categoria < 7 || categoria > 20) {
      setErro('Esta inscrição está disponível apenas para as categorias Sub-7 a Sub-20.')
      return
    }

    sessionStorage.setItem('data_nascimento', dataNascimento)
    sessionStorage.setItem('tipo_inscricao', 'especial')

    const idade = calcularIdade(dataNascimento)
    if (idade < 18) {
      router.push('/inscricao-especial/menor-de-idade')
    } else {
      router.push('/inscricao-especial/dados')
    }
  }

  return (
    <>
      <Cabecalho />
      <PageContainer>
        <div style={{ maxWidth: 460, margin: '0 auto', width: '100%' }}>
          <Card>
            <h1 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 30, color: 'var(--branco)', marginBottom: 8 }}>
              Inscrição - Avaliação com o Grupo
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 28 }}>
              Para começar, informe a data de nascimento do atleta.
            </p>

            <label className="field-label">Data de nascimento</label>
            <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className="field" />

            {erro && <p style={{ color: '#f87171', marginBottom: 16, fontSize: 14 }}>{erro}</p>}

            <Button onClick={continuar}>CONTINUAR</Button>
          </Card>
        </div>
      </PageContainer>
    </>
  )
}