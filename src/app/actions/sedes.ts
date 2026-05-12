'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getBarbershopId } from '@/lib/getBarbershopId'

export interface Sede {
  id: string
  barbershop_id: string
  nombre: string
  direccion: string | null
  telefono: string | null
  activo: boolean
  created_at: string
}

export async function getSedes(): Promise<Sede[]> {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return []

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('barbershop_id', barbershopId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching locations:', error)
    return []
  }
  return (data ?? []) as Sede[]
}

export async function createSede(formData: FormData) {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { error: 'No autorizado' }

  const nombre = (formData.get('nombre') as string)?.trim()
  const direccion = (formData.get('direccion') as string) || null
  const telefono = (formData.get('telefono') as string) || null

  if (!nombre) return { error: 'El nombre es obligatorio' }

  const { error } = await supabase.from('locations').insert({
    barbershop_id: barbershopId,
    nombre,
    direccion,
    telefono,
    activo: true,
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/sedes')
  return { success: true, nombre }
}

export async function updateSede(id: string, formData: FormData) {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { error: 'No autorizado' }

  const nombre = (formData.get('nombre') as string)?.trim()
  const direccion = (formData.get('direccion') as string) || null
  const telefono = (formData.get('telefono') as string) || null

  const { error } = await supabase
    .from('locations')
    .update({ nombre, direccion, telefono })
    .eq('id', id)
    .eq('barbershop_id', barbershopId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/sedes')
  return { success: true }
}

export async function deleteSede(id: string) {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { error: 'No autorizado' }

  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id)
    .eq('barbershop_id', barbershopId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/sedes')
  return { success: true }
}
