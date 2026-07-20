'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { supabase } from '../lib/supabase'
import Cabecalho from '../components/Cabecalho'
import PageContainer from '../components/ui/PageContainer'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function TrocarSenha() {
  const router = useRouter()
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [enviando, setEnviando] = useState(false)

  async function trocar() {
    if (!senhaAtual || !novaSenha || !confirmar) { setErro('Preencha todos os campos.'); return }
    if (novaSenha.length < 6) { setErro('A nova senha deve ter pelo menos 6 caracteres.'); return }
    if (novaSenha !== confirmar) { setErro('As senhas não coincidem.'); return }

    setEnviando(true)
    setErro('')

    const { data, error } = await supabase
      .from('acessos')
      .select('id, senha_hash, ativo')
      .not('senha_hash', 'is', null)

    if (error || !data) { setEnviando(false); setErro('Erro ao verificar. Tente novamente.'); return }

    let encontrado: { id: string } | null = null
    for (const registro of data) {
      if (!registro.ativo) continue
      const confere = await bcrypt.compare(senhaAtual, registro.senha_hash as string)
      if (confere) { encontrado = registro as { id: string }; break }
    }

    if (!encontrado) { setEnviando(false); setErro('Senha atual incorreta.'); return }

    const novoHash = await bcrypt.hash(novaSenha, 10)

    const { error: erroUpdate } = await supabase
      .from('acessos')
      .update({ senha_hash: novoHash })
      .eq('id', encontrado.id)

    setEnviando(false)
    if (erroUpdate) { setErro('Erro ao salvar a nova senha.'); return }
    setSucesso(true)
  }

  if (sucesso) {
    return (
      <>
        <Cabecalho />
        <PageContainer>
          <div style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
            <Card>
              <h1 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 24, color: 'var(--branco)', marginBottom: 8 }}>Senha alterada!</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>Sua senha foi atualizada com sucesso.</p>
              <Button onClick={() => router.push('/')}>IR PARA O SITE</Button>
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
        <div style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
          <Card>
            <h1 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 24, color: 'var(--branco)', marginBottom: 8 }}>Trocar senha</h1>

            <label className="field-label">Senha atual</label>
            <input type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} className="field" />

            <label className="field-label">Nova senha</label>
            <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} className="field" />

            <label className="field-label">Confirmar nova senha</label>
            <input type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} className="field" />

            {erro && <p style={{ color: '#f87171', marginBottom: 16, fontSize: 14 }}>{erro}</p>}

            <Button onClick={trocar} disabled={enviando}>{enviando ? 'SALVANDO...' : 'SALVAR NOVA SENHA'}</Button>
          </Card>
        </div>
      </PageContainer>
    </>
  )
}