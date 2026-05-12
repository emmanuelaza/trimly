'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getBarbershopId } from '@/lib/getBarbershopId'

export interface Resena {
  id: string
  barbershop_id: string
  appointment_id: string | null
  barber_id: string | null
  cliente_nombre: string
  calificacion: number
  comentario: string | null
  es_publica: boolean
  mostrar_en_pagina: boolean
  leida: boolean
  created_at: string
  barbers?: { name: string } | null
}

export async function getResenas(): Promise<Resena[]> {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return []

  const { data, error } = await supabase
    .from('reviews')
    .select('*, barbers(name)')
    .eq('barbershop_id', barbershopId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reviews:', error)
    return []
  }
  return (data ?? []) as Resena[]
}

export async function toggleMostrarEnPagina(id: string, mostrar: boolean) {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { error: 'No autorizado' }

  const { error } = await supabase
    .from('reviews')
    .update({ mostrar_en_pagina: mostrar })
    .eq('id', id)
    .eq('barbershop_id', barbershopId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/resenas')
  return { success: true }
}

export async function marcarLeida(id: string) {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { error: 'No autorizado' }

  await supabase
    .from('reviews')
    .update({ leida: true })
    .eq('id', id)
    .eq('barbershop_id', barbershopId)

  revalidatePath('/dashboard/resenas')
  return { success: true }
}

export async function deleteResena(id: string) {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { error: 'No autorizado' }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id)
    .eq('barbershop_id', barbershopId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/resenas')
  return { success: true }
}
