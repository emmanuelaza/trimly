'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { createPlan, updatePlan, type Plan } from '@/app/actions/pases'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6']

interface Props {
  isOpen: boolean
  onClose: () => void
  plan?: Plan | null
  servicios: { id: string; name: string; price: number }[]
}

export function CrearPlanModal({ isOpen, onClose, plan, servicios }: Props) {
  const editing = !!plan

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [durationDays, setDurationDays] = useState('30')
  const [servicesIncluded, setServicesIncluded] = useState('')
  const [unlimitedServices, setUnlimitedServices] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [includesDiscount, setIncludesDiscount] = useState(false)
  const [discountPercentage, setDiscountPercentage] = useState('10')
  const [priorityBooking, setPriorityBooking] = useState(false)
  const [color, setColor] = useState(COLORS[0])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (plan) {
      setName(plan.name)
      setDescription(plan.description ?? '')
      setPrice(String(plan.price))
      setDurationDays(String(plan.duration_days))
      setServicesIncluded(plan.services_included != null ? String(plan.services_included) : '')
      setUnlimitedServices(plan.unlimited_services)
      setSelectedServices(plan.applicable_service_ids ?? [])
      setIncludesDiscount(plan.includes_product_discount)
      setDiscountPercentage(plan.product_discount_percentage != null ? String(plan.product_discount_percentage) : '10')
      setPriorityBooking(plan.priority_booking)
      setColor(plan.color)
    } else {
      setName(''); setDescription(''); setPrice(''); setDurationDays('30')
      setServicesIncluded(''); setUnlimitedServices(false); setSelectedServices([])
      setIncludesDiscount(false); setDiscountPercentage('10'); setPriorityBooking(false)
      setColor(COLORS[0])
    }
  }, [plan, isOpen])

  const toggleService = (id: string) =>
    setSelectedServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

  const handleSave = async () => {
    if (!name.trim() || !price) { toast.error('Nombre y precio son requeridos'); return }
    setSaving(true)
    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      price: Number(price),
      duration_days: Number(durationDays) || 30,
      services_included: unlimitedServices ? null : Number(servicesIncluded) || null,
      unlimited_services: unlimitedServices,
      applicable_service_ids: selectedServices.length > 0 ? selectedServices : null,
      includes_product_discount: includesDiscount,
      product_discount_percentage: includesDiscount ? Number(discountPercentage) : null,
      priority_booking: priorityBooking,
      is_active: plan?.is_active ?? true,
      color,
    }
    const result = editing ? await updatePlan(plan!.id, payload) : await createPlan(payload)
    setSaving(false)
    if (result.error) { toast.error(result.error); return }
    toast.success(editing ? 'Plan actualizado' : 'Plan creado')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? 'Editar plan' : 'Crear plan'}
      footer={
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-border text-sm font-bold text-text-secondary hover:bg-background-secondary transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-10 rounded-xl bg-accent text-background-primary text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-accent/90 transition-colors"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {editing ? 'Guardar cambios' : 'Crear plan'}
          </button>
        </div>
      }
    >
      <div className="space-y-5 py-1">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Nombre del plan</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej. Plan Mensual Pro"
            className="w-full h-10 px-3 rounded-xl border border-border bg-background-secondary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Descripción (opcional)</label>
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe los beneficios"
            className="w-full h-10 px-3 rounded-xl border border-border bg-background-secondary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Precio (COP)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm">$</span>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="80000"
                className="w-full h-10 pl-7 pr-3 rounded-xl border border-border bg-background-secondary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Duración (días)</label>
            <input
              type="number"
              value={durationDays}
              onChange={e => setDurationDays(e.target.value)}
              placeholder="30"
              className="w-full h-10 px-3 rounded-xl border border-border bg-background-secondary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>

        {/* Services count */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Cortes incluidos</label>
            <button
              onClick={() => setUnlimitedServices(!unlimitedServices)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${unlimitedServices ? 'bg-accent text-background-primary border-accent' : 'border-border text-text-tertiary hover:border-accent hover:text-accent'}`}
            >
              {unlimitedServices ? 'Ilimitado ∞' : 'Establecer límite'}
            </button>
          </div>
          {!unlimitedServices && (
            <input
              type="number"
              value={servicesIncluded}
              onChange={e => setServicesIncluded(e.target.value)}
              placeholder="Ej. 4"
              className="w-full h-10 px-3 rounded-xl border border-border bg-background-secondary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          )}
        </div>

        {/* Applicable services */}
        {servicios.length > 0 && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Servicios aplicables (dejar vacío = todos)</label>
            <div className="flex flex-wrap gap-2">
              {servicios.map(s => (
                <button
                  key={s.id}
                  onClick={() => toggleService(s.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${selectedServices.includes(s.id) ? 'bg-accent text-background-primary border-accent' : 'border-border text-text-secondary hover:border-accent'}`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Toggles */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Beneficios extra</label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-background-secondary/50 cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-text-primary">Descuento en productos</p>
              <p className="text-[10px] text-text-tertiary">El cliente recibe % de descuento en productos</p>
            </div>
            <input type="checkbox" checked={includesDiscount} onChange={e => setIncludesDiscount(e.target.checked)} className="accent-accent w-4 h-4" />
          </label>

          {includesDiscount && (
            <div className="flex items-center gap-4 px-3">
              <input
                type="range" min="5" max="50" step="5"
                value={discountPercentage}
                onChange={e => setDiscountPercentage(e.target.value)}
                className="flex-1 h-2 accent-accent"
              />
              <span className="w-12 text-center font-bold text-accent text-sm">{discountPercentage}%</span>
            </div>
          )}

          <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-background-secondary/50 cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-text-primary">Reserva prioritaria</p>
              <p className="text-[10px] text-text-tertiary">El cliente tiene acceso anticipado a slots</p>
            </div>
            <input type="checkbox" checked={priorityBooking} onChange={e => setPriorityBooking(e.target.checked)} className="accent-accent w-4 h-4" />
          </label>
        </div>

        {/* Color picker */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Color del carnet</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full transition-all hover:scale-110"
                style={{ background: c, outline: color === c ? `3px solid ${c}` : 'none', outlineOffset: '2px' }}
              />
            ))}
          </div>
        </div>

      </div>
    </Modal>
  )
}
