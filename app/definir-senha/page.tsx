'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { supabase } from '../lib/supabase'
import Cabecalho from '../components/Cabecalho'
import PageContainer from '../components/ui/PageContainer'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function DefinirSenha() {
  const router = useRouter()
  const [codigo, setCodigo] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [enviando, setEnviando] = useState(false)

  async function confirmarSenha() {
    if (!codigo || !senha || !confirmar) { setErro('Preencha todos os campos.'); return }
    if (senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return }
    if (senha !== confirmar) { setErro('As senhas não coincidem.'); return }

    setEnviando(true)
    setErro('')

    const { data, error } = await supabase
      .from('acessos')
      .select('id, convite_usado')
      .eq('codigo_convite', codigo.trim())
      .maybeSingle()

    if (error || !data) { setEnviando(false); setErro('Código de convite inválido.'); return }
    if (data.convite_usado) { setEnviando(false); setErro('Este código já foi utilizado.'); return }

    const hash = await bcrypt.hash(senha, 10)

    const { error: erroUpdate } = await supabase
      .from('acessos')
      .update({ senha_hash: hash, convite_usado: true, codigo_convite: null })
      .eq('id', data.id)

    setEnviando(false)
    if (erroUpdate) { setErro('Erro ao salvar a senha. Tente novamente.'); return }
    setSucesso(true)
  }

  if (sucesso) {
    return (
      <>
        <Cabecalho />
        <PageContainer>
          <div style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
            <Card>
              <h1 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 24, color: 'var(--branco)', marginBottom: 8 }}>Senha definida!</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>Sua senha foi criada com sucesso. Você já pode acessar sua área.</p>
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
            <h1 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 24, color: 'var(--branco)', marginBottom: 8 }}>Definir senha de acesso</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>Digite o código de convite que você recebeu e crie sua senha.</p>

            <label className="field-label">Código de convite</label>
            <input type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} className="field" placeholder="Ex: ABCD-1234" />

            <label className="field-label">Nova senha</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className="field" />

            <label className="field-label">Confirmar senha</label>
            <input type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} className="field" />

            {erro && <p style={{ color: '#f87171', marginBottom: 16, fontSize: 14 }}>{erro}</p>}

            <Button onClick={confirmarSenha} disabled={enviando}>{enviando ? 'SALVANDO...' : 'CRIAR SENHA'}</Button>
          </Card>
        </div>
      </PageContainer>
    </>
  )
}