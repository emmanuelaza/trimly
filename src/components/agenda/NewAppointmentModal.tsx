"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useTransition } from "react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Avatar } from "@/components/ui/Avatar"
import { createAppointment } from "@/app/actions/appointments"
import { Search, Check, Clock, ChevronRight, Plus, Scissors, Calendar, CheckCircle2 } from "lucide-react"
import toast from "react-hot-toast"

/* ─── Types ─────────────────────────────────────────────── */
interface Cliente {
  id: string
  name: string
  phone?: string
  last_visit?: string
}

interface Servicio {
  id: string
  name: string
  price: number
  duration_minutes?: number
}

interface Props {
  clientes: Cliente[]
  servicios: Servicio[]
}

/* ─── Step Indicator ─────────────────────────────────────── */
function StepDot({ n, state }: { n: number; state: "completed" | "active" | "pending" }) {
  return (
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
        state === "completed"
          ? "bg-success text-background-primary"
          : state === "active"
          ? "bg-accent text-background-primary ring-4 ring-accent/20"
          : "bg-background-tertiary border border-border-strong text-text-tertiary"
      }`}
    >
      {state === "completed" ? <Check size={12} strokeWidth={3} /> : n}
    </div>
  )
}

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <StepDot n={1} state={step > 1 ? "completed" : step === 1 ? "active" : "pending"} />
      <div className={`flex-1 h-px transition-all ${step > 1 ? "bg-success/40" : "bg-border"}`} />
      <StepDot n={2} state={step > 2 ? "completed" : step === 2 ? "active" : "pending"} />
      <div className={`flex-1 h-px transition-all ${step > 2 ? "bg-success/40" : "bg-border"}`} />
      <StepDot n={3} state={step === 3 ? "active" : "pending"} />
    </div>
  )
}

/* ─── Slot Time Helpers ──────────────────────────────────── */
const SLOT_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
const SLOT_MINUTES = [0, 30]

interface Slot { date: string; display: string; value: string }

function buildSlots(): { label: string; slots: Slot[] }[] {
  const today = new Date()
  const groups: { label: string; slots: Slot[] }[] = []

  for (let d = 0; d < 5; d++) {
    const date = new Date(today)
    date.setDate(today.getDate() + d)
    const dateStr = date.toISOString().split("T")[0]
    const label = d === 0 ? "Hoy" : d === 1 ? "Mañana" : date.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "short" })
    const slots: Slot[] = []
    for (const h of SLOT_HOURS) {
      for (const m of SLOT_MINUTES) {
        const isPast = d === 0 && (h < today.getHours() || (h === today.getHours() && m <= today.getMinutes()))
        if (isPast) continue
        const hh = h.toString().padStart(2, "0")
        const mm = m.toString().padStart(2, "0")
        const period = h >= 12 ? "pm" : "am"
        const h12 = h > 12 ? h - 12 : h
        slots.push({ date: dateStr, display: `${h12}:${mm} ${period}`, value: `${hh}:${mm}` })
      }
    }
    if (slots.length) groups.push({ label, slots })
  }
  return groups
}

/* ─── Main Component ─────────────────────────────────────── */
export function NewAppointmentModal({ clientes = [], servicios = [] }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const isOpen = searchParams.get("new") === "1"

  /* Wizard state */
  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  const [selectedCliente, setSelectedCliente] = React.useState<Cliente | null>(null)
  const [search, setSearch] = React.useState("")
  const [selectedServicios, setSelectedServicios] = React.useState<Servicio[]>([])
  const [selectedSlot, setSelectedSlot] = React.useState<Slot | null>(null)
  const [done, setDone] = React.useState(false)

  /* Reset wizard on close */
  const handleClose = () => {
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.delete("new")
    const newUrl = `${pathname}${newParams.toString() ? `?${newParams.toString()}` : ""}`
    router.replace(newUrl, { scroll: false })
    // Delay reset so animation completes
    setTimeout(() => {
      setStep(1); setSelectedCliente(null); setSearch(""); setSelectedServicios([]); setSelectedSlot(null); setDone(false)
    }, 300)
  }

  /* ── Step 1 ─ Cliente ──────────────────────────────────── */
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 200)
    return () => clearTimeout(t)
  }, [search])

  const filtered = debouncedSearch.length > 0
    ? clientes.filter(c => c.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) || c.phone?.includes(debouncedSearch))
    : clientes.slice(0, 8)

  const getInitials = (name: string) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "?"

  /* ── Step 2 ─ Servicios ────────────────────────────────── */
  const toggleServicio = (s: Servicio) => {
    setSelectedServicios(prev =>
      prev.find(x => x.id === s.id) ? prev.filter(x => x.id !== s.id) : [...prev, s]
    )
  }
  const total = selectedServicios.reduce((acc, s) => acc + Number(s.price), 0)

  /* ── Step 3 ─ Slots ────────────────────────────────────── */
  const slotGroups = React.useMemo(() => buildSlots(), [])

  /* ── Confirm ───────────────────────────────────────────── */
  const handleConfirm = () => {
    if (!selectedCliente || selectedServicios.length === 0 || !selectedSlot) return
    startTransition(async () => {
      const fd = new FormData()
      fd.set("client_id", selectedCliente.id)
      fd.set("service_id", selectedServicios[0].id)
      fd.set("fecha", selectedSlot.date)
      fd.set("hora", selectedSlot.value)
      
      const result = await createAppointment(fd)
      if (result.success) {
        toast.success("Cita agendada correctamente")
        setDone(true)
        router.refresh()
      } else {
        toast.error(result.error || "Error al agendar cita")
      }
    })
  }

  /* ─── Step labels ────────────────────────────────────────── */
  const stepLabels = ["Cliente", "Servicio", "Hora"]

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={done ? undefined : `Nueva Cita — ${stepLabels[step - 1]}`}>
      {done ? (
        /* ── Success state ── */
        <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-success-bg border border-success/30 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-success" />
          </div>
          <div>
            <p className="text-lg font-semibold text-text-primary">¡Cita agendada!</p>
            <p className="text-sm text-text-secondary mt-1">
              {selectedCliente?.name} · {selectedSlot?.display} · {selectedSlot?.date}
            </p>
          </div>
          <div className="flex gap-3 mt-2 w-full">
            <Button variant="secondary" className="flex-1" onClick={handleClose}>Cerrar</Button>
            <Button className="flex-1" onClick={() => { setDone(false); setStep(1); setSelectedCliente(null); setSearch(""); setSelectedServicios([]); setSelectedSlot(null) }}>
              + Otra cita
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-0">
          <StepIndicator step={step} />

          {/* ══ STEP 1: CLIENTE ══════════════════════════ */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-xs text-text-tertiary mb-4">¿Quién viene hoy?</p>
              
              {/* Search input */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar por nombre o teléfono..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-background-tertiary border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              {/* Results list */}
              <div className="max-h-[280px] overflow-y-auto -mx-1 space-y-0.5">
                {filtered.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCliente(c); setStep(2) }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-background-tertiary transition-colors text-left group"
                  >
                    <Avatar fallback={getInitials(c.name)} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">{c.name}</p>
                      <p className="text-xs text-text-tertiary">{c.phone || "Sin teléfono"}</p>
                    </div>
                    <ChevronRight size={14} className="text-text-tertiary group-hover:text-text-secondary transition-colors flex-shrink-0" />
                  </button>
                ))}

                {filtered.length === 0 && debouncedSearch.length > 0 && (
                  <p className="text-sm text-text-tertiary text-center py-6">Sin resultados para &quot;{debouncedSearch}&quot;</p>
                )}

                {/* Add new client */}
                <button
                  onClick={() => {
                    const newC: Cliente = { id: "__new__", name: debouncedSearch || "Nuevo Cliente" }
                    setSelectedCliente(newC)
                    setStep(2)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-dashed border-border hover:border-border-strong hover:bg-background-tertiary transition-colors text-left mt-1"
                >
                  <div className="w-8 h-8 rounded-full bg-background-tertiary flex items-center justify-center">
                    <Plus size={14} className="text-text-tertiary" />
                  </div>
                  <span className="text-sm text-text-secondary">
                    {debouncedSearch ? `Añadir "${debouncedSearch}" como nuevo cliente` : "Añadir cliente nuevo"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 2: SERVICIOS ════════════════════════ */}
          {step === 2 && (
            <div className="space-y-3">
              {/* Selected client chip */}
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <Avatar fallback={getInitials(selectedCliente?.name || "")} size="sm" />
                <span className="text-sm font-medium text-text-primary">{selectedCliente?.name}</span>
                <button onClick={() => { setStep(1); setSelectedServicios([]) }} className="ml-auto text-xs text-text-tertiary hover:text-text-secondary transition-colors">
                  Cambiar
                </button>
              </div>

              <p className="text-xs text-text-tertiary">Selecciona uno o varios servicios:</p>

              {/* Service cards */}
              <div className="space-y-2 max-h-[260px] overflow-y-auto -mx-1 px-1">
                {servicios.map(s => {
                  const isSelected = selectedServicios.find(x => x.id === s.id)
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleServicio(s)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                        isSelected
                          ? "bg-accent-muted border-accent/40"
                          : "bg-background-primary border-border hover:border-border-strong hover:bg-background-tertiary"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-accent/20" : "bg-background-tertiary"}`}>
                        <Scissors size={16} className={isSelected ? "text-accent" : "text-text-tertiary"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isSelected ? "text-accent" : "text-text-primary"}`}>{s.name}</p>
                        <p className="text-xs text-text-tertiary font-mono">${Number(s.price).toLocaleString("es-CO")}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? "bg-accent border-accent" : "border-border-strong"}`}>
                        {isSelected && <Check size={11} strokeWidth={3} className="text-background-primary" />}
                      </div>
                    </button>
                  )
                })}

                {servicios.length === 0 && (
                  <div className="text-center py-8 text-sm text-text-tertiary">
                    No hay servicios configurados aún.
                  </div>
                )}
              </div>

              {/* Total panel + next button */}
              {selectedServicios.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-text-tertiary uppercase tracking-wider font-bold">Total</span>
                    <span className="text-lg font-mono font-semibold text-text-primary">${total.toLocaleString("es-CO")}</span>
                  </div>
                  <Button className="w-full" onClick={() => setStep(3)}>
                    Continuar <ChevronRight size={16} />
                  </Button>
                </div>
              )}
              {selectedServicios.length === 0 && (
                <Button className="w-full" disabled>
                  Selecciona un servicio
                </Button>
              )}
            </div>
          )}

          {/* ══ STEP 3: SLOTS ════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Summary bar */}
              <div className="flex items-center gap-2 pb-3 border-b border-border flex-wrap">
                <Avatar fallback={getInitials(selectedCliente?.name || "")} size="sm" />
                <span className="text-sm font-medium text-text-primary">{selectedCliente?.name}</span>
                <span className="text-text-tertiary">·</span>
                <span className="text-sm text-text-secondary">{selectedServicios.map(s => s.name).join(" + ")}</span>
                <span className="ml-auto text-sm font-mono text-accent">${total.toLocaleString("es-CO")}</span>
              </div>

              <p className="text-xs text-text-tertiary">Elige un horario:</p>

              {/* Slot groups */}
              <div className="space-y-4 max-h-[280px] overflow-y-auto -mx-1 px-1">
                {slotGroups.map(group => (
                  <div key={group.label}>
                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Calendar size={10} />
                      {group.label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.slots.map(slot => {
                        const isSelected = selectedSlot?.date === slot.date && selectedSlot?.value === slot.value
                        return (
                          <button
                            key={`${slot.date}-${slot.value}`}
                            onClick={() => setSelectedSlot(slot)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              isSelected
                                ? "bg-accent text-background-primary border-accent"
                                : "bg-background-primary border-border text-text-secondary hover:border-border-strong hover:text-text-primary"
                            }`}
                          >
                            {slot.display}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Confirmation */}
              {selectedSlot && (
                <div className="pt-3 border-t border-border space-y-3">
                  <div className="bg-accent-muted border border-accent/20 rounded-xl p-3 flex items-center gap-3">
                    <Clock size={16} className="text-accent flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {selectedSlot.display} — {selectedSlot.date}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {selectedCliente?.name} · {selectedServicios.map(s => s.name).join(" + ")} · ${total.toLocaleString("es-CO")}
                      </p>
                    </div>
                  </div>
                  <Button className="w-full" onClick={handleConfirm} disabled={isPending}>
                    {isPending ? (
                      <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-background-primary/30 border-t-background-primary animate-spin" /> Guardando...</span>
                    ) : (
                      <><CheckCircle2 size={16} /> Confirmar cita</>
                    )}
                  </Button>
                </div>
              )}

              {!selectedSlot && (
                <Button className="w-full" disabled>
                  Selecciona un horario
                </Button>
              )}

              {/* Back */}
              <button onClick={() => setStep(2)} className="w-full text-center text-xs text-text-tertiary hover:text-text-secondary transition-colors pt-1">
                ← Volver a servicios
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
