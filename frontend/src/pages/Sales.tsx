import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Trash2, Edit3 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { Sale, Client, PaginatedResponse } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { useAuth } from '@/contexts/AuthContext'

const STATUS_LABELS: Record<string, string> = {
  completed: 'Concluída',
  pending: 'Pendente',
  cancelled: 'Cancelada',
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function Sales() {
  const { isAuthenticated } = useAuth()
  const [sales, setSales] = useState<Sale[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [form, setForm] = useState({
    client_id: '',
    amount: '',
    description: '',
    status: 'completed',
    sale_date: new Date().toISOString().split('T')[0],
  })
  const [saving, setSaving] = useState(false)

  const fetchSales = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), per_page: '10' })
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      const { data } = await api.get<PaginatedResponse<Sale>>(`/sales?${params}`)
      setSales(data.data)
      setLastPage(data.meta.last_page)
    } catch (err: any) {
      if (err?.response?.status !== 401) toast.error('Erro ao carregar vendas')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, isAuthenticated])

  const fetchClients = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const { data } = await api.get<PaginatedResponse<Client>>('/clients?per_page=100')
      setClients(data.data)
    } catch { /* silencioso */ }
  }, [isAuthenticated])

  useEffect(() => { fetchSales() }, [fetchSales])
  useEffect(() => { fetchClients() }, [fetchClients])

  const openCreate = () => {
    setEditingSale(null)
    setForm({ client_id: '', amount: '', description: '', status: 'completed', sale_date: new Date().toISOString().split('T')[0] })
    setModalOpen(true)
  }

  const openEdit = (sale: Sale) => {
    setEditingSale(sale)
    setForm({
      client_id: String(sale.client_id),
      amount: String(sale.amount),
      description: sale.description ?? '',
      status: sale.status,
      sale_date: sale.sale_date,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.client_id || !form.amount) {
      toast.error('Cliente e valor são obrigatórios')
      return
    }
    setSaving(true)
    try {
      const payload = {
        client_id: Number(form.client_id),
        amount: Number(form.amount),
        description: form.description || null,
        status: form.status,
        sale_date: form.sale_date,
      }
      if (editingSale) {
        await api.put(`/sales/${editingSale.id}`, payload)
        toast.success('Venda atualizada!')
      } else {
        await api.post('/sales', payload)
        toast.success('Venda registrada!')
      }
      setModalOpen(false)
      fetchSales()
    } catch {
      toast.error('Erro ao salvar venda')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir esta venda?')) return
    try {
      await api.delete(`/sales/${id}`)
      toast.success('Venda excluída')
      fetchSales()
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(value)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Vendas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerencie as vendas dos seus clientes</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={18} className="mr-1.5" /> Nova venda
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar por descrição ou cliente..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 shadow-sm"
        >
          <option value="">Todos os status</option>
          <option value="completed">Concluída</option>
          <option value="pending">Pendente</option>
          <option value="cancelled">Cancelada</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Valor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase hidden md:table-cell">Descrição</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase hidden sm:table-cell">Data</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400 dark:text-slate-500">
                    Nenhuma venda encontrada
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                      {sale.client?.name ?? `#${sale.client_id}`}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(sale.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell max-w-[200px] truncate">
                      {sale.description || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[sale.status]}`}>
                        {STATUS_LABELS[sale.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                      {new Date(sale.sale_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(sale)} className="p-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-400 hover:text-indigo-600">
                          <Edit3 size={15} />
                        </button>
                        <button onClick={() => handleDelete(sale.id)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {lastPage > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Anterior
            </Button>
            <span className="text-sm text-slate-500 dark:text-slate-400">Página {page} de {lastPage}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page === lastPage}>
              Próxima
            </Button>
          </div>
        )}
      </div>

      {/* Modal Criar/Editar */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title={editingSale ? 'Editar venda' : 'Nova venda'}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cliente *</label>
              <select
                value={form.client_id}
                onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm shadow-sm"
              >
                <option value="">Selecione um cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valor (USD) *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data</label>
                <Input
                  type="date"
                  value={form.sale_date}
                  onChange={(e) => setForm({ ...form, sale_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm shadow-sm"
              >
                <option value="completed">Concluída</option>
                <option value="pending">Pendente</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
              <Input
                placeholder="Ex: Consultoria de desenvolvimento"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : editingSale ? 'Atualizar' : 'Registrar'}
            </Button>
          </div>
      </Dialog>
    </div>
  )
}
