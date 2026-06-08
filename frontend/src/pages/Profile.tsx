import { useState, type FormEvent } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { toast } from 'sonner'
import api from '@/lib/api'

export default function Profile() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: Record<string, string> = {}
      if (name !== user?.name) payload.name = name
      if (password) {
        payload.password = password
        payload.password_confirmation = passwordConfirm
      }
      if (Object.keys(payload).length === 0) {
        toast.info('Nenhuma alteração detectada.')
        setSaving(false)
        return
      }

      await api.put('/profile', payload)
      // Refresh user data
      const { data } = await api.get('/me')
      localStorage.setItem('user', JSON.stringify(data.user))
      toast.success('Perfil atualizado com sucesso!')
      setPassword('')
      setPasswordConfirm('')
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Erro ao atualizar perfil'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl motion-preset-slide-up space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Meu Perfil</h2>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar name={user?.name ?? '?'} size="lg" />
            <div>
              <CardTitle>{user?.name}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={user?.email ?? ''} disabled className="opacity-60" />
              <p className="text-xs text-slate-400">O email não pode ser alterado.</p>
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            <div className="space-y-2">
              <label className="text-sm font-medium">Nova senha</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Deixe em branco para não alterar" />
            </div>

            {password && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirmar senha</label>
                <Input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="Repita a nova senha" />
              </div>
            )}

            <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar alterações'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
