import { useEffect, useState } from 'react'
import { Users, UserCheck, UserX, Sparkles, Building2, Download, TrendingUp, DollarSign, Clock3, BarChart3 } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { DashboardStats, Client } from '@/types'

const COLORS = ['#6366f1', '#94a3b8', '#f59e0b']

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativo', inactive: 'Inativo', lead: 'Lead',
}

interface MonthlyData {
  month: string
  total: number
  count: number
}

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun',
  '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentClients, setRecentClients] = useState<Client[]>([])
  const [monthlySales, setMonthlySales] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/dashboard'),
      api.get('/clients/recent'),
      api.get('/sales/monthly'),
    ]).then(([statsRes, recentRes, monthlyRes]) => {
      setStats(statsRes.data.data)
      setRecentClients(recentRes.data.data)
      setMonthlySales(monthlyRes.data.data ?? [])
    }).catch(() => toast.error('Erro ao carregar dashboard'))
      .finally(() => setLoading(false))
  }, [])

  const handleExport = async () => {
    try {
      const response = await api.get('/clients/export', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url; link.download = 'clientes.csv'; link.click()
      toast.success('CSV exportado com sucesso!')
    } catch { toast.error('Erro ao exportar CSV') }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-6 w-24 mt-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-80 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!stats) return null

  const chartData = [
    { name: 'Ativos', value: stats.active },
    { name: 'Inativos', value: stats.inactive },
    { name: 'Leads', value: stats.leads },
  ]

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(v)

  const salesCards = stats.sales ? [
    { label: 'Receita Total', value: formatCurrency(stats.sales.total_revenue), icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
    { label: 'Este Mês', value: formatCurrency(stats.sales.this_month), icon: TrendingUp, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
    { label: 'Pendente', value: formatCurrency(stats.sales.pending_amount), icon: Clock3, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
  ] : []

  const cards = [
    { label: 'Total de Clientes', value: stats.total, icon: Users, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
    { label: 'Ativos', value: stats.active, icon: UserCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
    { label: 'Inativos', value: stats.inactive, icon: UserX, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800' },
    { label: 'Leads', value: stats.leads, icon: Sparkles, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
    { label: 'Empresas', value: (stats as any).company_count ?? 0, icon: Building2, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
  ]

  const monthlyChartData = monthlySales.map((m) => {
    const [, month] = m.month.split('-')
    return { month: MONTH_LABELS[month] ?? month, total: m.total, count: m.count }
  })

  const formatTooltip = (value: any) => formatCurrency(Number(value))

  return (
    <div className="space-y-6 motion-preset-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h2>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download size={16} /> Exportar CSV
        </Button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon size={20} className={color} />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales Cards */}
      {salesCards.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mt-2">Financeiro</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {salesCards.map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
                    <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                      <Icon size={20} className={color} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Monthly Sales Chart */}
      {monthlySales.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 size={20} /> Vendas por Mês</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={formatTooltip} />
                <Bar dataKey="total" name="Receita" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Charts + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp size={20} /> Distribuição de Clientes</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent clients */}
        <Card>
          <CardHeader><CardTitle>Clientes Recentes</CardTitle></CardHeader>
          <CardContent>
            {recentClients.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Nenhum cliente cadastrado ainda.</p>
            ) : (
              <div className="space-y-3">
                {recentClients.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.company_name ?? c.email}</p>
                    </div>
                    <Badge variant={c.status === 'active' ? 'success' : c.status === 'lead' ? 'warning' : 'default'}>
                      {STATUS_LABELS[c.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
