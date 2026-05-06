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
  Lock,
  Menu,
  X,
  BarChart3,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';

const mainNavItems = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/agenda', label: 'Agenda', icon: Calendar },
  { href: '/dashboard/clientes', label: 'Clientes', icon: Users },
  { href: '/dashboard/servicios', label: 'Servicios', icon: Scissors },
  { href: '/dashboard/barberos', label: 'Barberos', icon: UserCircle },
  { href: '/dashboard/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/dashboard/retencion', label: 'Retención', icon: TrendingUp, filoProOnly: true },
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

export const BottomNav = ({ isFiloPro = true, negocio = "Trimly", userName = "Owner" }: { isFiloPro?: boolean, negocio?: string, userName?: string }) => {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const allItems = [...mainNavItems, ...secondaryNavItems];

  const NavLink = ({ item, onClick }: { item: any, onClick?: () => void }) => {
    const isLocked = item.filoProOnly && !isFiloPro;
    const targetHref = isLocked ? '/dashboard/billing' : item.href;
    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

    return (
      <Link
        href={targetHref}
        onClick={onClick}
        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
          isActive && !isLocked
            ? 'bg-accent-muted text-accent font-semibold'
            : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
        }`}
      >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isActive && !isLocked ? 'bg-accent/15' : 'bg-background-tertiary'}`}>
          {isLocked ? (
            <Lock size={18} className="text-text-tertiary opacity-50" />
          ) : (
            <item.icon size={18} className={isActive ? 'text-accent' : ''} />
          )}
        </div>
        <span className="text-sm font-medium flex-1">{item.label}</span>
        {isLocked && (
          <span className="bg-accent/10 text-accent border border-accent/20 text-[9px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-1">
            <Lock size={8} /> Pro
          </span>
        )}
        {isActive && !isLocked && (
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
        )}
      </Link>
    );
  };

  // 5 quick-access items for the bottom bar
  const quickItems = [
    { href: '/dashboard', label: 'Inicio', icon: Home },
    { href: '/dashboard/agenda', label: 'Agenda', icon: Calendar },
    { href: '?new=1', label: '+', icon: Plus, special: true },
    { href: '/dashboard/clientes', label: 'Clientes', icon: Users },
  ];

  return (
    <>
      {/* Bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background-primary/95 backdrop-blur-xl border-t border-border flex items-center justify-around px-2 py-2 pb-safe z-50">
        {quickItems.map((item) => {
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

        {/* Menu button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className={`flex flex-col items-center gap-1 transition-all duration-200 p-2 ${
            drawerOpen ? 'text-accent' : 'text-text-tertiary'
          }`}
        >
          <Menu size={20} />
          <span className="text-[10px] font-medium">Menú</span>
        </button>
      </nav>

      {/* Drawer overlay */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Slide-up drawer */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-[70] bg-background-secondary border-t border-border rounded-t-3xl transition-transform duration-300 ease-out shadow-2xl ${
          drawerOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '85dvh' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-border-strong rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Scissors size={16} className="text-background-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">Trimly</p>
              <p className="text-xs text-text-tertiary truncate max-w-[160px]">{negocio}</p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 rounded-full bg-background-tertiary flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable nav list */}
        <div className="overflow-y-auto px-3 py-4 space-y-1" style={{ maxHeight: 'calc(85dvh - 160px)' }}>
          <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest px-4 mb-2">Principal</p>
          {mainNavItems.map(item => (
            <NavLink key={item.href} item={item} onClick={() => setDrawerOpen(false)} />
          ))}

          <div className="h-px bg-border mx-4 my-3" />

          <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest px-4 mb-2">Más opciones</p>
          {secondaryNavItems.map(item => (
            <NavLink key={item.href} item={item} onClick={() => setDrawerOpen(false)} />
          ))}
        </div>

        {/* Footer with user info + logout */}
        <div className="px-4 py-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accent-muted flex items-center justify-center text-accent font-bold text-sm">
              {userInitials}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{userName}</p>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Owner</p>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex items-center gap-2 text-xs text-text-tertiary hover:text-danger px-3 py-2 rounded-lg hover:bg-danger-bg transition-colors"
            >
              <LogOut size={14} />
              Salir
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
