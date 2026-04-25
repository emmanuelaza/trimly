"use client"

import React, { useState, useTransition, useMemo } from "react"
import { Search, Plus, Calendar, Clock, Scissors, User2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { createAppointment, updateAppointment } from "@/app/actions/appointments"
import { createClient } from "@/app/actions/clients"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

interface Props {
  clientes: any[]
  servicios: any[]
  barberos: any[]
  onSuccess: () => void
  initialDate?: string
  editingAppointment?: any
}

export function AppointmentForm({ clientes, servicios, barberos, onSuccess, initialDate, editingAppointment }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [clientSearch, setClientSearch] = useState(editingAppointment ? editingAppointment.client?.name : "")
  
  // Form local state
  const [clientId, setClientId] = useState(editingAppointment?.client_id || "")
  const [serviceId, setServiceId] = useState(editingAppointment?.service_id || "")
  const [barberId, setBarberId] = useState(editingAppointment?.barber_id || "")
  const [date, setDate] = useState(editingAppointment ? new Date(editingAppointment.scheduled_at).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }) : (initialDate || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })))
  const [time, setTime] = useState(editingAppointment ? new Date(editingAppointment.scheduled_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Bogota' }) : "")

  const filteredClients = useMemo(() => {
    if (!clientSearch || clientId) return []
    return clientes.filter(c => 
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
      c.phone?.includes(clientSearch)
    ).slice(0, 5)
  }, [clientSearch, clientes, clientId])

  const availableSlots = useMemo(() => {
    const slots = []
    const startHour = 8
    const endHour = 20
    
    // Simplificación: Slots cada 30 min o cada duración del servicio
    const svc = servicios.find(s => s.id === serviceId)
    const interval = svc ? svc.duration_minutes || 45 : 30
    
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hh = String(h).padStart(2, '0')
        const mm = String(m).padStart(2, '0')
        slots.push(`${hh}:${mm}`)
      }
    }
    return slots
  }, [serviceId, servicios])

  const handleCreateClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await createClient(fd)
      if (res.success) {
        toast.success("Cliente creado")
        setClientId(res.data.id)
        setClientSearch(res.data.name)
        setShowNewClientForm(false)
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!clientId || !serviceId || !barberId || !date || !time) {
      return toast.error("Completa todos los campos")
    }

    const fd = new FormData()
    fd.set("client_id", clientId)
    fd.set("service_id", serviceId)
    fd.set("barber_id", barberId)
    fd.set("fecha", date)
    fd.set("hora", time)
    if (editingAppointment) fd.set("status", editingAppointment.status)

    startTransition(async () => {
      const res = editingAppointment 
        ? await updateAppointment(editingAppointment.id, fd)
        : await createAppointment(fd)
        
      if (res.success) {
        toast.success(editingAppointment ? "Cita actualizada" : "Cita agendada")
        router.refresh()
        onSuccess()
      } else {
        toast.error(res.error)
      }
    })
  }

  if (showNewClientForm) {
    return (
      <form onSubmit={handleCreateClient} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <h4 className="text-sm font-bold text-text-secondary uppercase">Nuevo Cliente</h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Nombre</label>
            <input name="nombre" required className="w-full bg-background-tertiary border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors" placeholder="Juan Pérez" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Teléfono</label>
            <input name="telefono" className="w-full bg-background-tertiary border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors" placeholder="+57..." />
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <Button variant="secondary" type="button" className="flex-1" onClick={() => setShowNewClientForm(false)}>Cancelar</Button>
          <Button type="submit" className="flex-1" disabled={isPending}>Crear y Usar</Button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Cliente */}
      <div className="space-y-2 relative">
        <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1 flex justify-between items-end">
          <span>Cliente</span>
          <button type="button" onClick={() => setShowNewClientForm(true)} className="text-accent hover:underline lowercase font-medium">o + nuevo cliente</button>
        </label>
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input 
            value={clientSearch}
            onChange={(e) => {
              setClientSearch(e.target.value)
              if (clientId) setClientId("")
            }}
            placeholder="Buscar por nombre o teléfono..."
            disabled={!!clientId}
            className={`w-full bg-background-tertiary border border-border rounded-xl pl-12 pr-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors ${clientId ? "bg-accent/10 border-accent/30 text-accent font-medium" : ""}`}
          />
          {clientId && (
            <button type="button" onClick={() => { setClientId(""); setClientSearch(""); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-text-tertiary hover:text-danger">quitar</button>
          )}
        </div>
        
        {/* Results dropdown */}
        {filteredClients.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-background-primary border border-border rounded-xl shadow-xl overflow-hidden py-1">
            {filteredClients.map((c: any) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { setClientId(c.id); setClientSearch(c.name); }}
                className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-tertiary transition-colors flex justify-between"
              >
                <span>{c.name}</span>
                <span className="text-text-tertiary text-xs">{c.phone}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Servicio */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1 flex items-center gap-2"><Scissors size={10} /> Servicio</label>
        <select 
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          required
          className="w-full bg-background-tertiary border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent appearance-none transition-colors"
        >
          <option value="">Selecciona un servicio</option>
          {servicios.map(s => (
            <option key={s.id} value={s.id}>{s.name} — ${Number(s.price).toLocaleString()}</option>
          ))}
        </select>
      </div>

      {/* 3. Barbero */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1 flex items-center gap-2"><User2 size={10} /> Barbero</label>
        <select 
          value={barberId}
          onChange={(e) => setBarberId(e.target.value)}
          required
          className="w-full bg-background-tertiary border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent appearance-none transition-colors"
        >
          <option value="">Selecciona barbero</option>
          {barberos.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* 4. Fecha */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1 flex items-center gap-2"><Calendar size={10} /> Fecha</label>
        <input 
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full bg-background-tertiary border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors color-scheme-dark"
        />
      </div>

      {/* 5. Hora */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1 flex items-center gap-2"><Clock size={10} /> Hora disponible</label>
        <div className="grid grid-cols-4 gap-2">
          {availableSlots.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setTime(s)}
              className={`py-2 text-xs rounded-lg border transition-all ${time === s ? 'bg-accent border-accent text-background-primary font-bold' : 'bg-background-tertiary border-border text-text-secondary hover:border-text-tertiary'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full py-6 text-base" disabled={isPending}>
          {isPending ? "Procesando..." : (editingAppointment ? "Actualizar Cita" : "Agendar Cita")}
        </Button>
      </div>
    </form>
  )
}
