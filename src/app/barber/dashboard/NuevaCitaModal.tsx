"use client";

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { X, Search, Plus, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  barberId: string;
  barbershopId: string;
}

interface Client { id: string; name: string; phone: string | null }
interface Service { id: string; name: string; price: number; duration_minutes: number }

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

const cop = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function nextHourStr() {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return `${String(d.getHours()).padStart(2, '0')}:00`;
}

export function NuevaCitaModal({ isOpen, onClose, onCreated, barberId, barbershopId }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState(nextHourStr());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load services once on open
  useEffect(() => {
    if (!isOpen) return;
    getSupabase()
      .from('services')
      .select('id, name, price, duration_minutes')
      .eq('barbershop_id', barbershopId)
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => setServices(data ?? []));
  }, [isOpen, barbershopId]);

  // Debounced client search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!clientSearch.trim() || clientSearch.length < 2) {
      setClients([]);
      return;
    }
    searchTimeout.current = setTimeout(() => {
      getSupabase()
        .from('clients')
        .select('id, name, phone')
        .eq('barbershop_id', barbershopId)
        .ilike('name', `%${clientSearch}%`)
        .limit(6)
        .then(({ data }) => setClients(data ?? []));
    }, 300);
  }, [clientSearch, barbershopId]);

  const reset = () => {
    setClientSearch('');
    setClients([]);
    setSelectedClient(null);
    setShowNewClientForm(false);
    setNewClientName('');
    setNewClientPhone('');
    setSelectedService(null);
    setDate(todayStr());
    setTime(nextHourStr());
    setNotes('');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleCreateClient = async () => {
    if (!newClientName.trim()) { toast.error('El nombre es obligatorio'); return; }
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('clients')
      .insert({ barbershop_id: barbershopId, name: newClientName.trim(), phone: newClientPhone.trim() || null })
      .select('id, name, phone')
      .single();
    if (error) { toast.error('Error al crear cliente'); return; }
    setSelectedClient(data);
    setShowNewClientForm(false);
    setClientSearch(data.name);
  };

  const handleSubmit = async () => {
    if (!selectedClient) { toast.error('Selecciona un cliente'); return; }
    if (!selectedService) { toast.error('Selecciona un servicio'); return; }
    if (!date || !time) { toast.error('Elige fecha y hora'); return; }

    const scheduledAt = new Date(`${date}T${time}:00`);
    if (isNaN(scheduledAt.getTime())) { toast.error('Fecha u hora inválida'); return; }
    const fin = new Date(scheduledAt.getTime() + selectedService.duration_minutes * 60000);

    setSaving(true);
    const supabase = getSupabase();

    // Conflict check
    const { data: conflicto } = await supabase
      .from('appointments')
      .select('id')
      .eq('barber_id', barberId)
      .in('status', ['confirmed', 'pending'])
      .gte('scheduled_at', scheduledAt.toISOString())
      .lt('scheduled_at', fin.toISOString())
      .maybeSingle();

    if (conflicto) {
      toast.error('Ya tienes una cita en ese horario');
      setSaving(false);
      return;
    }

    const { error } = await supabase.from('appointments').insert({
      barbershop_id: barbershopId,
      barber_id: barberId,
      client_id: selectedClient.id,
      service_id: selectedService.id,
      scheduled_at: scheduledAt.toISOString(),
      status: 'confirmed',
      notes: notes.trim() || null,
      price_charged: selectedService.price,
    });

    setSaving(false);
    if (error) { toast.error('Error al crear la cita'); return; }
    toast.success('Cita creada ✓');
    reset();
    onCreated();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="fixed inset-x-0 bottom-0 z-[210] md:inset-0 md:flex md:items-center md:justify-center pointer-events-none">
        <div className="pointer-events-auto bg-background-secondary border border-border-strong w-full md:max-w-lg max-h-[92dvh] flex flex-col rounded-t-2xl md:rounded-2xl overflow-hidden">

          {/* Handle (mobile) */}
          <div className="w-full flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-12 h-1.5 bg-background-tertiary rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-base font-bold text-text-primary">Nueva cita</h2>
            <button onClick={handleClose} className="p-2 text-text-tertiary hover:text-text-primary rounded-lg">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Fecha</label>
                <input
                  type="date"
                  value={date}
                  min={todayStr()}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-background-tertiary border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Hora</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-background-tertiary border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Client search */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Cliente</label>
              {selectedClient ? (
                <div className="flex items-center justify-between bg-accent/10 border border-accent/30 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{selectedClient.name}</p>
                    {selectedClient.phone && (
                      <p className="text-xs text-text-tertiary">{selectedClient.phone}</p>
                    )}
                  </div>
                  <button
                    onClick={() => { setSelectedClient(null); setClientSearch(''); }}
                    className="text-text-tertiary hover:text-text-primary"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input
                    type="text"
                    placeholder="Buscar cliente por nombre..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="w-full bg-background-tertiary border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
                  />
                  {clients.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background-secondary border border-border rounded-xl shadow-lg z-10 overflow-hidden">
                      {clients.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => { setSelectedClient(c); setClientSearch(c.name); setClients([]); }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-background-tertiary text-left transition-colors"
                        >
                          <div className="w-7 h-7 rounded-full bg-accent-muted flex items-center justify-center text-accent text-xs font-bold shrink-0">
                            {c.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">{c.name}</p>
                            {c.phone && <p className="text-xs text-text-tertiary">{c.phone}</p>}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!selectedClient && (
                <button
                  onClick={() => setShowNewClientForm((v) => !v)}
                  className="flex items-center gap-2 text-xs text-accent hover:underline"
                >
                  <Plus size={13} /> Crear cliente nuevo
                </button>
              )}

              {showNewClientForm && (
                <div className="bg-background-tertiary rounded-xl p-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Nombre *"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full bg-background-primary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                  />
                  <input
                    type="tel"
                    placeholder="Teléfono"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full bg-background-primary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                  />
                  <button
                    onClick={handleCreateClient}
                    className="w-full bg-accent text-white text-sm font-semibold py-2 rounded-lg hover:bg-accent/90"
                  >
                    Guardar cliente
                  </button>
                </div>
              )}
            </div>

            {/* Service */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Servicio</label>
              <div className="space-y-2">
                {services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedService(s)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                      selectedService?.id === s.id
                        ? 'border-accent bg-accent/10'
                        : 'border-border bg-background-tertiary hover:border-border-strong'
                    }`}
                  >
                    <div className="text-left">
                      <p className="text-sm font-medium text-text-primary">{s.name}</p>
                      <p className="text-xs text-text-tertiary">{s.duration_minutes} min</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-text-primary">{cop(s.price)}</span>
                      {selectedService?.id === s.id && (
                        <Check size={16} className="text-accent" />
                      )}
                    </div>
                  </button>
                ))}
                {services.length === 0 && (
                  <p className="text-sm text-text-tertiary text-center py-4">No hay servicios activos</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                Notas <span className="font-normal">(opcional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: cliente pide corte tipo militar..."
                rows={2}
                className="w-full bg-background-tertiary border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-border">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full bg-accent text-white font-bold py-3.5 rounded-xl hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Creando cita...' : 'Crear cita'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
