'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getBarbershopId } from '@/lib/getBarbershopId'

export interface Cupon {
  id: string
  barbershop_id: string
  codigo: string
  tipo: 'porcentaje' | 'monto_fijo'
  valor: number
  usos_maximos: number
  usos_actuales: number
  activo: boolean
  fecha_vencimiento: string | null
  created_at: string
}

export async function getCupones(): Promise<Cupon[]> {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return []

  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('barbershop_id', barbershopId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching coupons:', error)
    return []
  }
  return (data ?? []) as Cupon[]
}

export async function createCupon(formData: FormData) {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { error: 'No autorizado' }

  const codigo = (formData.get('codigo') as string ?? '').toUpperCase().trim()
  const tipo = formData.get('tipo') as string
  const valor = Number(formData.get('valor'))
  const usos_maximos = Number(formData.get('usos_maximos') ?? 0)
  const fecha_vencimiento = (formData.get('fecha_vencimiento') as string) || null

  if (!codigo || !tipo || !valor) return { error: 'Completa todos los campos requeridos' }

  const { error } = await supabase.from('coupons').insert({
    barbershop_id: barbershopId,
    codigo,
    tipo,
    valor,
    usos_maximos,
    usos_actuales: 0,
    activo: true,
    fecha_vencimiento,
  })

  if (error) {
    if (error.code === '23505') return { error: 'Este código ya existe. Usa uno diferente.' }
    return { error: error.message }
  }

  revalidatePath('/dashboard/cupones')
  return { success: true, codigo }
}

export async function toggleCupon(id: string, activo: boolean) {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { error: 'No autorizado' }

  const { error } = await supabase
    .from('coupons')
    .update({ activo })
    .eq('id', id)
    .eq('barbershop_id', barbershopId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/cupones')
  return { success: true }
}

export async function deleteCupon(id: string) {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { error: 'No autorizado' }

  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', id)
    .eq('barbershop_id', barbershopId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/cupones')
  return { success: true }
}
