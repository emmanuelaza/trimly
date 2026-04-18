"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  Users, 
  Scissors, 
  DollarSign, 
  TrendingUp, 
  UserCircle, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Plus
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/agenda', label: 'Agenda', icon: Calendar },
  { href: '/dashboard/clientes', label: 'Clientes', icon: Users },
  { href: '/dashboard/servicios', label: 'Servicios', icon: Scissors },
  { href: '/dashboard/reportes', label: 'Reportes', icon: TrendingUp },
  { href: '/dashboard/barberos', label: 'Barberos', icon: UserCircle },
  { href: '/dashboard/configuracion', label: 'Configuración', icon: Settings },
];

export const Sidebar = ({ negocio }: { negocio: string }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside className={`hidden md:flex flex-col bg-background-secondary border-r border-border transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-[220px]'}`}>
      {/* Header / Logo */}
      <div className="p-4 border-b border-border flex items-center justify-between overflow-hidden min-h-[72px]">
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tighter text-text-primary">Trimly</span>
            <span className="text-[10px] text-text-secondary uppercase tracking-widest truncate max-w-[140px]">{negocio}</span>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-background-tertiary text-text-secondary hover:text-text-primary transition-colors mx-auto"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 flex flex-col gap-1.5 mt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive 
                ? 'bg-accent-muted text-accent font-medium' 
                : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
              }`}
            >
              <item.icon size={18} className={isActive ? 'text-accent' : 'group-hover:text-text-primary'} />
              {!isCollapsed && <span className="text-[13px]">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Sign Out */}
      <div className="p-3 border-t border-border">
        <form action="/auth/signout" method="post">
          <button 
            type="submit"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-danger hover:bg-danger-bg transition-all duration-200 ${isCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={18} />
            {!isCollapsed && <span className="text-[13px] font-medium">Cerrar sesión</span>}
          </button>
        </form>
      </div>
    </aside>
  );
};

export const BottomNav = () => {
  const pathname = usePathname();

  const mobileItems = [
    { href: '/dashboard', label: 'Hoy', icon: Home },
    { href: '/dashboard/agenda', label: 'Agenda', icon: Calendar },
    { href: '?new=1', label: '+', icon: Plus, special: true }, // Opens Modal globally
    { href: '/dashboard/clientes', label: 'Clientes', icon: Users },
    { href: '/dashboard/configuracion', label: 'Más', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background-secondary border-t border-border flex items-center justify-around px-2 py-2 pb-safe z-40">
      {mobileItems.map((item) => {
        const isActive = pathname === item.href;
        
        if (item.special) {
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="w-12 h-12 rounded-full bg-accent text-background-primary flex items-center justify-center -mt-6 shadow-none border-4 border-background-primary transition-transform active:scale-[0.98]"
            >
              <item.icon size={24} strokeWidth={3} />
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
