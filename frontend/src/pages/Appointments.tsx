import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Edit3, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { Client, PaginatedResponse } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'

interface Appointment {
  id: number; title: string; description: string | null;
  client?: { id: number; name: string }; client_id: number;
  date: string; time: string; status: 'scheduled' | 'completed' | 'cancelled';
}

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Agendado', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'completed', label: 'Concluído', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
]

export default function Appointments() {
  const { isAuthenticated } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Appointment | null>(null)
  const [form, setForm] = useState({ client_id: '', title: '', description: '', date: new Date().toISOString().split('T')[0], time: '09:00', status: 'scheduled' })
  const [saving, setSaving] = useState(false)

  const fetchAppointments = useCallback(async () => {
    if (!isAuthenticated) { setLoading(false); return }
    setLoading(true)
    try {
      const { data } = await api.get<PaginatedResponse<Appointment>>(`/appointments?month=${selectedMonth}&per_page=50`)
      setAppointments(data.data)
    } catch (err: any) {
      if (err?.response?.status !== 401) toast.error('Erro ao carregar agenda')
    } finally { setLoading(false) }
  }, [selectedMonth, isAuthenticated])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  useEffect(() => {
    api.get<PaginatedResponse<Client>>('/clients?per_page=100').then(({ data }) => setClients(data.data)).catch(() => {})
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ client_id: '', title: '', description: '', date: new Date().toISOString().split('T')[0], time: '09:00', status: 'scheduled' })
    setModalOpen(true)
  }

  const openEdit = (a: Appointment) => {
    setEditing(a)
    setForm({ client_id: String(a.client_id), title: a.title, description: a.description ?? '', date: a.date, time: a.time, status: a.status })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.client_id || !form.title) { toast.error('Cliente e título obrigatórios'); return }
    setSaving(true)
    try {
      const p = { ...form, client_id: Number(form.client_id) }
      if (editing) { await api.put(`/appointments/${editing.id}`, p); toast.success('Atualizado!') }
      else { await api.post('/appointments', p); toast.success('Agendado!') }
      setModalOpen(false)
      fetchAppointments()
    } catch { toast.error('Erro') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir?')) return
    try { await api.delete(`/appointments/${id}`); toast.success('Excluído'); fetchAppointments() }
    catch { toast.error('Erro') }
  }

  const prevMonth = () => { const [y, m] = selectedMonth.split('-').map(Number); const d = new Date(y, m - 2, 1); setSelectedMonth(d.toISOString().slice(0, 7)) }
  const nextMonth = () => { const [y, m] = selectedMonth.split('-').map(Number); const d = new Date(y, m, 1); setSelectedMonth(d.toISOString().slice(0, 7)) }

  const monthName = new Date(selectedMonth + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Agenda</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Compromissos com clientes</p>
        </div>
        <Button onClick={openCreate}><Plus size={18} className="mr-1.5" /> Novo compromisso</Button>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3">
        <Button variant="outline" size="sm" onClick={prevMonth}><ChevronLeft size={16} /></Button>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 capitalize">{monthName}</h2>
        <Button variant="outline" size="sm" onClick={nextMonth}><ChevronRight size={16} /></Button>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Data/Hora</th>
          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Cliente</th>
          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Título</th>
          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Descrição</th>
          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
          <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Ações</th>
        </tr></thead><tbody>
          {loading ? Array.from({ length: 5 }).map((_, i) => (<tr key={i} className="border-b border-slate-100 dark:border-slate-800">{Array.from({ length: 6 }).map((_, j) => (<td key={j} className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>))}</tr>))
          : appointments.length === 0 ? (<tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Nenhum compromisso este mês</td></tr>)
          : appointments.map((a) => (
            <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-indigo-500" />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{new Date(a.date).toLocaleDateString('pt-BR')}</span>
                  <Clock size={14} className="text-slate-400 ml-2" />
                  <span className="text-sm text-slate-500">{a.time}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">{a.client?.name ?? `#${a.client_id}`}</td>
              <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{a.title}</td>
              <td className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell max-w-[200px] truncate">{a.description || '-'}</td>
              <td className="px-4 py-3">{(() => { const s = STATUS_OPTIONS.find(x => x.value === a.status); return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${s?.color}`}>{s?.label}</span> })()}</td>
              <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1">
                <button onClick={() => openEdit(a)} className="p-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-400 hover:text-indigo-600"><Edit3 size={15} /></button>
                <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600"><Trash2 size={15} /></button>
              </div></td>
            </tr>
          ))}
        </tbody></table></div>
      </div>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar compromisso' : 'Novo compromisso'}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Cliente *</label><select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"><option value="">Selecione</option>{clients.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}</select></div>
          <div><label className="block text-sm font-medium mb-1">Título *</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Reunião de alinhamento" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">Data</label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Hora</label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">{STATUS_OPTIONS.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}</select></div>
          <div><label className="block text-sm font-medium mb-1">Descrição</label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detalhes do compromisso..." /></div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700"><Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : editing ? 'Atualizar' : 'Agendar'}</Button></div>
        </div>
      </Dialog>
    </div>
  )
}
