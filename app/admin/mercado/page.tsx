'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import ProtegerAcesso from '../../components/ProtegerAcesso'
import Cabecalho from '../../components/Cabecalho'
import PageContainer from '../../components/ui/PageContainer'

type Envio = {
  id: string
  nome: string
  data_nascimento: string
  posicao: string
  clube_atual: string | null
  classificacao: string | null
  criado_em: string
}

function AdminMercadoConteudo() {
  const router = useRouter()
  const [envios, setEnvios] = useState<Envio[]>([])
  const [filtroNome, setFiltroNome] = useState('')
  const [filtroPosicao, setFiltroPosicao] = useState('todas')
  const [filtroAno, setFiltroAno] = useState('todos')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data } = await supabase
      .from('captacao_mercado')
      .select('id, nome, data_nascimento, posicao, clube_atual, classificacao, criado_em')
      .order('criado_em', { ascending: false })
    setEnvios(data || [])
    setCarregando(false)
  }

  function calcularIdade(dataNascimento: string) {
    const nascimento = new Date(dataNascimento)
    const hoje = new Date()
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) idade--
    return idade
  }

  const posicoesDisponiveis = Array.from(new Set(envios.map((e) => e.posicao))).sort()
  const anosDisponiveis = Array.from(new Set(envios.map((e) => new Date(e.data_nascimento).getFullYear()))).sort((a, b) => b - a)

  const filtrados = envios.filter((e) => {
    if (filtroNome && !e.nome.toLowerCase().includes(filtroNome.toLowerCase())) return false
    if (filtroPosicao !== 'todas' && e.posicao !== filtroPosicao) return false
    if (filtroAno !== 'todos' && String(new Date(e.data_nascimento).getFullYear()) !== filtroAno) return false
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

  return (
    <>
      <Cabecalho />
      <PageContainer width="wide">
        <h1 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 28, color: 'var(--branco)', marginBottom: 24 }}>
          Análise de Mercado — Materiais Recebidos
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
              style={{ marginBottom: 0, width: 220 }}
            />
          </div>
          <div>
            <label className="field-label">Posição</label>
            <select value={filtroPosicao} onChange={(e) => setFiltroPosicao(e.target.value)} className="field" style={{ marginBottom: 0 }}>
              <option value="todas">Todas</option>
              {posicoesDisponiveis.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Ano de nascimento</label>
            <select value={filtroAno} onChange={(e) => setFiltroAno(e.target.value)} className="field" style={{ marginBottom: 0 }}>
              <option value="todos">Todos</option>
              {anosDisponiveis.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <p style={{ marginBottom: 16, color: 'rgba(255,255,255,0.5)' }}>{filtrados.length} envio(s)</p>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                <th style={{ padding: 12, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Nome</th>
                <th style={{ padding: 12, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Idade</th>
                <th style={{ padding: 12, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Posição</th>
                <th style={{ padding: 12, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Clube atual</th>
                <th style={{ padding: 12, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Classificação</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((e) => (
                <tr
                  key={e.id}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}
                  onClick={() => router.push(`/admin/mercado/${e.id}`)}
                >
                  <td style={{ padding: 12, color: 'var(--branco)' }}>{e.nome}</td>
                  <td style={{ padding: 12, color: 'rgba(255,255,255,0.8)' }}>{calcularIdade(e.data_nascimento)}</td>
                  <td style={{ padding: 12, color: 'rgba(255,255,255,0.8)' }}>{e.posicao}</td>
                  <td style={{ padding: 12, color: 'rgba(255,255,255,0.8)' }}>{e.clube_atual || '—'}</td>
                  <td style={{ padding: 12, color: 'rgba(255,255,255,0.8)' }}>{e.classificacao || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageContainer>
    </>
  )
}

export default function AdminMercado() {
  return (
    <ProtegerAcesso area="mercado">
      <AdminMercadoConteudo />
    </ProtegerAcesso>
  )
}