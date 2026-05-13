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
  ciudad: string | null
  horario: Record<string, unknown>
  activo: boolean
  created_at: string
}

export async function getSedes(): Promise<Sede[]> {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return []

  const { data } = await supabase
    .from('locations')
    .select('*')
    .eq('barbershop_id', barbershopId)
    .order('created_at', { ascending: true })

  return (data ?? []) as Sede[]
}

export async function createSede(formData: FormData) {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { error: 'No autorizado' }

  const nombre = (formData.get('nombre') as string)?.trim()
  if (!nombre) return { error: 'El nombre es obligatorio' }

  const { error } = await supabase.from('locations').insert({
    barbershop_id: barbershopId,
    nombre,
    direccion: (formData.get('direccion') as string) || null,
    telefono: (formData.get('telefono') as string) || null,
    ciudad: (formData.get('ciudad') as string) || null,
    horario: {},
    activo: true,
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/sedes')
  return { success: true }
}

export async function updateSede(id: string, formData: FormData) {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { error: 'No autorizado' }

  const nombre = (formData.get('nombre') as string)?.trim()
  if (!nombre) return { error: 'El nombre es obligatorio' }

  const { error } = await supabase
    .from('locations')
    .update({
      nombre,
      direccion: (formData.get('direccion') as string) || null,
      telefono: (formData.get('telefono') as string) || null,
      ciudad: (formData.get('ciudad') as string) || null,
    })
    .eq('id', id)
    .eq('barbershop_id', barbershopId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/sedes')
  return { success: true }
}

export async function toggleSede(id: string, activo: boolean) {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { error: 'No autorizado' }

  const { error } = await supabase
    .from('locations')
    .update({ activo: !activo })
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

export async function assignBarberToSede(barberId: string, locationId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('barber_locations')
    .upsert({ barber_id: barberId, location_id: locationId })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/sedes')
  return { success: true }
}

export async function removeBarberFromSede(barberId: string, locationId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('barber_locations')
    .delete()
    .eq('barber_id', barberId)
    .eq('location_id', locationId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/sedes')
  return { success: true }
}
