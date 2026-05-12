'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getBarbershopId } from '@/lib/getBarbershopId'

export interface ReferralProgram {
  id: string
  barbershop_id: string
  activo: boolean
  tipo_beneficio: 'porcentaje' | 'monto'
  valor_beneficio: number
  descripcion: string | null
  mensaje_personalizado: string | null
}

export interface ReferralActivity {
  id: string
  barbershop_id: string
  created_at: string
  referral_code: string | null
  estado: 'pendiente' | 'aplicado'
  credito_otorgado: number
  beneficio_aplicado_at: string | null
  nombre_referidor: string | null
  telefono_referidor: string | null
  cliente_que_refirio: string | null
  nombre_referido: string | null
}

export interface TopReferrer {
  id: string
  name: string
  phone: string | null
  referral_code: string | null
  credito_acumulado: number
  credito_usado: number
  total_referidos: number
}

export interface PendingCredit {
  id: string
  name: string
  phone: string | null
  referral_code: string | null
  credito_disponible: number
  last_visit: string | null
}

function formatBeneficio(program: ReferralProgram): string {
  if (program.tipo_beneficio === 'porcentaje') {
    return `${program.valor_beneficio}% de descuento`
  }
  return `$${Number(program.valor_beneficio).toLocaleString('es-CO')} de descuento`
}

export async function getReferralProgram(): Promise<ReferralProgram | null> {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return null

  const { data } = await supabase
    .from('referral_program')
    .select('*')
    .eq('barbershop_id', barbershopId)
    .maybeSingle()

  return data as ReferralProgram | null
}

export async function upsertReferralProgram(formData: FormData) {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { error: 'No autorizado' }

  const activo = formData.get('activo') === 'true'
  const tipo_beneficio = formData.get('tipo_beneficio') as 'porcentaje' | 'monto'
  const valor_beneficio = Number(formData.get('valor_beneficio') ?? 0)
  const descripcion = (formData.get('descripcion') as string) || null
  const mensaje_personalizado = (formData.get('mensaje_personalizado') as string) || null

  const { data: existing } = await supabase
    .from('referral_program')
    .select('id')
    .eq('barbershop_id', barbershopId)
    .maybeSingle()

  const payload = { activo, tipo_beneficio, valor_beneficio, descripcion, mensaje_personalizado, updated_at: new Date().toISOString() }

  if (existing) {
    const { error } = await supabase.from('referral_program').update(payload).eq('id', existing.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('referral_program').insert({ barbershop_id: barbershopId, ...payload })
    if (error) return { error: error.message }
  }

  revalidatePath('/dashboard/referidos')
  return { success: true }
}

export async function getReferralStats() {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { total: 0, totalBeneficios: 0, clientesActivos: 0, creditosPendientes: 0 }

  const now = new Date()
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data: usos } = await supabase
    .from('referral_uses')
    .select('id, credito_otorgado, cliente_que_refirio, estado, created_at')
    .eq('barbershop_id', barbershopId)

  type UsoRow = { id: string; credito_otorgado: number; cliente_que_refirio: string | null; estado: string; created_at: string }
  const totalUsos = (usos ?? []) as UsoRow[]
  const estesMes = totalUsos.filter((u) => u.created_at >= inicioMes)

  return {
    total: estesMes.length,
    totalBeneficios: totalUsos.reduce((s, u) => s + Number(u.credito_otorgado ?? 0), 0),
    clientesActivos: new Set(totalUsos.map((u) => u.cliente_que_refirio).filter(Boolean)).size,
    creditosPendientes: totalUsos.filter((u) => u.estado === 'pendiente').reduce((s, u) => s + Number(u.credito_otorgado ?? 0), 0),
  }
}

export async function getReferralActivity(): Promise<ReferralActivity[]> {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return []

  const { data, error } = await supabase
    .from('referral_uses')
    .select(`
      id, barbershop_id, created_at, referral_code, estado,
      credito_otorgado, beneficio_aplicado_at, cliente_que_refirio,
      referidor:clients!referral_uses_cliente_que_refirio_fkey(name, phone),
      referido:clients!referral_uses_cliente_nuevo_fkey(name)
    `)
    .eq('barbershop_id', barbershopId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getReferralActivity error:', error)
    return []
  }

  return ((data ?? []) as unknown[]).map((row: unknown) => {
    const r = row as Record<string, unknown>
    const referidor = r.referidor as { name?: string; phone?: string } | null
    const referido = r.referido as { name?: string } | null
    return {
      id: r.id as string,
      barbershop_id: r.barbershop_id as string,
      created_at: r.created_at as string,
      referral_code: r.referral_code as string | null,
      estado: (r.estado as 'pendiente' | 'aplicado') ?? 'pendiente',
      credito_otorgado: Number(r.credito_otorgado ?? 0),
      beneficio_aplicado_at: r.beneficio_aplicado_at as string | null,
      cliente_que_refirio: r.cliente_que_refirio as string | null,
      nombre_referidor: referidor?.name ?? null,
      telefono_referidor: referidor?.phone ?? null,
      nombre_referido: referido?.name ?? null,
    } satisfies ReferralActivity
  })
}

export async function getTopReferrers(): Promise<TopReferrer[]> {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return []

  const { data, error } = await supabase
    .from('clients')
    .select('id, name, phone, referral_code, credito_acumulado, credito_usado')
    .eq('barbershop_id', barbershopId)
    .not('referral_code', 'is', null)
    .order('credito_acumulado', { ascending: false })
    .limit(20)

  if (error) return []

  const clients = (data ?? []) as Array<{
    id: string; name: string; phone: string | null
    referral_code: string | null; credito_acumulado: number; credito_usado: number
  }>

  const { data: usosData } = await supabase
    .from('referral_uses')
    .select('cliente_que_refirio')
    .eq('barbershop_id', barbershopId)

  const usosCount: Record<string, number> = {}
  for (const u of (usosData ?? [])) {
    if (u.cliente_que_refirio) usosCount[u.cliente_que_refirio] = (usosCount[u.cliente_que_refirio] ?? 0) + 1
  }

  return clients
    .map((c) => ({ ...c, total_referidos: usosCount[c.id] ?? 0 }))
    .filter((c) => c.total_referidos > 0 || Number(c.credito_acumulado) > 0)
    .sort((a, b) => b.total_referidos - a.total_referidos)
}

export async function getPendingCredits(): Promise<PendingCredit[]> {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return []

  const { data } = await supabase
    .from('clients')
    .select('id, name, phone, referral_code, credito_acumulado, credito_usado, last_visit')
    .eq('barbershop_id', barbershopId)
    .gt('credito_acumulado', 0)

  return ((data ?? []) as Array<{
    id: string; name: string; phone: string | null; referral_code: string | null
    credito_acumulado: number; credito_usado: number; last_visit: string | null
  }>)
    .map((c) => ({
      id: c.id, name: c.name, phone: c.phone, referral_code: c.referral_code,
      credito_disponible: Math.max(0, Number(c.credito_acumulado) - Number(c.credito_usado)),
      last_visit: c.last_visit,
    }))
    .filter((c) => c.credito_disponible > 0)
}

export async function applyCredit(referralUseId: string, clientId: string, amount: number) {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { error: 'No autorizado' }

  const { data: client } = await supabase
    .from('clients')
    .select('credito_usado')
    .eq('id', clientId)
    .maybeSingle()

  const newUsed = (Number(client?.credito_usado) || 0) + amount

  await Promise.all([
    supabase.from('clients').update({ credito_usado: newUsed }).eq('id', clientId),
    supabase
      .from('referral_uses')
      .update({ estado: 'aplicado', beneficio_aplicado_at: new Date().toISOString() })
      .eq('id', referralUseId)
      .eq('barbershop_id', barbershopId),
  ])

  revalidatePath('/dashboard/referidos')
  return { success: true }
}

// ── For booking page (no auth required) ──────────────────────

export async function validateReferralCode(codigo: string, barbershopId: string): Promise<{
  valid: boolean
  clienteName?: string
  beneficio?: string
  clienteId?: string
  error?: string
}> {
  const supabase = await createClient()

  const { data: client } = await supabase
    .from('clients')
    .select('id, name, referral_code, barbershop_id')
    .eq('referral_code', codigo.toUpperCase().trim())
    .eq('barbershop_id', barbershopId)
    .maybeSingle()

  if (!client) return { valid: false, error: 'Este código no es válido para esta barbería' }

  const { data: program } = await supabase
    .from('referral_program')
    .select('activo, tipo_beneficio, valor_beneficio')
    .eq('barbershop_id', barbershopId)
    .eq('activo', true)
    .maybeSingle()

  if (!program) return { valid: false, error: 'El programa de referidos no está activo' }

  const beneficio = program.tipo_beneficio === 'porcentaje'
    ? `${program.valor_beneficio}% de descuento`
    : `$${Number(program.valor_beneficio).toLocaleString('es-CO')} de descuento`

  return { valid: true, clienteName: client.name, beneficio, clienteId: client.id }
}

export async function registerReferralUse(data: {
  barbershopId: string
  referralCode: string
  clienteQueRefirio: string
  clienteNuevo: string | null
  creditoOtorgado: number
}) {
  const supabase = await createClient()

  const { error } = await supabase.from('referral_uses').insert({
    barbershop_id: data.barbershopId,
    referral_code: data.referralCode.toUpperCase(),
    cliente_que_refirio: data.clienteQueRefirio,
    cliente_nuevo: data.clienteNuevo,
    credito_otorgado: data.creditoOtorgado,
    estado: 'pendiente',
  })

  if (error) return { error: error.message }

  // Accumulate credit for the referrer
  const { data: referidor } = await supabase
    .from('clients')
    .select('credito_acumulado')
    .eq('id', data.clienteQueRefirio)
    .maybeSingle()

  const newCredit = (Number(referidor?.credito_acumulado) || 0) + data.creditoOtorgado
  await supabase.from('clients').update({ credito_acumulado: newCredit }).eq('id', data.clienteQueRefirio)

  return { success: true }
}
