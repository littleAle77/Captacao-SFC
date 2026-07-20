'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import ProtegerAcesso from '../../../components/ProtegerAcesso'
import Cabecalho from '../../../components/Cabecalho'
import PageContainer from '../../../components/ui/PageContainer'
import Card from '../../../components/ui/Card'

// TODO: substituir por a lista real assim que ela for definida
const CARACTERISTICAS = ['A definir']
const CLASSIFICACOES = ['A definir']

type Envio = {
  id: string
  nome: string
  data_nascimento: string
  posicao: string
  posicao_secundaria: string
  clube_atual: string | null
  contato: string
  link_video: string
  estatura: number
  pe_dominante: string
  jogos_selecao: boolean
  jogos_profissional: boolean
  link_ogol: string
  caracteristica: string | null
  classificacao: string | null
  criado_em: string
}

function FichaMercadoConteudo() {
  const { id } = useParams()
  const router = useRouter()

  const [envio, setEnvio] = useState<Envio | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => { carregar() }, [id])

  async function carregar() {
    const { data } = await supabase.from('captacao_mercado').select('*').eq('id', id).single()
    setEnvio(data)
    setCarregando(false)
  }

  async function salvarCampo(campo: 'caracteristica' | 'classificacao', valor: string) {
    if (!envio) return
    setSalvando(true)
    const { error } = await supabase.from('captacao_mercado').update({ [campo]: valor }).eq('id', envio.id)
    setSalvando(false)
    if (!error) setEnvio({ ...envio, [campo]: valor })
  }

  function calcularIdade(dataNascimento: string) {
    const nascimento = new Date(dataNascimento)
    const hoje = new Date()
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) idade--
    return idade
  }

  function formatarData(data: string) {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')
  }

  function Campo({ label, valor }: { label: string; valor: string | number | null }) {
    return (
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          {label}
        </p>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', fontSize: 15, color: valor ? 'var(--branco)' : 'rgba(255,255,255,0.4)' }}>
          {valor ?? '—'}
        </div>
      </div>
    )
  }

  function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
    return (
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 13, letterSpacing: '0.05em', color: 'var(--dourado-claro)', marginBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>
          {titulo.toUpperCase()}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          {children}
        </div>
      </div>
    )
  }

  if (carregando) {
    return (
      <>
        <Cabecalho />
        <PageContainer><p style={{ color: 'rgba(255,255,255,0.6)' }}>Carregando...</p></PageContainer>
      </>
    )
  }

  if (!envio) {
    return (
      <>
        <Cabecalho />
        <PageContainer><p style={{ color: 'rgba(255,255,255,0.6)' }}>Registro não encontrado.</p></PageContainer>
      </>
    )
  }

  return (
    <>
      <Cabecalho />
      <PageContainer>
        <div style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
          <button
            onClick={() => router.push('/admin/mercado')}
            style={{ marginBottom: 20, background: 'none', border: 'none', color: 'var(--dourado-claro)', cursor: 'pointer', fontSize: 14 }}
          >
            ← Voltar para a lista
          </button>

          <Card>
            <h1 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 26, color: 'var(--branco)', marginBottom: 28 }}>
              {envio.nome}
            </h1>

            <Secao titulo="Dados pessoais">
              <Campo label="Data de nascimento" valor={formatarData(envio.data_nascimento)} />
              <Campo label="Idade" valor={calcularIdade(envio.data_nascimento)} />
              <Campo label="Contato" valor={envio.contato} />
              <Campo label="Recebido em" valor={formatarData(envio.criado_em)} />
            </Secao>

            <Secao titulo="Dados esportivos">
              <Campo label="Posição principal" valor={envio.posicao} />
              <Campo label="Posição secundária" valor={envio.posicao_secundaria} />
              <Campo label="Pé dominante" valor={envio.pe_dominante} />
              <Campo label="Estatura (cm)" valor={envio.estatura} />
              <Campo label="Clube atual" valor={envio.clube_atual} />
              <Campo label="Jogou pela seleção?" valor={envio.jogos_selecao ? 'Sim' : 'Não'} />
              <Campo label="Jogou no profissional?" valor={envio.jogos_profissional ? 'Sim' : 'Não'} />
            </Secao>

            <Secao titulo="Material enviado">
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 6, textTransform: 'uppercase' }}>Vídeo</p>
                <a href={envio.link_video} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--dourado-claro)' }}>Assistir vídeo →</a>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 6, textTransform: 'uppercase' }}>Ogol</p>
                <a href={envio.link_ogol} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--dourado-claro)' }}>Ver perfil →</a>
              </div>
            </Secao>

            <div style={{ marginBottom: 8 }}>
              <p style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 13, letterSpacing: '0.05em', color: 'var(--dourado-claro)', marginBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>
                AVALIAÇÃO DO CLUBE
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div>
                  <label className="field-label">Característica</label>
                  <select
                    className="field"
                    value={envio.caracteristica || ''}
                    onChange={(e) => salvarCampo('caracteristica', e.target.value)}
                    disabled={salvando}
                  >
                    <option value="">Selecione</option>
                    {CARACTERISTICAS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Classificação</label>
                  <select
                    className="field"
                    value={envio.classificacao || ''}
                    onChange={(e) => salvarCampo('classificacao', e.target.value)}
                    disabled={salvando}
                  >
                    <option value="">Selecione</option>
                    {CLASSIFICACOES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </PageContainer>
    </>
  )
}

export default function FichaMercado() {
  return (
    <ProtegerAcesso area="mercado">
      <FichaMercadoConteudo />
    </ProtegerAcesso>
  )
}