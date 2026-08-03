'use client'

import { useState } from 'react'
import bcrypt from 'bcryptjs'
import { supabase } from '../lib/supabase'
import Cabecalho from '../components/Cabecalho'
import PageContainer from '../components/ui/PageContainer'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useRouter } from 'next/navigation'

export default function Entrar() {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const router = useRouter()
  const [validando, setValidando] = useState(false)

  function registrarAtividade() {
    localStorage.setItem('sessao_atividade', String(Date.now()))
  }

  async function entrar() {
    if (!senha) { setErro('Digite sua senha.'); return }

    setValidando(true)
    setErro('')

    const { data, error } = await supabase
      .from('acessos')
      .select('areas, senha_hash, ativo')
      .not('senha_hash', 'is', null)

    if (error || !data) {
      setValidando(false)
      setErro('Erro ao verificar acesso. Tente novamente.')
      return
    }

    let encontrado: { areas: string[] } | null = null
    for (const registro of data) {
      if (!registro.ativo) continue
      const confere = await bcrypt.compare(senha, registro.senha_hash as string)
      if (confere) { encontrado = registro as { areas: string[] }; break }
    }

    setValidando(false)

    if (!encontrado) {
      setErro('Senha inválida.')
      return
    }

    localStorage.setItem('sessao_areas', JSON.stringify(encontrado.areas))
    registrarAtividade()
    
    sessionStorage.setItem('sessao_liberada', 'true')
    
    window.location.href = '/'  }


  return (
    <>
      <Cabecalho />
      <PageContainer>
        <div style={{ maxWidth: 400, margin: '0 auto', width: '100%' }}>
          <Card>
            <h1 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 24, color: 'var(--branco)', marginBottom: 8 }}>
              Área restrita
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
              Digite sua senha de acesso.
            </p>

            <label className="field-label">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && entrar()}
              className="field"
            />

            {erro && <p style={{ color: '#f87171', marginBottom: 16, fontSize: 14 }}>{erro}</p>}

            <Button onClick={entrar} disabled={validando}>
              {validando ? 'VERIFICANDO...' : 'ENTRAR'}
            </Button>

            <div style={{ marginTop: 12 }}>
             <Button onClick={() => router.push('/definir-senha')}>
                    PRIMEIRO ACESSO
             </Button>
            </div>
            
          </Card>
        </div>
      </PageContainer>
    </>
  )
}