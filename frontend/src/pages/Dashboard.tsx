import { useEffect, useState } from 'react'
import { Users, UserCheck, UserX, Sparkles } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import api from '@/lib/api'
import type { DashboardStats } from '@/types'

const COLORS = ['#6366f1', '#94a3b8', '#f59e0b']

const cards = [
  { key: 'total', label: 'Total de Clientes', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { key: 'active', label: 'Ativos', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'inactive', label: 'Inativos', icon: UserX, color: 'text-slate-600', bg: 'bg-slate-50' },
  { key: 'leads', label: 'Leads', icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-50' },
]

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard').then(({ data }: { data: { data: DashboardStats } }) => {
      setStats(data.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!stats) return null

  const chartData = [
    { name: 'Ativos', value: stats.active },
    { name: 'Inativos', value: stats.inactive },
    { name: 'Leads', value: stats.leads },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h2>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ key, label, icon: Icon, color, bg }) => (
          <div key={key} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">{label}</span>
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon size={20} className={color} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800">{stats[key as keyof DashboardStats]}</p>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Distribuição de Clientes</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
