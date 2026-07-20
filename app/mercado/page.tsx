'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Cabecalho from '../components/Cabecalho'
import PageContainer from '../components/ui/PageContainer'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const POSICOES = [
  'Goleiro', 'Lateral esquerdo', 'Lateral direito', 'Zagueiro',
  'Volante', 'Meio campo', 'Extremo', 'Centroavante',
]

export default function Mercado() {
  const [nome, setNome] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [posicao, setPosicao] = useState('')
  const [clubeAtual, setClubeAtual] = useState('')
  const [contato, setContato] = useState('')
  const [linkVideo, setLinkVideo] = useState('')
  const [estatura, setEstatura] = useState('')
  const [posicaoSecundaria, setPosicaoSecundaria] = useState('')
  const [peDominante, setPeDominante] = useState('')
  const [jogosSelecao, setJogosSelecao] = useState('')
  const [jogosProfissional, setJogosProfissional] = useState('')
  const [linkOgol, setLinkOgol] = useState('')

  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function enviar() {
    if (
      !nome || !dataNascimento || !posicao || !contato || !linkVideo ||
      !clubeAtual || !estatura || !posicaoSecundaria || !peDominante ||
      !jogosSelecao || !jogosProfissional || !linkOgol
    ) {
      setErro('Preencha todos os campos obrigatórios.')
      return
    }

    setEnviando(true)
    setErro('')

    const { error } = await supabase.from('captacao_mercado').insert({
      nome,
      data_nascimento: dataNascimento,
      posicao,
      clube_atual: clubeAtual,
      contato,
      link_video: linkVideo,
      estatura: parseFloat(estatura),
      posicao_secundaria: posicaoSecundaria,
      pe_dominante: peDominante,
      jogos_selecao: jogosSelecao === 'sim',
      jogos_profissional: jogosProfissional === 'sim',
      link_ogol: linkOgol,
    })

    setEnviando(false)

    if (error) {
      console.error(error)
      setErro('Erro ao enviar. Tente novamente.')
      return
    }

    setEnviado(true)
  }

  if (enviado) {
    return (
      <>
        <Cabecalho />
        <PageContainer>
          <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h1 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 26, color: 'var(--branco)', marginBottom: 8 }}>
                  Material recebido!
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Seus dados e vídeo foram enviados para análise da equipe de captação do clube.
                  O envio de material não garante convocação — entraremos em contato caso haja interesse.
                </p>
              </div>
            </Card>
          </div>
        </PageContainer>
      </>
    )
  }

  return (
    <>
      <Cabecalho />
      <PageContainer>
        <div style={{ maxWidth: 560, margin: '0 auto', width: '100%' }}>
          <Card>
            <h1 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 28, color: 'var(--branco)', marginBottom: 8 }}>
              Análise de Mercado
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 20, lineHeight: 1.5 }}>
              Envie seus dados e material com lances/jogadas para avaliação da equipe de
              captação do clube. Esse processo é indicado para atletas fora da faixa etária
              das seletivas presenciais (Sub-17 em diante) ou que não podem comparecer
              pessoalmente no momento.
            </p>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 10, marginBottom: 24 }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.6 }}>
                • O envio de material não garante convocação.<br />
                • O vídeo deve mostrar lances/jogadas recentes do atleta.
              </p>
            </div>

            <label className="field-label">Nome completo *</label>
            <input className="field" type="text" value={nome} onChange={(e) => setNome(e.target.value)} />

            <label className="field-label">Data de nascimento *</label>
            <input className="field" type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />

            <label className="field-label">Posição principal *</label>
            <select className="field" value={posicao} onChange={(e) => setPosicao(e.target.value)}>
              <option value="">Selecione</option>
              {POSICOES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            <label className="field-label">2ª Posição *</label>
        <select className="field" value={posicaoSecundaria} onChange={(e) => setPosicaoSecundaria(e.target.value)}>
          <option value="">Selecione</option>
          {POSICOES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>

            <label className="field-label">Clube atual / Último Clube *</label>
            <input className="field" type="text" value={clubeAtual} onChange={(e) => setClubeAtual(e.target.value)} placeholder="Deixe em branco se não tiver" />

            <label className="field-label">Telefone de contato *</label>
            <input className="field" type="tel" value={contato} onChange={(e) => setContato(e.target.value)} placeholder="(11) 91234-5678" />

            <label className="field-label">Link do vídeo *</label>
            <input className="field" type="url" value={linkVideo} onChange={(e) => setLinkVideo(e.target.value)} placeholder="YouTube, Google Drive, etc." />
            <label className="field-label">Estatura (cm) *</label>
        <input className="field" type="number" step="0.1" value={estatura} onChange={(e) => setEstatura(e.target.value)} />

        <label className="field-label">Pé dominante *</label>
        <select className="field" value={peDominante} onChange={(e) => setPeDominante(e.target.value)}>
          <option value="">Selecione</option>
          <option value="Direita">Direita</option>
          <option value="Esquerda">Esquerda</option>
          <option value="Ambidestro">Ambidestro</option>
        </select>

        <label className="field-label">Já jogou pela seleção? *</label>
        <select className="field" value={jogosSelecao} onChange={(e) => setJogosSelecao(e.target.value)}>
          <option value="">Selecione</option>
          <option value="sim">Sim</option>
          <option value="nao">Não</option>
        </select>

        <label className="field-label">Já jogou pela equipe profissional? *</label>
        <select className="field" value={jogosProfissional} onChange={(e) => setJogosProfissional(e.target.value)}>
          <option value="">Selecione</option>
          <option value="sim">Sim</option>
          <option value="nao">Não</option>
        </select>

        <label className="field-label">Link do atleta no Ogol *</label>
        <input className="field" type="url" value={linkOgol} onChange={(e) => setLinkOgol(e.target.value)} placeholder="https://www.ogol.com.br/..." />

            {erro && <p style={{ color: '#f87171', marginBottom: 16, fontSize: 14 }}>{erro}</p>}

            <Button onClick={enviar} disabled={enviando}>
              {enviando ? 'ENVIANDO...' : 'ENVIAR PARA ANÁLISE'}
            </Button>
          </Card>
        </div>
      </PageContainer>
    </>
  )
}