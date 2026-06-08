import { useEffect, useState } from 'react'
import { Plus, Building2, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Dialog } from '@/components/ui/Dialog'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { Company } from '@/types'

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchCompanies = async () => {
    setLoading(true)
    try {
      const { data } = await api.get<{ data: Company[] }>('/companies', { params: { q: search } })
      setCompanies(data.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchCompanies() }, [search])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    try {
      await api.post('/companies', { name: newName.trim() })
      toast.success('Empresa criada!')
      setNewName('')
      setModalOpen(false)
      fetchCompanies()
    } catch { toast.error('Erro ao criar empresa') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6 motion-preset-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Empresas</h2>
        <Button onClick={() => setModalOpen(true)}><Plus size={18} /> Nova Empresa</Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input placeholder="Buscar empresa..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
      ) : companies.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-slate-400">Nenhuma empresa cadastrada.</CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {companies.map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                  <Building2 size={18} className="text-slate-400" />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{c.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title="Nova Empresa">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome da empresa</label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: TechBrasil Soluções" required autoFocus />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
