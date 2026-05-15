'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { activarPase, type Plan } from '@/app/actions/pases'
import toast from 'react-hot-toast'
import { Search, Check, Loader2, CreditCard, Banknote, Smartphone, ArrowRightLeft } from 'lucide-react'

interface Client { id: string; name: string; phone: string | null }

interface Props {
  isOpen: boolean
  onClose: () => void
  planes: Plan[]
  clientes: Client[]
}

const METODOS = [
  { value: 'efectivo', label: 'Efectivo', icon: Banknote },
  { value: 'nequi', label: 'Nequi', icon: Smartphone },
  { value: 'daviplata', label: 'Daviplata', icon: Smartphone },
  { value: 'transferencia', label: 'Transf.', icon: ArrowRightLeft },
]

export function ActivarPaseModal({ isOpen, onClose, planes, clientes }: Props) {
  const [step, setStep] = useState(1)
  const [clientSearch, setClientSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [pricePaid, setPricePaid] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('efectivo')
  const [paymentNote, setPaymentNote] = useState('')
  const [startsAt, setStartsAt] = useState(new Date().toISOString().split('T')[0])
  const [isGift, setIsGift] = useState(false)
  const [saving, setSaving] = useState(false)
  const [resultQR, setResultQR] = useState<string | null>(null)

  const filteredClients = clientes.filter(c =>
    clientSearch.length < 2
      ? false
      : c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        (c.phone ?? '').includes(clientSearch)
  )

  const handleActivar = async () => {
    if (!selectedClient || !selectedPlan) return
    setSaving(true)
    const result = await activarPase({
      clientId: selectedClient.id,
      planId: selectedPlan.id,
      pricePaid: Number(pricePaid) || selectedPlan.price,
      paymentMethod,
      paymentNote: paymentNote || undefined,
      startsAt,
      isGift,
    })
    setSaving(false)
    if (result.error) { toast.error(result.error); return }
    setResultQR(result.qr_code ?? null)
    setStep(4)
  }

  const handleClose = () => {
    setStep(1); setClientSearch(''); setSelectedClient(null); setSelectedPlan(null)
    setPricePaid(''); setPaymentMethod('efectivo'); setPaymentNote('')
    setStartsAt(new Date().toISOString().split('T')[0]); setIsGift(false); setResultQR(null)
    onClose()
  }

  const stepTitles = ['Buscar cliente', 'Seleccionar plan', 'Pago', '¡Pase activado!']

  const stepFooter =
    step === 3 ? (
      <div className="flex gap-3">
        <button onClick={() => setStep(2)} className="flex-1 h-10 rounded-xl border border-border text-sm font-bold text-text-secondary hover:bg-background-secondary transition-colors">
          Atrás
        </button>
        <button
          onClick={handleActivar}
          disabled={saving}
          className="flex-1 h-10 rounded-xl bg-accent text-background-primary text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-accent/90 transition-colors"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
          Activar pase
        </button>
      </div>
    ) : step === 4 ? (
      <button
        onClick={handleClose}
        className="w-full h-10 rounded-xl bg-accent text-background-primary text-sm font-bold hover:bg-accent/90 transition-colors"
      >
        Listo
      </button>
    ) : null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Activar pase — ${stepTitles[step - 1]}`} footer={stepFooter}>
      {/* Progress */}
      <div className="flex gap-1.5 mb-6">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-all ${step >= s ? 'bg-accent' : 'bg-border'}`} />
        ))}
      </div>

      {/* Step 1: Client search */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              value={clientSearch}
              onChange={e => setClientSearch(e.target.value)}
              placeholder="Buscar por nombre o teléfono..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-background-secondary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
              autoFocus
            />
          </div>

          {clientSearch.length >= 2 && filteredClients.length === 0 && (
            <p className="text-xs text-text-tertiary text-center py-4">Sin resultados</p>
          )}

          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {filteredClients.map(c => (
              <button
                key={c.id}
                onClick={() => { setSelectedClient(c); setStep(2) }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-accent hover:bg-accent/5 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xs shrink-0">
                  {c.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{c.name}</p>
                  {c.phone && <p className="text-xs text-text-tertiary">{c.phone}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Plan selection */}
      {step === 2 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-background-tertiary/30 border border-border">
            <div className="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-[10px]">
              {selectedClient?.name.substring(0, 2).toUpperCase()}
            </div>
            <p className="text-sm font-medium text-text-primary">{selectedClient?.name}</p>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {planes.filter(p => p.is_active).map(p => (
              <button
                key={p.id}
                onClick={() => { setSelectedPlan(p); setPricePaid(String(p.price)); setStep(3) }}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-accent hover:bg-accent/5 transition-all text-left"
              >
                <div className="w-4 h-10 rounded-full shrink-0" style={{ background: p.color }} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-text-primary">{p.name}</p>
                  <p className="text-xs text-text-tertiary">
                    {p.unlimited_services ? 'Ilimitado' : `${p.services_included} cortes`} · {p.duration_days} días
                  </p>
                </div>
                <p className="text-sm font-bold text-accent">${p.price.toLocaleString()}</p>
              </button>
            ))}
          </div>

          <button onClick={() => setStep(1)} className="text-xs text-text-tertiary hover:text-text-secondary transition-colors">
            ← Cambiar cliente
          </button>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="p-3 rounded-xl bg-background-tertiary/30 border border-border flex items-center justify-between">
            <div>
              <p className="text-xs text-text-tertiary">Cliente</p>
              <p className="text-sm font-bold text-text-primary">{selectedClient?.name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-tertiary">Plan</p>
              <p className="text-sm font-bold text-text-primary">{selectedPlan?.name}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Precio cobrado (COP)</label>
            <MoneyInput
              value={pricePaid ? Number(pricePaid) : undefined}
              onChange={v => setPricePaid(String(v))}
              placeholder="80.000"
              className="w-full h-10 px-3 rounded-xl border border-border bg-background-secondary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Método de pago</label>
            <div className="grid grid-cols-4 gap-2">
              {METODOS.map(m => (
                <button
                  key={m.value}
                  onClick={() => setPaymentMethod(m.value)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-bold transition-all ${paymentMethod === m.value ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-tertiary hover:border-accent/50'}`}
                >
                  <m.icon size={16} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Inicia el</label>
            <input
              type="date"
              value={startsAt}
              onChange={e => setStartsAt(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-border bg-background-secondary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Nota (opcional)</label>
            <input
              value={paymentNote}
              onChange={e => setPaymentNote(e.target.value)}
              placeholder="Ej. Regalo de cumpleaños"
              className="w-full h-10 px-3 rounded-xl border border-border bg-background-secondary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={isGift} onChange={e => setIsGift(e.target.checked)} className="accent-accent w-4 h-4" />
            <span className="text-xs text-text-secondary">Este pase es un regalo</span>
          </label>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <div className="text-center space-y-6 py-2">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <Check size={32} className="text-success" />
          </div>
          <div>
            <p className="text-lg font-black text-text-primary">¡Pase activado!</p>
            <p className="text-sm text-text-tertiary mt-1">
              {selectedClient?.name} — {selectedPlan?.name}
            </p>
          </div>

          {resultQR && (
            <div className="bg-background-secondary border border-border rounded-2xl p-5 mx-auto max-w-xs">
              <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-3">Código del carnet</p>
              <p className="font-mono font-black text-xl tracking-[0.2em] text-text-primary">{resultQR}</p>
              <p className="text-[10px] text-text-tertiary mt-2">Muéstralo en cada visita</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
