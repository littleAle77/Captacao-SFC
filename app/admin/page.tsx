'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import ProtegerAcesso from '../components/ProtegerAcesso'
import Cabecalho from '../components/Cabecalho'
import PageContainer from '../components/ui/PageContainer'

type Atleta = {
  id: string
  nome: string
  avaliado: boolean
  telefone: string
  data_nascimento: string
  posicao: string
  status_triagem: string
  pendencias: string | null
}

type Semana = { id: string; data_inicio: string; data_fim: string }
type Agendamento = { atleta_id: string; semana_avaliacao_id: string }

function AdminConteudo() {
  const router = useRouter()

  const [atletas, setAtletas] = useState<Atleta[]>([])
  const [semanas, setSemanas] = useState<Semana[]>([])
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [carregando, setCarregando] = useState(true)

  const [filtroNome, setFiltroNome] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroSemana, setFiltroSemana] = useState('todas')
  const [filtroPosicao, setFiltroPosicao] = useState('todas')

  useEffect(() => { carregarDados() }, [])

  async function carregarDados() {
    setCarregando(true)
    const { data: atletasData } = await supabase
    .from('atletas')
    .select('*')
    .order('criado_em', { ascending: false })
    .eq('tipo_inscricao', 'padrao')
    .not('status_triagem', 'is', null)
    const { data: semanasData } = await supabase.from('semanas_avaliacao').select('*').order('data_inicio', { ascending: true })
    const { data: agendamentosData } = await supabase.from('agendamentos').select('atleta_id, semana_avaliacao_id')

    setAtletas(atletasData || [])
    setSemanas(semanasData || [])
    setAgendamentos(agendamentosData || [])
    setCarregando(false)
  }

  async function alternarAvaliado(
    e: React.MouseEvent,
    atletaId: string,
    valorAtual: boolean
  ) {
    e.stopPropagation()
  
    const { error } = await supabase
      .from('atletas')
      .update({ avaliado: !valorAtual })
      .eq('id', atletaId)
  
    if (!error) {
      setAtletas((lista) =>
        lista.map((a) =>
          a.id === atletaId
            ? { ...a, avaliado: !valorAtual }
            : a
        )
      )
    }
  }

  function calcularCategoria(dataNascimento: string) {
    const anoNascimento = new Date(dataNascimento).getFullYear()
    const anoAtual = new Date().getFullYear()
    return anoAtual - anoNascimento
  }

  function semanaDoAtleta(atletaId: string) {
    const agendamento = agendamentos.find((a) => a.atleta_id === atletaId)
    if (!agendamento) return null
    return semanas.find((s) => s.id === agendamento.semana_avaliacao_id) || null
  }

  function formatarData(data: string) {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')
  }

  const categoriasDisponiveis = Array.from(new Set(atletas.map((a) => calcularCategoria(a.data_nascimento)))).sort((a, b) => a - b)
  const posicoesDisponiveis = Array.from(new Set(atletas.map((a) => a.posicao))).sort()

  const atletasFiltrados = atletas.filter((atleta) => {
    if (filtroNome && !atleta.nome.toLowerCase().includes(filtroNome.toLowerCase())) return false
    if (filtroCategoria !== 'todas' && String(calcularCategoria(atleta.data_nascimento)) !== filtroCategoria) return false
    if (filtroPosicao !== 'todas' && atleta.posicao !== filtroPosicao) return false
    if (filtroSemana !== 'todas') {
      const semana = semanaDoAtleta(atleta.id)
      if (!semana || semana.id !== filtroSemana) return false
    }
    return true
  })

  if (carregando) {
    return (
      <>
        <Cabecalho />
        <PageContainer width="wide">
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Carregando...</p>
        </PageContainer>
      </>
    )
  }

  const selectStyle = { marginBottom: 0 }

  return (
    <>
      <Cabecalho />
      <PageContainer width="wide">
        <h1 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 28, color: 'var(--branco)', marginBottom: 24 }}>
          Painel de Inscrições
        </h1>

        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div>
            <label className="field-label">Buscar por nome</label>
            <input
              type="text"
              placeholder="Digite o nome..."
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
              className="field"
              style={{ ...selectStyle, width: 220 }}
            />
          </div>

          <div>
            <label className="field-label">Categoria</label>
            <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="field" style={selectStyle}>
              <option value="todas">Todas</option>
              {categoriasDisponiveis.map((c) => <option key={c} value={c}>Sub-{c}</option>)}
            </select>
          </div>

          <div>
            <label className="field-label">Posição</label>
            <select value={filtroPosicao} onChange={(e) => setFiltroPosicao(e.target.value)} className="field" style={selectStyle}>
              <option value="todas">Todas</option>
              {posicoesDisponiveis.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="field-label">Data do agendamento</label>
            <select value={filtroSemana} onChange={(e) => setFiltroSemana(e.target.value)} className="field" style={selectStyle}>
              <option value="todas">Todas</option>
              {semanas.map((s) => (
                <option key={s.id} value={s.id}>{formatarData(s.data_inicio)} a {formatarData(s.data_fim)}</option>
              ))}
            </select>
          </div>
        </div>

        <p style={{ marginBottom: 16, color: 'rgba(255,255,255,0.5)' }}>
          {atletasFiltrados.length} atleta(s) encontrado(s)
        </p>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                <th style={{ padding: 12, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Nome</th>
                <th style={{ padding: 12, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Categoria</th>
                <th style={{ padding: 12, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Posição</th>
                <th style={{ padding: 12, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Status</th>
                <th style={{padding: 12,  color: 'rgba(255,255,255,0.5)',fontSize: 13}}>Avaliado</th>
                <th style={{ padding: 12, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Data do agendamento</th>
              </tr>
            </thead>
            <tbody>
              {atletasFiltrados.map((atleta) => {
                const categoria = calcularCategoria(atleta.data_nascimento)
                const semana = semanaDoAtleta(atleta.id)
                return (
                  <tr
                    key={atleta.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}
                    onClick={() => router.push(`/admin/atleta/${atleta.id}`)}
                  >
                    <td style={{ padding: 12, color: 'var(--branco)' }}>{atleta.nome}</td>
                    <td style={{ padding: 12, color: 'rgba(255,255,255,0.8)' }}>Sub-{categoria}</td>
                    <td style={{ padding: 12, color: 'rgba(255,255,255,0.8)' }}>{atleta.posicao}</td>
                    <td style={{ padding: 12 }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 12,
                          fontSize: 13,
                          background: atleta.status_triagem === 'apto' ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)',
                          color: atleta.status_triagem === 'apto' ? '#4ade80' : '#f87171',
                        }}
                      >
                        {atleta.status_triagem === 'apto' ? 'Apto' : 'Pendente'}
                      </span>
                    </td>
                    <td style={{ padding: 12 }}><button onClick={(e) =>alternarAvaliado(e, atleta.id, atleta.avaliado)}
                        style={{
                        background: atleta.avaliado ? '#16a34a' : '#dc2626',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
    {atleta.avaliado ? 'SIM' : 'NÃO'}
  </button>
</td>
                    <td style={{ padding: 12, color: 'rgba(255,255,255,0.8)' }}>
                      {semana ? `${formatarData(semana.data_inicio)} a ${formatarData(semana.data_fim)}` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </PageContainer>
    </>
  )
}

export default function Admin() {
  return (
    <ProtegerAcesso area="seletiva">
      <AdminConteudo />
    </ProtegerAcesso>
  )
}