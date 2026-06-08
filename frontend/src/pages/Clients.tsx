import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Pencil, Trash2, Users, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Dialog } from '@/components/ui/Dialog'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { Client, Company, PaginatedResponse } from '@/types'

const STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'default'> = {
  active: 'success',
  inactive: 'default',
  lead: 'warning',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  lead: 'Lead',
}

interface ClientForm {
  name: string
  email: string
  phone: string
  company_id: number | null
  status: 'active' | 'inactive' | 'lead'
  notes: string
}

const emptyForm: ClientForm = {
  name: '',
  email: '',
  phone: '',
  company_id: null,
  status: 'lead',
  notes: '',
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [meta, setMeta] = useState<PaginatedResponse<Client>['meta'] | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // Modal states
  const [formModal, setFormModal] = useState<{ open: boolean; mode: 'create' | 'edit'; client?: Client }>({
    open: false,
    mode: 'create',
  })
  const [form, setForm] = useState<ClientForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Exporting state
  const [exporting, setExporting] = useState(false)

  // Company select state
  const [companies, setCompanies] = useState<Company[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(false)
  const [newCompanyName, setNewCompanyName] = useState('')
  const [creatingCompany, setCreatingCompany] = useState(false)
  const [showNewCompanyInput, setShowNewCompanyInput] = useState(false)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      const { data } = await api.get<PaginatedResponse<Client>>('/clients', { params })
      setClients(data.data)
      setMeta(data.meta)
    } catch {
      toast.error('Erro ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  const loadCompanies = useCallback(async () => {
    if (companies.length > 0) return
    setLoadingCompanies(true)
    try {
      const { data } = await api.get<{ data: Company[] }>('/companies')
      setCompanies(data.data)
    } catch {
      // silently fail — user can still proceed without company list
    } finally {
      setLoadingCompanies(false)
    }
  }, [companies.length])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const openCreate = () => {
    setForm(emptyForm)
    setFormModal({ open: true, mode: 'create' })
    setNewCompanyName('')
    setShowNewCompanyInput(false)
    loadCompanies()
  }

  const openEdit = (client: Client) => {
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone ?? '',
      company_id: client.company_id ?? null,
      status: client.status,
      notes: client.notes ?? '',
    })
    setNewCompanyName('')
    setShowNewCompanyInput(false)
    setFormModal({ open: true, mode: 'edit', client })
    loadCompanies()
  }

  const closeFormModal = () => {
    setFormModal({ open: false, mode: 'create' })
    setShowNewCompanyInput(false)
    setNewCompanyName('')
  }

  const handleCreateCompany = async () => {
    const name = newCompanyName.trim()
    if (!name) return
    setCreatingCompany(true)
    try {
      const { data } = await api.post<{ data: Company }>('/companies', { name })
      const fresh = await api.get<{ data: Company[] }>('/companies')
      setCompanies(fresh.data.data)
      setForm((prev) => ({ ...prev, company_id: data.data.id }))
      setShowNewCompanyInput(false)
      setNewCompanyName('')
      toast.success(`Empresa "${name}" criada!`)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Erro ao criar empresa'
      toast.error(msg)
    } finally {
      setCreatingCompany(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (formModal.mode === 'create') {
        await api.post('/clients', form)
        toast.success('Cliente criado com sucesso!')
      } else if (formModal.client) {
        await api.put(`/clients/${formModal.client.id}`, form)
        toast.success('Cliente atualizado com sucesso!')
      }
      closeFormModal()
      fetchClients()
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Erro ao salvar cliente'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (deleteId === null) return
    setDeleting(true)
    try {
      await api.delete(`/clients/${deleteId}`)
      toast.success('Cliente excluído com sucesso!')
      setDeleteId(null)
      fetchClients()
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Erro ao excluir cliente'
      toast.error(msg)
    } finally {
      setDeleting(false)
    }
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const response = await api.get('/clients/export', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = 'clientes.csv'
      link.click()
      window.URL.revokeObjectURL(url)
      toast.success('CSV exportado com sucesso!')
    } catch {
      toast.error('Erro ao exportar CSV')
    } finally {
      setExporting(false)
    }
  }

  // --- RENDER: Loading skeleton ---
  if (loading && clients.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-9 w-36" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-40" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  // --- RENDER: Empty state ---
  const showEmpty = !loading && clients.length === 0 && !search && !statusFilter

  return (
    <div className="space-y-6 motion-preset-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Clientes</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={exporting}>
            <Download size={16} />
            {exporting ? 'Exportando...' : 'Exportar CSV'}
          </Button>
          <Button onClick={openCreate} size="sm">
            <Plus size={16} />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <Input
            type="text"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <option value="">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
          <option value="lead">Leads</option>
        </select>
      </div>

      {/* Empty state */}
      {showEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Users size={32} className="text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-lg font-medium text-slate-500 dark:text-slate-400">Nenhum cliente cadastrado</p>
          <p className="text-sm mt-1">Clique em "Novo Cliente" para começar.</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                        <td className="px-4 py-3 text-right"><Skeleton className="h-8 w-16 ml-auto" /></td>
                      </tr>
                    ))
                  ) : (
                    clients.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                          {c.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{c.email}</td>
                        <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                          {c.company_name ?? '-'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={STATUS_VARIANTS[c.status]}>
                            {STATUS_LABELS[c.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(c)}
                              title="Editar"
                              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(c.id)}
                              title="Excluir"
                              className="text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Mostrando {meta.from}–{meta.to} de {meta.total}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal Criar/Editar */}
      <Dialog
        open={formModal.open}
        onClose={closeFormModal}
        title={formModal.mode === 'create' ? 'Novo Cliente' : 'Editar Cliente'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome *</label>
            <Input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Nome do cliente"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email *</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Telefone</label>
              <Input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ClientForm['status'] })}
                className="flex h-9 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-slate-700 dark:text-slate-300"
              >
                <option value="lead">Lead</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Empresa</label>
            <div className="flex gap-1">
                <select
                  value={form.company_id ?? ''}
                  onChange={(e) => {
                    const val = e.target.value
                    setForm({ ...form, company_id: val ? Number(val) : null })
                  }}
                  className="flex-1 min-w-0 h-9 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-slate-700 dark:text-slate-300 truncate"
                  disabled={loadingCompanies}
                >
                  <option value="">Sem empresa</option>
                  {companies.map((co) => (
                    <option key={co.id} value={co.id}>
                      {co.name}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => setShowNewCompanyInput((v) => !v)}
                  title="Nova empresa"
                >
                  <Plus size={16} />
                </Button>
              </div>
              {showNewCompanyInput && (
                <div className="flex gap-1 mt-1">
                  <Input
                    type="text"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="Nome da nova empresa"
                    className="flex-1 h-9"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleCreateCompany()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateCompany}
                    disabled={creatingCompany || !newCompanyName.trim()}
                  >
                    {creatingCompany ? '...' : 'Salvar'}
                  </Button>
                </div>
              )}
            </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Observações</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="flex w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-700 dark:text-slate-300"
              placeholder="Notas opcionais..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeFormModal} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal Confirmar Exclusão */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)} title="Excluir cliente">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Tem certeza que deseja remover este cliente? Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="flex-1">
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
