'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard, Calendar, Users, Scissors,
  ShoppingBag, Wallet, Tag, Star, BarChart3,
  TrendingUp, Gift, Settings, Link2,
  Building2, ChevronRight, Menu, Bell,
  LogOut, Zap, CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MiloPanel } from '@/components/milo/MiloPanel'
import { TrimlyLogo } from '@/components/ui/TrimlyLogo'
import miloImg from '@/assets/milo.png'

const NAV_SECTIONS = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard',          icon: LayoutDashboard, label: 'Inicio' },
      { href: '/dashboard/agenda',   icon: Calendar,        label: 'Agenda' },
      { href: '/dashboard/clientes', icon: Users,           label: 'Clientes' },
      { href: '/dashboard/reportes', icon: BarChart3,       label: 'Ingresos' },
    ],
  },
  {
    label: 'Gestión',
    items: [
      { href: '/dashboard/servicios',        icon: Scissors,    label: 'Servicios' },
      { href: '/dashboard/productos',        icon: ShoppingBag, label: 'Productos' },
      { href: '/dashboard/automatizaciones', icon: Zap,         label: 'Automatizaciones' },
      { href: '/dashboard/cupones',          icon: Tag,         label: 'Cupones' },
      { href: '/dashboard/pases',            icon: CreditCard,  label: 'Pases' },
      { href: '/dashboard/resenas',          icon: Star,        label: 'Reseñas' },
    ],
  },
  {
    label: 'Equipo y Negocio',
    items: [
      { href: '/dashboard/equipo',    icon: Users,      label: 'Equipo' },
      { href: '/dashboard/nomina',    icon: Wallet,     label: 'Nómina' },
      { href: '/dashboard/metricas',  icon: TrendingUp, label: 'Métricas',
        badge: 'Pro', badgeVariant: 'primary' as const },
      { href: '/dashboard/referidos', icon: Gift,       label: 'Referidos',
        badge: 'Nuevo', badgeVariant: 'success' as const },
    ],
  },
  {
    label: 'Configuración',
    items: [
      { href: '/dashboard/pagina',        icon: Link2,     label: 'Mi página' },
      { href: '/dashboard/sedes',         icon: Building2, label: 'Sedes' },
      { href: '/dashboard/configuracion', icon: Settings,  label: 'Configuración' },
    ],
  },
]

const PAGE_LABELS: Record<string, string> = {
  '/dashboard': 'Inicio',
  '/dashboard/agenda': 'Agenda',
  '/dashboard/clientes': 'Clientes',
  '/dashboard/reportes': 'Ingresos',
  '/dashboard/servicios': 'Servicios',
  '/dashboard/productos': 'Productos',
  '/dashboard/automatizaciones': 'Automatizaciones',
  '/dashboard/cupones': 'Cupones',
  '/dashboard/pases': 'Pases',
  '/dashboard/resenas': 'Reseñas',
  '/dashboard/equipo': 'Equipo',
  '/dashboard/nomina': 'Nómina',
  '/dashboard/metricas': 'Métricas',
  '/dashboard/referidos': 'Referidos',
  '/dashboard/pagina': 'Mi página',
  '/dashboard/sedes': 'Sedes',
  '/dashboard/configuracion': 'Configuración',
}

interface DashboardLayoutClientProps {
  children: React.ReactNode
  negocio: string
  userName: string
  isTrial: boolean
  trialDaysLeft: number
}

export function DashboardLayoutClient({
  children,
  negocio,
  userName,
  isTrial,
  trialDaysLeft,
}: DashboardLayoutClientProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [miloOpen, setMiloOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const pageLabel = PAGE_LABELS[pathname] ??
    pathname.split('/').pop()?.replace(/-/g, ' ') ?? 'Dashboard'

  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* ── MOBILE OVERLAY ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full z-50 flex flex-col',
          'bg-background-2 border-r border-border',
          'transition-all duration-300 ease-in-out',
          // Desktop
          'hidden md:flex',
          collapsed ? 'md:w-16' : 'md:w-[240px]',
          // Mobile override
          sidebarOpen
            ? '!flex w-[240px] translate-x-0'
            : '!flex w-[240px] -translate-x-full md:translate-x-0',
        )}
      >
        {/* LOGO */}
        <div
          className={cn(
            'flex items-center h-14 px-4 border-b border-border flex-shrink-0',
            collapsed ? 'justify-center' : 'justify-between',
          )}
        >
          {!collapsed && (
            <TrimlyLogo href="/dashboard" size={28} textClassName="text-sm" />
          )}
          {collapsed && (
            <TrimlyLogo href="/dashboard" size={28} showText={false} />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center w-6 h-6 text-text-muted hover:text-text-primary transition-colors"
          >
            <ChevronRight
              size={14}
              className={cn(
                'transition-transform duration-300',
                collapsed ? '' : 'rotate-180',
              )}
            />
          </button>
        </div>

        {/* NAV */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <p className="px-3 mb-1 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
                  {section.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href))
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg',
                          'text-sm transition-all duration-150 group relative',
                          isActive
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-text-secondary hover:bg-background-3 hover:text-text-primary',
                          collapsed && 'justify-center px-2',
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        <item.icon
                          size={16}
                          className={cn(
                            'flex-shrink-0 transition-colors',
                            isActive
                              ? 'text-primary'
                              : 'text-text-muted group-hover:text-text-secondary',
                          )}
                        />
                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate">{item.label}</span>
                            {item.badge && (
                              <span
                                className={cn(
                                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                                  item.badgeVariant === 'primary'
                                    ? 'bg-primary/15 text-primary'
                                    : 'bg-success/15 text-success',
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* SIDEBAR FOOTER */}
        <div className="border-t border-border p-3 flex-shrink-0 space-y-1">
          {/* Milo */}
          <button
            onClick={() => setMiloOpen(true)}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-lg',
              'text-sm text-text-muted hover:bg-background-3 hover:text-text-primary',
              'transition-all duration-150 group',
              collapsed && 'justify-center',
            )}
          >
            <Image
              src={miloImg}
              alt="Milo"
              width={20}
              height={20}
              className="flex-shrink-0 group-hover:animate-float"
            />
            {!collapsed && (
              <span className="font-medium text-xs">Ayuda con Milo</span>
            )}
          </button>

          {/* Profile + logout */}
          <div
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-lg',
              'text-sm text-text-secondary',
              collapsed && 'justify-center',
            )}
          >
            <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
              {userInitials.charAt(0)}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text-primary truncate">{negocio}</p>
              </div>
            )}
            {!collapsed && (
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  title="Cerrar sesión"
                  className="text-text-muted hover:text-danger transition-colors p-1 rounded"
                >
                  <LogOut size={13} />
                </button>
              </form>
            )}
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 overflow-hidden',
          'transition-all duration-300',
          collapsed ? 'md:ml-16' : 'md:ml-[240px]',
        )}
      >
        {/* TRIAL BANNER */}
        {isTrial && (
          <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-xs font-bold text-primary uppercase tracking-wider">
                Prueba gratuita · Quedan {trialDaysLeft} días
              </p>
            </div>
            <Link
              href="/dashboard/billing"
              className="text-[10px] font-black bg-primary text-text-inverse px-3 py-1 rounded-full hover:scale-105 transition-all"
            >
              VER PLANES
            </Link>
          </div>
        )}

        {/* TOPBAR */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 md:px-6 border-b border-border bg-background-2 sticky top-0 z-20">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-background-3 text-text-secondary transition-colors"
          >
            <Menu size={18} />
          </button>

          {/* Breadcrumb — desktop */}
          <div className="hidden md:flex items-center gap-1.5 text-sm">
            <span className="text-text-muted">Trimly</span>
            <ChevronRight size={12} className="text-border-strong" />
            <span className="text-text-primary font-medium capitalize">{pageLabel}</span>
          </div>

          {/* Logo — mobile */}
          <div className="md:hidden">
            <TrimlyLogo href="/dashboard" size={24} textClassName="text-sm" />
          </div>

          {/* Topbar actions */}
          <div className="flex items-center gap-2">
            <button className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-background-3 text-text-secondary hover:text-text-primary transition-colors">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 pb-20 md:pb-6 animate-fadeIn">
            {children}
          </div>
        </main>
      </div>

      {/* ── MOBILE TAB BAR ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background-2 border-t border-border flex items-center justify-around px-2 py-2 md:hidden">
        {[
          { href: '/dashboard',          icon: LayoutDashboard, label: 'Inicio' },
          { href: '/dashboard/agenda',   icon: Calendar,        label: 'Agenda' },
          { href: '/dashboard/clientes', icon: Users,           label: 'Clientes' },
        ].map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl',
                'text-[10px] font-medium transition-all duration-150',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-text-muted hover:text-text-secondary',
              )}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-[10px] font-medium text-text-muted hover:text-text-secondary transition-all duration-150"
        >
          <Menu size={18} />
          <span>Más</span>
        </button>
      </nav>

      {/* ── MILO PANEL ── */}
      <MiloPanel isOpen={miloOpen} onClose={() => setMiloOpen(false)} />
    </div>
  )
}
