"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, MessageCircle } from 'lucide-react';
import { Card, Avatar, Badge, Input } from '@/components/ui/RedesignComponents';

export default function ClientesList({ clientes }: { clientes: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('Todos');

  const filteredClientes = clientes.filter((c: any) =>
    (c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm))) &&
    (filter === 'Todos' || (filter==='VIP' && c.vip))
  );

  const getInitials = (n: string) => n ? n.substring(0, 2).toUpperCase() : "C";

  return (
    <div className="space-y-6">
      {/* Search and Filters bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
          <Input 
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {['Todos', 'Regulares', 'Inactivos', 'VIP'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors whitespace-nowrap ${
                filter === f 
                ? 'bg-accent-muted text-accent border-accent/20' 
                : 'bg-background-secondary text-text-tertiary border-border hover:text-text-secondary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Clientes Grid/Table */}
      <div className="grid grid-cols-1 gap-3">
        {filteredClientes.length === 0 ? (
           <Card className="flex flex-col items-center py-12 text-center border-dashed">
             <div className="w-12 h-12 rounded-full bg-background-tertiary flex items-center justify-center mb-4 text-text-tertiary">
                <Search size={24} />
             </div>
             <p className="text-sm text-text-secondary">No hay clientes q coincidan</p>
           </Card>
        ) : (
          filteredClientes.map((c: any) => (
            <Link key={c.id} href={`/dashboard/clientes/${c.id}`} className="group block">
              <Card className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-border-strong transition-all">
                
                {/* Meta info */}
                <div className="flex items-center gap-4 flex-1">
                  <Avatar initials={getInitials(c.name)} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-text-primary">{c.name}</p>
                      {c.vip && <Badge variant="info">VIP</Badge>}
                    </div>
                    <p className="text-xs text-text-tertiary mt-0.5">{c.phone || "Sin teléfono"}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full md:w-auto text-left md:text-right mt-4 md:mt-0">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary mb-1">Última Visita</p>
                    <p className="text-sm text-text-secondary font-medium">Hace 2 sem</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary mb-1">Visitas</p>
                    <p className="text-sm text-text-primary font-mono font-medium">12</p>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary mb-1">Total Compras</p>
                    <p className="text-sm text-text-secondary font-mono">$450,000</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="hidden md:flex items-center gap-3">
                  <ChevronRight size={18} className="text-text-tertiary group-hover:text-text-primary transition-colors" />
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
