'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import ProtegerAcesso from '../../components/ProtegerAcesso'
import Cabecalho from '../../components/Cabecalho'
import PageContainer from '../../components/ui/PageContainer'

type Atleta = {
  id: string
  nome: string
  telefone: string
  data_nascimento: string
  posicao: string
  status_triagem: string
}

function AdminEspecialConteudo() {
  const router = useRouter()
  const [atletas, setAtletas] = useState<Atleta[]>([])
  const [filtroNome, setFiltroNome] = useState('')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data } = await supabase
      .from('atletas')
      .select('id, nome, telefone, data_nascimento, posicao, status_triagem')
      .eq('tipo_inscricao', 'especial')
      .not('status_triagem', 'is', null)
      .order('criado_em', { ascending: false })
    setAtletas(data || [])
    setCarregando(false)
  }

  function calcularCategoria(dataNascimento: string) {
    const anoNascimento = new Date(dataNascimento).getFullYear()
    const anoAtual = new Date().getFullYear()
    return anoAtual - anoNascimento
  }

  const filtrados = atletas.filter((a) => !filtroNome || a.nome.toLowerCase().includes(filtroNome.toLowerCase()))

  if (carregando) {
    return (
      <>
        <Cabecalho />
        <PageContainer width="wide"><p style={{ color: 'rgba(255,255,255,0.6)' }}>Carregando...</p></PageContainer>
      </>
    )
  }

  return (
    <>
      <Cabecalho />
      <PageContainer width="wide">
        <h1 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 28, color: 'var(--branco)', marginBottom: 24 }}>
          Inscrições Especiais
        </h1>

        <input
          type="text"
          placeholder="Buscar por nome..."
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
          className="field"
          style={{ maxWidth: 260 }}
        />

        <p style={{ marginBottom: 16, color: 'rgba(255,255,255,0.5)' }}>{filtrados.length} atleta(s)</p>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                <th style={{ padding: 12, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Nome</th>
                <th style={{ padding: 12, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Categoria</th>
                <th style={{ padding: 12, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Posição</th>
                <th style={{ padding: 12, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((a) => (
                <tr
                  key={a.id}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}
                  onClick={() => router.push(`/admin/atleta/${a.id}`)}
                >
                  <td style={{ padding: 12, color: 'var(--branco)' }}>{a.nome}</td>
                  <td style={{ padding: 12, color: 'rgba(255,255,255,0.8)' }}>Sub-{calcularCategoria(a.data_nascimento)}</td>
                  <td style={{ padding: 12, color: 'rgba(255,255,255,0.8)' }}>{a.posicao}</td>
                  <td style={{ padding: 12 }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: 13,
                        background: a.status_triagem === 'apto' ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)',
                        color: a.status_triagem === 'apto' ? '#4ade80' : '#f87171',
                      }}
                    >
                      {a.status_triagem === 'apto' ? 'Apto' : 'Pendente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageContainer>
    </>
  )
}

export default function AdminEspecial() {
  return (
    <ProtegerAcesso area="especial">
      <AdminEspecialConteudo />
    </ProtegerAcesso>
  )
}