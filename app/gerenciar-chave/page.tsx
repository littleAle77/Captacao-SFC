'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ProtegerAcesso from '../components/ProtegerAcesso'
import Cabecalho from '../components/Cabecalho'
import PageContainer from '../components/ui/PageContainer'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

type ChaveRow = { id: string; chave: string; ativa: boolean; criado_em: string }

function GerenciarChaveConteudo() {
  const [chaves, setChaves] = useState<ChaveRow[]>([])
  const [novaChave, setNovaChave] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [novoDestino, setNovoDestino] = useState('padrao')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data } = await supabase.from('chave_acesso_geral').select('*').order('criado_em', { ascending: false })
    setChaves(data || [])
    setCarregando(false)
  }

  async function criarChave() {
    if (!novaChave.trim()) { setErro('Digite a nova chave.'); return }
    setSalvando(true)
    setErro('')
    const { error } = await supabase.from('chave_acesso_geral').insert({ chave: novaChave.trim(), destino: novoDestino, ativa: true })
    setSalvando(false)
    if (error) { setErro('Erro ao criar chave. Ela pode já existir.'); return }
    setNovaChave('')
    carregar()
  }

  async function alternarStatus(id: string, ativaAtual: boolean) {
    await supabase.from('chave_acesso_geral').update({ ativa: !ativaAtual }).eq('id', id)
    carregar()
  }

  function formatarData(data: string) {
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  if (carregando) {
    return (
      <>
        <Cabecalho />
        <PageContainer><p style={{ color: 'rgba(255,255,255,0.6)' }}>Carregando...</p></PageContainer>
      </>
    )
  }

  return (
    <>
      <Cabecalho />
      <PageContainer>
        <div style={{ maxWidth: 600, margin: '0 auto', width: '100%' }}>
          <Card>
            <h1 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 26, color: 'var(--branco)', marginBottom: 8 }}>
              Chave de acesso geral
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24, fontSize: 14, lineHeight: 1.5 }}>
              Essa chave é exigida para qualquer pessoa acessar o site. Você pode manter mais de uma
              chave ativa ao mesmo tempo (período de transição) e desativar a antiga quando quiser.
            </p>

            <label className="field-label">Criar nova chave</label>
            <input
              type="text"
              value={novaChave}
              onChange={(e) => setNovaChave(e.target.value)}
              className="field"
              placeholder="Ex: SANTOS-JULHO26"
            />
            {erro && <p style={{ color: '#f87171', marginBottom: 12, fontSize: 14 }}>{erro}</p>}
            <Button onClick={criarChave} disabled={salvando}>
              {salvando ? 'CRIANDO...' : 'CRIAR CHAVE'}
            </Button>

            <div style={{ marginTop: 32 }}>
              <p
                style={{
                  fontFamily: 'var(--fonte-titulo)',
                  fontSize: 13,
                  letterSpacing: '0.05em',
                  color: 'var(--dourado-claro)',
                  marginBottom: 14,
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  paddingBottom: 8,
                }}
              >
                CHAVES CADASTRADAS
              </p>
              {chaves.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    marginBottom: 8,
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div>
                    <p style={{ color: 'var(--branco)', fontWeight: 600 }}>{c.chave}</p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Criada em {formatarData(c.criado_em)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span
                      style={{
                        fontSize: 13,
                        padding: '2px 10px',
                        borderRadius: 10,
                        background: c.ativa ? 'rgba(22,163,74,0.15)' : 'rgba(255,255,255,0.08)',
                        color: c.ativa ? '#4ade80' : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {c.ativa ? 'Ativa' : 'Inativa'}
                    </span>
                    <button
                      onClick={() => alternarStatus(c.id, c.ativa)}
                      style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--branco)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}
                    >
                      {c.ativa ? 'Desativar' : 'Ativar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </PageContainer>
    </>
  )
}

export default function GerenciarChave() {
  return (
    <ProtegerAcesso area="chaves">
      <GerenciarChaveConteudo />
    </ProtegerAcesso>
  )
}