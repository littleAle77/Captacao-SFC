'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import ProtegerAcesso from '../../../components/ProtegerAcesso'
import Cabecalho from '../../../components/Cabecalho'
import PageContainer from '../../../components/ui/PageContainer'
import Card from '../../../components/ui/Card'

type Atleta = {
  id: string
  nome: string
  telefone: string
  data_nascimento: string
  peso: number
  estatura: number
  pe_predominante: string
  posicao: string
  clube_anterior: string | null
  indicador_externo_nome: string
  indicador_externo_contato: string
  indicador_interno_nome: string
  indicador_interno_contato: string
  cidade_natal: string
  estado_natal: string
  cidade_atual: string
  estado_atual: string
  status_triagem: string
  pendencias: string | null
}

type DocumentoEnviado = {
  id: string
  arquivo_url: string
  data_validade: string | null
  status: string
  documentos_exigidos: { nome: string }
}

function FichaAtletaConteudo() {
  const { id } = useParams()
  const router = useRouter()

  const [atleta, setAtleta] = useState<Atleta | null>(null)
  const [documentos, setDocumentos] = useState<DocumentoEnviado[]>([])
  const [semana, setSemana] = useState<{ data_inicio: string; data_fim: string } | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => { carregarFicha() }, [id])

  async function carregarFicha() {
    const { data: atletaData } = await supabase.from('atletas').select('*').eq('id', id).single()
    const { data: documentosData } = await supabase
      .from('documentos_enviados')
      .select('id, arquivo_url, data_validade, status, documentos_exigidos(nome)')
      .eq('atleta_id', id)
    const { data: agendamentoData } = await supabase
      .from('agendamentos')
      .select('semanas_avaliacao(data_inicio, data_fim)')
      .eq('atleta_id', id)
      .maybeSingle()

    setAtleta(atletaData)
    setDocumentos((documentosData as any) || [])
    if (agendamentoData?.semanas_avaliacao) setSemana(agendamentoData.semanas_avaliacao as any)
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

  function calcularCategoria(dataNascimento: string) {
    const anoNascimento = new Date(dataNascimento).getFullYear()
    const anoAtual = new Date().getFullYear()
    return anoAtual - anoNascimento
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

  if (!atleta) {
    return (
      <>
        <Cabecalho />
        <PageContainer><p style={{ color: 'rgba(255,255,255,0.6)' }}>Atleta não encontrado.</p></PageContainer>
      </>
    )
  }

  return (
    <>
      <Cabecalho />
      <PageContainer>
        <div style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
          <button
            onClick={() => router.push('/admin')}
            style={{ marginBottom: 20, background: 'none', border: 'none', color: 'var(--dourado-claro)', cursor: 'pointer', fontSize: 14 }}
          >
            ← Voltar para a lista
          </button>

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <h1 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 26, color: 'var(--branco)' }}>{atleta.nome}</h1>
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: 12,
                  fontSize: 14,
                  background: atleta.status_triagem === 'apto' ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)',
                  color: atleta.status_triagem === 'apto' ? '#4ade80' : '#f87171',
                }}
              >
                {atleta.status_triagem === 'apto' ? 'Apto' : 'Pendente'}
              </span>
            </div>

            <Secao titulo="Dados Pessoais">
              <Campo label="Data de nascimento" valor={formatarData(atleta.data_nascimento)} />
              <Campo label="Idade" valor={calcularIdade(atleta.data_nascimento)} />
              <Campo label="Categoria" valor={`Sub-${calcularCategoria(atleta.data_nascimento)}`} />
              <Campo label="Telefone" valor={atleta.telefone} />
            </Secao>

            <Secao titulo="Dados Esportivos">
              <Campo label="Posição" valor={atleta.posicao} />
              <Campo label="Pé dominante" valor={atleta.pe_predominante} />
              <Campo label="Peso (kg)" valor={atleta.peso} />
              <Campo label="Estatura (cm)" valor={atleta.estatura} />
              <Campo label="Clube anterior" valor={atleta.clube_anterior} />
            </Secao>

            <Secao titulo="Indicação">
              <Campo label="Indicador externo" valor={atleta.indicador_externo_nome} />
              <Campo label="Contato do indicador externo" valor={atleta.indicador_externo_contato} />
              <Campo label="Indicador interno" valor={atleta.indicador_interno_nome} />
              <Campo label="Contato do indicador interno" valor={atleta.indicador_interno_contato} />
            </Secao>

            <Secao titulo="Naturalidade e Residência">
              <Campo label="Cidade natal" valor={atleta.cidade_natal} />
              <Campo label="Estado natal" valor={atleta.estado_natal} />
              <Campo label="Cidade atual" valor={atleta.cidade_atual} />
              <Campo label="Estado atual" valor={atleta.estado_atual} />
            </Secao>

            <Secao titulo="Inscrição">
              <Campo
                label="Semana de avaliação"
                valor={semana ? `${formatarData(semana.data_inicio)} a ${formatarData(semana.data_fim)}` : 'Não agendado'}
              />
            </Secao>

            {atleta.pendencias && (
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 13, letterSpacing: '0.05em', color: '#f87171', marginBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>
                  PENDÊNCIAS
                </p>
                <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(248,113,113,0.4)', borderRadius: 10, padding: 16 }}>
                  {atleta.pendencias.split(' | ').map((p, i) => (
                    <p key={i} style={{ color: '#f87171', fontSize: 14, marginBottom: 4 }}>• {p}</p>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 13, letterSpacing: '0.05em', color: 'var(--dourado-claro)', marginBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>
                DOCUMENTOS ENVIADOS
              </p>
              {documentos.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>Nenhum documento enviado ainda.</p>
              ) : (
                documentos.map((doc) => (
                  <div
                    key={doc.id}
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
                      <p style={{ fontWeight: 600, color: 'var(--branco)' }}>{doc.documentos_exigidos?.nome}</p>
                      {doc.data_validade && (
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Emitido em: {formatarData(doc.data_validade)}</p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span
                        style={{
                          fontSize: 13,
                          padding: '2px 10px',
                          borderRadius: 10,
                          background: doc.status === 'valido' ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)',
                          color: doc.status === 'valido' ? '#4ade80' : '#f87171',
                        }}
                      >
                        {doc.status === 'valido' ? 'Válido' : 'Vencido'}
                      </span>
                      <a href={doc.arquivo_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--dourado-claro)', fontSize: 14 }}>
                        Ver arquivo
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </PageContainer>
    </>
  )
}

export default function FichaAtleta() {
  return (
    <ProtegerAcesso area="seletiva">
      <FichaAtletaConteudo />
    </ProtegerAcesso>
  )
}