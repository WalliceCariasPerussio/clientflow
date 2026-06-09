import { useState, useEffect, useCallback } from 'react'
import { Search, Trash2, Edit3, TrendingUp, TrendingDown } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { PaginatedResponse } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'

interface Transaction {
  id: number; type: 'income' | 'expense'; amount: number;
  description: string; category: string | null; date: string;
}

interface Balance {
  total_income: number; total_expense: number; balance: number;
  this_month_income: number; this_month_expense: number;
}

export default function Finance() {
  const { isAuthenticated } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [balance, setBalance] = useState<Balance | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [form, setForm] = useState({ type: 'income', amount: '', description: '', category: '', date: new Date().toISOString().split('T')[0] })
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const txRes = await api.get<PaginatedResponse<Transaction>>(`/transactions?page=${page}&per_page=10${search ? '&search=' + search : ''}${typeFilter ? '&type=' + typeFilter : ''}`)
      setTransactions(txRes.data.data)
      setLastPage(txRes.data.meta.last_page)
    } catch (err: any) {
      if (err?.response?.status !== 401) toast.error('Erro ao carregar transações')
    } finally { setLoading(false) }

    try {
      const balRes = await api.get('/transactions/balance')
      setBalance(balRes.data.data)
    } catch { /* silencioso */ }
  }, [page, search, typeFilter, isAuthenticated])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = (type: 'income' | 'expense') => {
    setEditing(null)
    setForm({ type, amount: '', description: '', category: '', date: new Date().toISOString().split('T')[0] })
    setModalOpen(true)
  }

  const openEdit = (tx: Transaction) => {
    setEditing(tx)
    setForm({ type: tx.type, amount: String(tx.amount), description: tx.description, category: tx.category ?? '', date: tx.date })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.amount || !form.description) { toast.error('Valor e descrição obrigatórios'); return }
    setSaving(true)
    try {
      const p = { ...form, amount: Number(form.amount) }
      if (editing) { await api.put(`/transactions/${editing.id}`, p); toast.success('Atualizado!') }
      else { await api.post('/transactions', p); toast.success('Registrado!') }
      setModalOpen(false)
      fetchData()
    } catch { toast.error('Erro') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir?')) return
    try { await api.delete(`/transactions/${id}`); toast.success('Excluído'); fetchData() }
    catch { toast.error('Erro') }
  }

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(v)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Financeiro</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Controle de entradas e saídas</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openCreate('income')} className="bg-emerald-600 hover:bg-emerald-700 text-white"><TrendingUp size={18} className="mr-1.5" /> Entrada</Button>
          <Button onClick={() => openCreate('expense')} variant="destructive"><TrendingDown size={18} className="mr-1.5" /> Saída</Button>
        </div>
      </div>

      {balance && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="border-emerald-200 dark:border-emerald-800"><CardContent className="p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Saldo Total</p>
            <p className={`text-2xl font-bold ${balance.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(balance.balance)}</p>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1"><TrendingUp size={14} className="text-emerald-500" /> Entradas (mês)</p>
            <p className="text-2xl font-bold text-emerald-600">{fmt(balance.this_month_income)}</p>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1"><TrendingDown size={14} className="text-red-500" /> Saídas (mês)</p>
            <p className="text-2xl font-bold text-red-600">{fmt(balance.this_month_expense)}</p>
          </CardContent></Card>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><Input placeholder="Buscar..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="pl-9" /></div>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }} className="h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
          <option value="">Todos</option><option value="income">Entradas</option><option value="expense">Saídas</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Tipo</th>
          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Valor</th>
          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Descrição</th>
          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Categoria</th>
          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Data</th>
          <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Ações</th>
        </tr></thead><tbody>
          {loading ? Array.from({ length: 5 }).map((_, i) => (<tr key={i} className="border-b border-slate-100 dark:border-slate-800">{Array.from({ length: 6 }).map((_, j) => (<td key={j} className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>))}</tr>))
          : transactions.length === 0 ? (<tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Nenhuma transação</td></tr>)
          : transactions.map((tx) => (
            <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>{tx.type === 'income' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{tx.type === 'income' ? 'Entrada' : 'Saída'}</span></td>
              <td className={`px-4 py-3 text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{fmt(tx.amount)}</td>
              <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell max-w-[200px] truncate">{tx.description}</td>
              <td className="px-4 py-3 text-sm text-slate-500 hidden sm:table-cell">{tx.category || '-'}</td>
              <td className="px-4 py-3 text-sm text-slate-500 hidden sm:table-cell">{new Date(tx.date).toLocaleDateString('pt-BR')}</td>
              <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1">
                <button onClick={() => openEdit(tx)} className="p-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-400 hover:text-indigo-600"><Edit3 size={15} /></button>
                <button onClick={() => handleDelete(tx.id)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600"><Trash2 size={15} /></button>
              </div></td>
            </tr>
          ))}
        </tbody></table></div>
        {lastPage > 1 && (<div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800"><Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button><span className="text-sm text-slate-500">Página {page} de {lastPage}</span><Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === lastPage}>Próxima</Button></div>)}
      </div>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar transação' : `Nova ${form.type === 'income' ? 'entrada' : 'saída'}`}>
        <div className="space-y-4">
          <input type="hidden" value={form.type} />
          <div><label className="block text-sm font-medium mb-1">Tipo</label><div className="flex gap-2">{(['income', 'expense'] as const).map(t => (<button key={t} onClick={() => setForm({ ...form, type: t })} className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${form.type === t ? (t === 'income' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400') : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>{t === 'income' ? '💰 Entrada' : '💸 Saída'}</button>))}</div></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">Valor (USD) *</label><Input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Data</label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Descrição *</label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Categoria</label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ex: Serviço, Produto..." /></div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700"><Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : editing ? 'Atualizar' : 'Registrar'}</Button></div>
        </div>
      </Dialog>
    </div>
  )
}
