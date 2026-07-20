'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Cabecalho from '../../components/Cabecalho'
import PageContainer from '../../components/ui/PageContainer'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

type Documento = {
  id: string
  nome: string
  tem_validade: boolean
  dias_validade: number | null
  somente_menor: boolean
}

const POSICOES = [
  'Goleiro', 'Lateral esquerdo', 'Lateral direito', 'Zagueiro',
  'Volante', 'Meio campo', 'Extremo', 'Centroavante',
]

export default function Dados() {
  const router = useRouter()

  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [peso, setPeso] = useState('')
  const [estatura, setEstatura] = useState('')
  const [pePredominante, setPePredominante] = useState('')
  const [posicao, setPosicao] = useState('')
  const [clubeAnterior, setClubeAnterior] = useState('')
  const [indicadorExternoNome, setIndicadorExternoNome] = useState('')
  const [indicadorExternoContato, setIndicadorExternoContato] = useState('')
  const [indicadorInternoNome, setIndicadorInternoNome] = useState('')
  const [indicadorInternoContato, setIndicadorInternoContato] = useState('')
  const [cidadeNatal, setCidadeNatal] = useState('')
  const [estadoNatal, setEstadoNatal] = useState('')
  const [cidadeAtual, setCidadeAtual] = useState('')
  const [estadoAtual, setEstadoAtual] = useState('')

  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [documentos, setDocumentos] = useState<Documento[]>([])

  useEffect(() => {
    const dataNascimento = sessionStorage.getItem('data_nascimento')
    if (!dataNascimento) {
      router.push('/inscricao/nascimento')
      return
    }
    const nascimento = new Date(dataNascimento)
    const hoje = new Date()
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) idade--
    buscarDocumentos(idade < 18)
  }, [])

  async function buscarDocumentos(menor: boolean) {
    let query = supabase.from('documentos_exigidos').select('*')
    if (!menor) query = query.eq('somente_menor', false)
    const { data, error } = await query
    if (error) { setErro('Erro ao carregar a lista de documentos.'); return }
    setDocumentos(data || [])
  }

  async function continuar() {
    if (
      !nome || !telefone || !peso || !estatura || !pePredominante || !posicao ||
      !indicadorExternoNome || !indicadorExternoContato ||
      !indicadorInternoNome || !indicadorInternoContato ||
      !cidadeNatal || !estadoNatal || !cidadeAtual || !estadoAtual
    ) {
      setErro('Preencha todos os campos obrigatórios.')
      return
    }

    setCarregando(true)
    setErro('')
    const dataNascimento = sessionStorage.getItem('data_nascimento')

    const { data, error } = await supabase
      .from('atletas')
      .insert({
        nome, telefone, data_nascimento: dataNascimento,
        peso: parseFloat(peso), estatura: parseFloat(estatura),
        pe_predominante: pePredominante, posicao,
        clube_anterior: clubeAnterior || null,
        indicador_externo_nome: indicadorExternoNome,
        indicador_externo_contato: indicadorExternoContato,
        indicador_interno_nome: indicadorInternoNome,
        indicador_interno_contato: indicadorInternoContato,
        cidade_natal: cidadeNatal, estado_natal: estadoNatal,
        cidade_atual: cidadeAtual, estado_atual: estadoAtual,
      })
      .select()
      .single()

    setCarregando(false)

    if (error) {
      console.error(error)
      setErro('Erro ao salvar os dados. Tente novamente.')
      return
    }

    sessionStorage.setItem('atleta_id', data.id)
    router.push('/inscricao/documentos')
  }

  const tituloSecao = {
    fontFamily: 'var(--fonte-titulo)',
    fontWeight: 700,
    letterSpacing: '0.05em',
    marginBottom: 16,
    marginTop: 28,
    color: 'var(--dourado-claro)',
    fontSize: 14,
    textTransform: 'uppercase' as const,
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: 8,
  }

  return (
    <>
      <Cabecalho />
      <PageContainer>
        <div style={{ maxWidth: 640, margin: '0 auto', width: '100%' }}>
          <Card>
            <h1 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 28, color: 'var(--branco)', marginBottom: 8 }}>
              Dados do atleta
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
              Preencha as informações abaixo para continuar.
            </p>

            <label className="field-label" style={{ marginTop: 24 }}>Nome completo *</label>
            <input className="field" type="text" value={nome} onChange={(e) => setNome(e.target.value)} />

            <label className="field-label">Telefone (com DDD) *</label>
            <input className="field" type="tel" placeholder="(11) 91234-5678" value={telefone} onChange={(e) => setTelefone(e.target.value)} />

            <label className="field-label">Peso (kg) *</label>
            <input className="field" type="number" step="0.1" value={peso} onChange={(e) => setPeso(e.target.value)} />

            <label className="field-label">Estatura (cm) *</label>
            <input className="field" type="number" step="0.1" value={estatura} onChange={(e) => setEstatura(e.target.value)} />

            <label className="field-label">Pé predominante *</label>
            <select className="field" value={pePredominante} onChange={(e) => setPePredominante(e.target.value)}>
              <option value="">Selecione</option>
              <option value="Direita">Direita</option>
              <option value="Esquerda">Esquerda</option>
              <option value="Ambidestro">Ambidestro</option>
            </select>

            <label className="field-label">Posição *</label>
            <select className="field" value={posicao} onChange={(e) => setPosicao(e.target.value)}>
              <option value="">Selecione</option>
              {POSICOES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            <label className="field-label">Clube que já fez parte</label>
            <input className="field" type="text" value={clubeAnterior} onChange={(e) => setClubeAnterior(e.target.value)} />

            <p style={tituloSecao}>INDICAÇÃO</p>

            <label className="field-label">Nome do indicador externo *</label>
            <input className="field" type="text" value={indicadorExternoNome} onChange={(e) => setIndicadorExternoNome(e.target.value)} />

            <label className="field-label">Contato do indicador externo *</label>
            <input className="field" type="text" value={indicadorExternoContato} onChange={(e) => setIndicadorExternoContato(e.target.value)} />

            <label className="field-label">Nome do indicador interno (funcionário do clube) *</label>
            <input className="field" type="text" value={indicadorInternoNome} onChange={(e) => setIndicadorInternoNome(e.target.value)} />

            <label className="field-label">Contato do indicador interno *</label>
            <input className="field" type="text" value={indicadorInternoContato} onChange={(e) => setIndicadorInternoContato(e.target.value)} />

            <p style={tituloSecao}>NATURALIDADE E RESIDÊNCIA</p>

            <label className="field-label">Cidade natal *</label>
            <input className="field" type="text" value={cidadeNatal} onChange={(e) => setCidadeNatal(e.target.value)} />

            <label className="field-label">Estado natal *</label>
            <input className="field" type="text" value={estadoNatal} onChange={(e) => setEstadoNatal(e.target.value)} />

            <label className="field-label">Cidade atual *</label>
            <input className="field" type="text" value={cidadeAtual} onChange={(e) => setCidadeAtual(e.target.value)} />

            <label className="field-label">Estado atual *</label>
            <input className="field" type="text" value={estadoAtual} onChange={(e) => setEstadoAtual(e.target.value)} />

            {documentos.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 10, marginBottom: 20, marginTop: 12 }}>
                <p style={{ fontFamily: 'var(--fonte-titulo)', color: 'var(--dourado-claro)', fontWeight: 700, marginBottom: 8, letterSpacing: '0.03em', fontSize: 13 }}>
                  DOCUMENTOS NECESSÁRIOS NA PRÓXIMA ETAPA
                </p>
                <ul style={{ paddingLeft: 20, color: 'rgba(255,255,255,0.75)' }}>
                  {documentos.map((doc) => <li key={doc.id} style={{ marginBottom: 4 }}>{doc.nome}</li>)}
                </ul>
              </div>
            )}

            {erro && <p style={{ color: '#f87171', marginBottom: 16, fontSize: 14 }}>{erro}</p>}

            <Button onClick={continuar} disabled={carregando}>
              {carregando ? 'SALVANDO...' : 'CONTINUAR'}
            </Button>
          </Card>
        </div>
      </PageContainer>
    </>
  )
}