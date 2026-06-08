import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, LogOut, Moon, Sun, UserCircle, Building2, Menu, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar as AvatarComponent } from '@/components/ui/Avatar'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const closeSidebar = () => setSidebarOpen(false)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
    }`

  const navLinks = (
    <>
      <NavLink to="/dashboard" className={linkClass} onClick={closeSidebar}>
        <LayoutDashboard size={20} /> Dashboard
      </NavLink>
      <NavLink to="/clients" className={linkClass} onClick={closeSidebar}>
        <Users size={20} /> Clientes
      </NavLink>
      <NavLink to="/companies" className={linkClass} onClick={closeSidebar}>
        <Building2 size={20} /> Empresas
      </NavLink>
      <NavLink to="/profile" className={linkClass} onClick={closeSidebar}>
        <UserCircle size={20} /> Perfil
      </NavLink>
    </>
  )

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">ClientFlow</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Mini CRM</p>
        </div>
        <button onClick={closeSidebar} className="lg:hidden p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1">{navLinks}</nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <AvatarComponent name={user?.name ?? '?'} size="sm" />
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { navigate('/profile'); closeSidebar() }}>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{user?.name}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
          </div>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500" title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={handleLogout} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600" title="Sair">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={closeSidebar} />
      )}

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col shadow-sm shrink-0">
        {sidebarContent}
      </aside>

      {/* Sidebar mobile */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col shadow-xl transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button onClick={() => setSidebarOpen(true)} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
            <Menu size={22} />
          </button>
          <h1 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">ClientFlow</h1>
        </div>
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
