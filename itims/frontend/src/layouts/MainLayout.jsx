// Main admin layout: collapsible left sidebar + top navbar + page content
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Monitor, Network, Globe, ShieldCheck, Wifi, Server, Cctv, Ticket,
  FileBarChart, Users, LogOut, Menu, ChevronsLeft, Binary, Cpu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isDemoMode } from '../config';

// Sidebar menu (12 modules + user management for admin)
const MENU = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/computers', label: 'Computer & Hardware', icon: Monitor },
  { to: '/ips', label: 'IP Address Management', icon: Binary },
  { to: '/network', label: 'Network Management', icon: Network },
  { to: '/isp', label: 'ISP Management', icon: Globe },
  { to: '/firewall', label: 'Firewall & Security', icon: ShieldCheck },
  { to: '/wifi', label: 'Wi-Fi & AP', icon: Wifi },
  { to: '/servers', label: 'Server Room', icon: Server },
  { to: '/cctv', label: 'CCTV Management', icon: Cctv },
  { to: '/complaints', label: 'IT Complaints', icon: Ticket },
  { to: '/reports', label: 'Reports & Analytics', icon: FileBarChart },
  { to: '/users', label: 'User Management', icon: Users, admin: true },
];

export default function MainLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);   // desktop: icons only
  const [mobileOpen, setMobileOpen] = useState(false); // mobile: slide-in menu

  const initials = user?.name?.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen">
      {/* Dark overlay on mobile when menu is open */}
      {mobileOpen && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* ---------- SIDEBAR ---------- */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-slate-900 text-slate-300 transition-all duration-300
        ${collapsed ? 'lg:w-20' : 'lg:w-64'} w-64 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-900/50">
            <Cpu className="h-5 w-5" />
          </div>
          {!collapsed && <div><p className="font-bold leading-tight text-white">ITIMS</p><p className="text-[11px] text-slate-400">IT Infrastructure Mgmt</p></div>}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {MENU.filter((m) => !m.admin || isAdmin).map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.to === '/'}
              onClick={() => setMobileOpen(false)}
              title={m.label}
              className={({ isActive }) => `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition
                ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'hover:bg-white/5 hover:text-white'}`}
            >
              <m.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{m.label}</span>}
            </NavLink>
          ))}
        </nav>

        <button onClick={() => setCollapsed(!collapsed)} className="m-3 hidden items-center justify-center gap-2 rounded-lg py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-white lg:flex cursor-pointer">
          <ChevronsLeft className={`h-4 w-4 transition ${collapsed ? 'rotate-180' : ''}`} /> {!collapsed && 'Collapse'}
        </button>
      </aside>

      {/* ---------- MAIN AREA ---------- */}
      <div className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Top navbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6">
          <button className="icon-btn lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button>
          <p className="hidden text-sm text-slate-500 lg:block">Welcome back, <b className="text-slate-800">{user?.name}</b></p>
          <div className="flex items-center gap-3">
            {isDemoMode && <span className="hidden rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 sm:inline">DEMO · sample data only</span>}
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
              <p className="text-xs text-indigo-600">{user?.role === 'ADMIN' ? 'Administrator' : 'IT Staff'}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-sm font-bold text-white">{initials}</div>
            <button onClick={() => { logout(); navigate('/login'); }} title="Logout" className="btn-light !px-3"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">Logout</span></button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
