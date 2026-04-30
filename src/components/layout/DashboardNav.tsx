"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  Users, 
  Scissors, 
  TrendingUp, 
  UserCircle, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Plus,
  Zap,
  CreditCard,
  Lock
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';

const mainNavItems = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/agenda', label: 'Agenda', icon: Calendar },
  { href: '/dashboard/clientes', label: 'Clientes', icon: Users },
  { href: '/dashboard/servicios', label: 'Servicios', icon: Scissors },
  { href: '/dashboard/barberos', label: 'Barberos', icon: UserCircle },
  { href: '/dashboard/reportes', label: 'Reportes', icon: TrendingUp },
  { href: '/dashboard/retencion', label: 'Retención', icon: Users, filoProOnly: true },
];

const secondaryNavItems = [
  { href: '/dashboard/automatizaciones', label: 'Automatizaciones', icon: Zap, filoProOnly: true },
  { href: '/dashboard/billing', label: 'Facturación', icon: CreditCard },
  { href: '/dashboard/configuracion', label: 'Configuración', icon: Settings },
];

export const Sidebar = ({ negocio, userName = "Owner", isFiloPro = true }: { negocio: string, userName?: string, isFiloPro?: boolean }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const NavItemRender = ({ item }: { item: any }) => {
    const isLocked = item.filoProOnly && !isFiloPro;
    const targetHref = isLocked ? '/dashboard/billing' : item.href;
    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
    
    return (
      <Link 
        key={item.href} 
        href={targetHref}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
          isActive && !isLocked
          ? 'bg-accent-muted text-accent font-medium' 
          : 'text-text-tertiary hover:bg-background-tertiary hover:text-text-primary'
        } ${isCollapsed ? 'justify-center' : ''}`}
      >
        {isLocked ? (
          <Lock size={18} className="text-text-tertiary group-hover:text-accent opacity-50" />
        ) : (
          <item.icon size={18} className={isActive ? 'text-accent' : 'group-hover:text-text-primary'} />
        )}
        {!isCollapsed && (
          <div className="flex-1 flex items-center justify-between">
            <span className={`text-[13px] ${isLocked ? 'opacity-70' : ''}`}>{item.label}</span>
            {isLocked ? (
              <span className="bg-accent/10 text-accent border border-accent/20 text-[9px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                <Lock size={8} /> Pro
              </span>
            ) : item.badge && (
              <span className="bg-accent-muted text-accent text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                {item.badge}
              </span>
            )}
          </div>
        )}
      </Link>
    );
  };

  return (
    <aside className={`hidden md:flex flex-col bg-background-primary border-r border-border transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-[220px]'}`}>
      {/* Header / Logo */}
      <div className="px-5 py-6 border-b border-border flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex flex-col">
            <p className="text-base font-semibold text-text-primary">Trimly</p>
            <p className="text-xs text-text-tertiary mt-0.5 truncate max-w-[140px]">{negocio}</p>
          </div>
        ) : (
          <div className="text-base font-semibold text-text-primary text-center w-full">T</div>
        )}
      </div>

      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex justify-center py-2 bg-background-secondary border-b border-border hover:bg-background-tertiary text-text-secondary hover:text-text-primary transition-colors"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {mainNavItems.map(item => <NavItemRender key={item.href} item={item} />)}
        
        <div className="pt-4 mt-4 border-t border-border space-y-1">
          {secondaryNavItems.map(item => <NavItemRender key={item.href} item={item} />)}
        </div>
      </nav>

      {/* Footer del sidebar — perfil */}
      <div className="px-3 py-4 border-t border-border">
        {!isCollapsed ? (
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-background-tertiary cursor-pointer transition-colors flex-1 min-w-0">
              <Avatar initials={userInitials} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{userName}</p>
                <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Owner</p>
              </div>
            </div>
            
            <form action="/auth/signout" method="post">
              <button title="Cerrar sesión" type="submit" className="text-text-tertiary hover:text-danger p-2 rounded-lg hover:bg-danger-bg transition-colors">
                <LogOut size={16} />
              </button>
            </form>
          </div>
        ) : (
          <form action="/auth/signout" method="post" className="w-full flex justify-center">
            <button title="Cerrar sesión" type="submit" className="text-text-tertiary hover:text-danger p-2 rounded-lg hover:bg-danger-bg transition-colors">
              <LogOut size={18} />
            </button>
          </form>
        )}
      </div>
    </aside>
  );
};

export const BottomNav = ({ isFiloPro = true }: { isFiloPro?: boolean }) => {
  const pathname = usePathname();

  const mobileItems = [
    { href: '/dashboard', label: 'Hoy', icon: Home },
    { href: '/dashboard/agenda', label: 'Agenda', icon: Calendar },
    { href: '?new=1', label: '+', icon: Plus, special: true }, // Opens Modal globally
    { href: '/dashboard/clientes', label: 'Clientes', icon: Users },
    { href: '/dashboard/reportes', label: 'Más', icon: TrendingUp },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background-primary border-t border-border flex items-center justify-around px-2 py-2 pb-safe z-50">
      {mobileItems.map((item) => {
        const isActive = pathname === item.href;
        
        if (item.special) {
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="w-12 h-12 rounded-full bg-accent text-background-primary flex items-center justify-center -mt-6 shadow-lg shadow-accent/20 active:scale-95 transition-transform"
            >
              <item.icon size={24} strokeWidth={2.5} />
            </Link>
          );
        }

        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-all duration-200 p-2 ${
              isActive ? 'text-accent' : 'text-text-tertiary'
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
