'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getBarbershopId } from '@/lib/getBarbershopId'

export interface ReferralProgram {
  id: string
  barbershop_id: string
  activo: boolean
  tipo_beneficio: 'porcentaje' | 'monto_fijo'
  valor_beneficio: number
  descripcion: string | null
  created_at: string
}

export interface ReferralUse {
  id: string
  barbershop_id: string
  referrer_nombre: string
  referred_nombre: string
  fecha: string
  beneficio_aplicado: boolean
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

export async function getReferralUses(): Promise<ReferralUse[]> {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return []

  const { data } = await supabase
    .from('referral_uses')
    .select('*')
    .eq('barbershop_id', barbershopId)
    .order('fecha', { ascending: false })

  return (data ?? []) as ReferralUse[]
}

export async function upsertReferralProgram(formData: FormData) {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { error: 'No autorizado' }

  const activo = formData.get('activo') === 'true'
  const tipo_beneficio = formData.get('tipo_beneficio') as string
  const valor_beneficio = Number(formData.get('valor_beneficio') ?? 0)
  const descripcion = (formData.get('descripcion') as string) || null

  const { data: existing } = await supabase
    .from('referral_program')
    .select('id')
    .eq('barbershop_id', barbershopId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('referral_program')
      .update({ activo, tipo_beneficio, valor_beneficio, descripcion })
      .eq('id', existing.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('referral_program')
      .insert({ barbershop_id: barbershopId, activo, tipo_beneficio, valor_beneficio, descripcion })
    if (error) return { error: error.message }
  }

  revalidatePath('/dashboard/referidos')
  return { success: true }
}
