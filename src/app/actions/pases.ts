'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getBarbershopId } from './utils'

export interface Plan {
  id: string
  barbershop_id: string
  name: string
  description: string | null
  price: number
  duration_days: number
  services_included: number | null
  unlimited_services: boolean
  applicable_service_ids: string[] | null
  includes_product_discount: boolean
  product_discount_percentage: number | null
  priority_booking: boolean
  is_active: boolean
  color: string
}

export interface ClientSub {
  id: string
  barbershop_id: string
  client_id: string
  plan_id: string
  status: 'active' | 'expired' | 'cancelled' | 'pending'
  starts_at: string
  expires_at: string
  services_used: number
  price_paid: number
  payment_method: string | null
  payment_note: string | null
  activated_by: string | null
  qr_code: string | null
  is_gift: boolean
  gift_code: string | null
  clients?: { name: string; phone: string | null } | null
  subscription_plans?: {
    name: string
    color: string
    services_included: number | null
    unlimited_services: boolean
    product_discount_percentage: number | null
  } | null
}

export interface PaseStats {
  pasesActivos: number
  ingresosRecurrentes: number
  cortesUsados: number
  renovacionesProximas: number
}

// ── Plans ─────────────────────────────────────────────────────────────

export async function getPlanes(): Promise<Plan[]> {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return []
  const { data } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('barbershop_id', barbershopId)
    .order('price', { ascending: true })
  return (data ?? []) as Plan[]
}

export async function createPlan(input: Omit<Plan, 'id' | 'barbershop_id'>) {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { error: 'No autorizado' }
  const { error } = await supabase.from('subscription_plans').insert({ ...input, barbershop_id: barbershopId })
  if (error) return { error: error.message }
  revalidatePath('/dashboard/pases')
  return { success: true }
}

export async function updatePlan(id: string, input: Partial<Omit<Plan, 'id' | 'barbershop_id'>>) {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { error: 'No autorizado' }
  const { error } = await supabase
    .from('subscription_plans')
    .update(input)
    .eq('id', id)
    .eq('barbershop_id', barbershopId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/pases')
  return { success: true }
}

export async function togglePlanActive(id: string, isActive: boolean) {
  return updatePlan(id, { is_active: isActive })
}

// ── Stats ─────────────────────────────────────────────────────────────

export async function getPaseStats(): Promise<PaseStats> {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { pasesActivos: 0, ingresosRecurrentes: 0, cortesUsados: 0, renovacionesProximas: 0 }

  const today = new Date().toISOString().split('T')[0]
  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data: activos } = await supabase
    .from('client_subscriptions')
    .select('price_paid, services_used, expires_at')
    .eq('barbershop_id', barbershopId)
    .eq('status', 'active')

  type ActiveRow = { price_paid: number; services_used: number; expires_at: string }
  const rows = (activos ?? []) as ActiveRow[]
  const renovaciones = rows.filter(s => s.expires_at >= today && s.expires_at <= in7Days).length

  return {
    pasesActivos: rows.length,
    ingresosRecurrentes: rows.reduce((s: number, a: ActiveRow) => s + Number(a.price_paid ?? 0), 0),
    cortesUsados: rows.reduce((s: number, a: ActiveRow) => s + Number(a.services_used ?? 0), 0),
    renovacionesProximas: renovaciones,
  }
}

// ── Subscriptions ─────────────────────────────────────────────────────

export async function getClientSubscriptions(filter?: 'active' | 'expiring' | 'expired'): Promise<ClientSub[]> {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return []

  const today = new Date().toISOString().split('T')[0]
  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  let query = supabase
    .from('client_subscriptions')
    .select('*, clients(name, phone), subscription_plans(name, color, services_included, unlimited_services, product_discount_percentage)')
    .eq('barbershop_id', barbershopId)
    .order('created_at', { ascending: false })

  if (filter === 'active') query = query.eq('status', 'active')
  else if (filter === 'expired') query = query.in('status', ['expired', 'cancelled'])
  else if (filter === 'expiring') query = query.eq('status', 'active').gte('expires_at', today).lte('expires_at', in7Days)

  const { data } = await query
  return (data ?? []) as ClientSub[]
}

export async function activarPase(input: {
  clientId: string
  planId: string
  pricePaid: number
  paymentMethod: string
  paymentNote?: string
  startsAt: string
  isGift: boolean
}) {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { error: 'No autorizado' }

  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('duration_days')
    .eq('id', input.planId)
    .maybeSingle()
  if (!plan) return { error: 'Plan no encontrado' }

  const starts = new Date(input.startsAt)
  const expires = new Date(starts)
  expires.setDate(expires.getDate() + (plan.duration_days ?? 30))
  const qr_code = `PS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  const { data, error } = await supabase
    .from('client_subscriptions')
    .insert({
      barbershop_id: barbershopId,
      client_id: input.clientId,
      plan_id: input.planId,
      status: 'active',
      starts_at: starts.toISOString().split('T')[0],
      expires_at: expires.toISOString().split('T')[0],
      services_used: 0,
      price_paid: input.pricePaid,
      payment_method: input.paymentMethod,
      payment_note: input.paymentNote ?? null,
      is_gift: input.isGift,
      qr_code,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard/pases')
  return { success: true, data, qr_code }
}

export async function renovarPase(id: string) {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { error: 'No autorizado' }

  const { data: sub } = await supabase
    .from('client_subscriptions')
    .select('expires_at, subscription_plans(duration_days)')
    .eq('id', id)
    .maybeSingle()
  if (!sub) return { error: 'Pase no encontrado' }

  const days = (sub.subscription_plans as any)?.duration_days ?? 30
  const base = new Date(sub.expires_at) > new Date() ? new Date(sub.expires_at) : new Date()
  base.setDate(base.getDate() + days)

  const { error } = await supabase
    .from('client_subscriptions')
    .update({ status: 'active', expires_at: base.toISOString().split('T')[0], services_used: 0 })
    .eq('id', id)
    .eq('barbershop_id', barbershopId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/pases')
  return { success: true }
}

export async function cancelarPase(id: string) {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { error: 'No autorizado' }
  const { error } = await supabase
    .from('client_subscriptions')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('barbershop_id', barbershopId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/pases')
  return { success: true }
}

export async function registrarUso(subscriptionId: string, notes?: string) {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { error: 'No autorizado' }

  const { data: sub } = await supabase
    .from('client_subscriptions')
    .select('services_used, subscription_plans(services_included, unlimited_services)')
    .eq('id', subscriptionId)
    .maybeSingle()
  if (!sub) return { error: 'Pase no encontrado' }

  const plan = sub.subscription_plans as any
  if (!plan?.unlimited_services && sub.services_used >= (plan?.services_included ?? 0)) {
    return { error: 'Pase agotado' }
  }

  const { error: insErr } = await supabase.from('subscription_uses').insert({
    subscription_id: subscriptionId,
    barbershop_id: barbershopId,
    used_at: new Date().toISOString(),
    notes: notes ?? null,
  })
  if (insErr) return { error: insErr.message }

  const { error: upErr } = await supabase
    .from('client_subscriptions')
    .update({ services_used: sub.services_used + 1 })
    .eq('id', subscriptionId)
  if (upErr) return { error: upErr.message }

  revalidatePath('/dashboard/pases')
  return { success: true, usedCount: sub.services_used + 1 }
}

// ── Loyalty points ────────────────────────────────────────────────────

export async function getLoyaltyPoints() {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return []
  const { data } = await supabase
    .from('subscription_loyalty_points')
    .select('*, clients(name, phone)')
    .eq('barbershop_id', barbershopId)
    .order('points', { ascending: false })
  return (data ?? []) as {
    id: string; client_id: string; points: number; total_earned: number; total_redeemed: number
    clients: { name: string; phone: string | null } | null
  }[]
}

export async function canjearPuntos(clientId: string, points: number) {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { error: 'No autorizado' }

  const { data: lp } = await supabase
    .from('subscription_loyalty_points')
    .select('id, points, total_redeemed')
    .eq('barbershop_id', barbershopId)
    .eq('client_id', clientId)
    .maybeSingle()
  if (!lp) return { error: 'Sin puntos registrados' }
  if (lp.points < points) return { error: 'Puntos insuficientes' }

  const { error } = await supabase
    .from('subscription_loyalty_points')
    .update({ points: lp.points - points, total_redeemed: (lp.total_redeemed ?? 0) + points })
    .eq('id', lp.id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/pases')
  return { success: true }
}

// ── Public QR (no auth required) ─────────────────────────────────────

export async function getPaseByQR(qr: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('client_subscriptions')
    .select(`
      *,
      subscription_plans(name, color, services_included, unlimited_services, product_discount_percentage, priority_booking),
      clients(name, phone)
    `)
    .eq('qr_code', qr)
    .maybeSingle()
  return data as (ClientSub & {
    subscription_plans: Plan & { priority_booking: boolean }
    clients: { name: string; phone: string | null }
  }) | null
}

export async function registrarUsoPorQR(qr: string) {
  const supabase = await createClient()
  const { data: sub } = await supabase
    .from('client_subscriptions')
    .select('id, barbershop_id, services_used, subscription_plans(services_included, unlimited_services)')
    .eq('qr_code', qr)
    .maybeSingle()
  if (!sub) return { error: 'Pase no encontrado' }

  const plan = sub.subscription_plans as any
  if (!plan?.unlimited_services && sub.services_used >= (plan?.services_included ?? 0)) {
    return { error: 'Pase agotado' }
  }

  const { error: insErr } = await supabase.from('subscription_uses').insert({
    subscription_id: sub.id,
    barbershop_id: sub.barbershop_id,
    used_at: new Date().toISOString(),
  })
  if (insErr) return { error: insErr.message }

  const { error: upErr } = await supabase
    .from('client_subscriptions')
    .update({ services_used: sub.services_used + 1 })
    .eq('id', sub.id)
  if (upErr) return { error: upErr.message }

  return { success: true, usedCount: sub.services_used + 1 }
}

// ── Dashboard alerts ──────────────────────────────────────────────────

export async function getPasesPorVencer() {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return []
  const today = new Date().toISOString().split('T')[0]
  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const { data } = await supabase
    .from('client_subscriptions')
    .select('id, expires_at, clients(name, phone), subscription_plans(name)')
    .eq('barbershop_id', barbershopId)
    .eq('status', 'active')
    .gte('expires_at', today)
    .lte('expires_at', in7Days)
  return (data ?? []) as {
    id: string; expires_at: string
    clients: { name: string; phone: string | null }
    subscription_plans: { name: string }
  }[]
}

// ── Modal helpers ─────────────────────────────────────────────────────

export async function getServiciosParaPases() {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return []
  const { data } = await supabase
    .from('services')
    .select('id, name, price')
    .eq('barbershop_id', barbershopId)
    .order('name')
  return (data ?? []) as { id: string; name: string; price: number }[]
}

export async function getClientesParaPases() {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return []
  const { data } = await supabase
    .from('clients')
    .select('id, name, phone')
    .eq('barbershop_id', barbershopId)
    .order('name')
  return (data ?? []) as { id: string; name: string; phone: string | null }[]
}
