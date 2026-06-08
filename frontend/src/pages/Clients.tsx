import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react'
import api from '@/lib/api'
import type { Client, PaginatedResponse } from '@/types'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'Ativo', color: 'bg-emerald-100 text-emerald-700' },
  inactive: { label: 'Inativo', color: 'bg-slate-100 text-slate-700' },
  lead: { label: 'Lead', color: 'bg-amber-100 text-amber-700' },
}

interface ClientForm {
  name: string; email: string; phone: string; company: string
  status: 'active' | 'inactive' | 'lead'; notes: string
}

const emptyForm: ClientForm = { name: '', email: '', phone: '', company: '', status: 'lead', notes: '' }

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [meta, setMeta] = useState<PaginatedResponse<Client>['meta'] | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // Modal state
  const [modal, setModal] = useState<{ open: boolean; mode: 'create' | 'edit'; client?: Client }>({ open: false, mode: 'create' })
  const [form, setForm] = useState<ClientForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      const { data } = await api.get<PaginatedResponse<Client>>('/clients', { params })
      setClients(data.data)
      setMeta(data.meta)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => { fetchClients() }, [fetchClients])

  const openCreate = () => {
    setForm(emptyForm)
    setModal({ open: true, mode: 'create' })
  }

  const openEdit = (client: Client) => {
    setForm({ name: client.name, email: client.email, phone: client.phone ?? '', company: client.company ?? '', status: client.status, notes: client.notes ?? '' })
    setModal({ open: true, mode: 'edit', client })
  }

  const closeModal = () => setModal({ open: false, mode: 'create' })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal.mode === 'create') {
        await api.post('/clients', form)
      } else if (modal.client) {
        await api.put(`/clients/${modal.client.id}`, form)
      }
      closeModal()
      fetchClients()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    await api.delete(`/clients/${id}`)
    setDeleteId(null)
    fetchClients()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Clientes</h2>
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" placeholder="Buscar cliente..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
        >
          <option value="">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
          <option value="lead">Leads</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Nome</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Empresa</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-400">Carregando...</td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-400">Nenhum cliente encontrado.</td></tr>
            ) : (
              clients.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{c.email}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{c.company ?? '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_LABELS[c.status].color}`}>
                      {STATUS_LABELS[c.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition" title="Editar">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => setDeleteId(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition" title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Paginação */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <span className="text-sm text-slate-500">
              Mostrando {meta.from}–{meta.to} de {meta.total}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded text-sm font-medium transition ${
                    p === page ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Criar/Editar */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                {modal.mode === 'create' ? 'Novo Cliente' : 'Editar Cliente'}
              </h3>
              <button onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" required /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
                  <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ClientForm['status'] })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="lead">Lead</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition">
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Excluir cliente</h3>
            <p className="text-sm text-slate-500 mb-6">Tem certeza que deseja remover este cliente? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Cancelar</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
