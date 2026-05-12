'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getBarbershopId } from '@/lib/getBarbershopId'

export type ExpenseCategoria =
  | 'arriendo'
  | 'servicios_publicos'
  | 'insumos'
  | 'nomina'
  | 'marketing'
  | 'equipos'
  | 'impuestos'
  | 'otro'

export interface Expense {
  id: string
  barbershop_id: string
  categoria: ExpenseCategoria
  descripcion: string
  monto: number
  fecha: string
  es_recurrente: boolean
  frecuencia: string | null
  notas: string | null
  created_at: string
}

export interface ResumenFinanciero {
  ingresosMes: number
  egresosMes: number
  gastosNomina: number
  gananciaNeta: number
  citasCompletadas: number
  ticketPromedio: number
  ingresosMesAnterior: number
  egresosMesAnterior: number
  ingresosPorDia: { dia: string; ingresos: number }[]
  egresosPorCategoria: { categoria: string; monto: number }[]
  ingresosPorServicio: { nombre: string; ingresos: number; count: number }[]
}

export async function getResumenFinanciero(mes?: string): Promise<ResumenFinanciero | null> {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return null

  const now = new Date()
  const year = mes ? parseInt(mes.split('-')[0]) : now.getFullYear()
  const month = mes ? parseInt(mes.split('-')[1]) - 1 : now.getMonth()

  const inicioMes = new Date(year, month, 1)
  const finMes = new Date(year, month + 1, 0, 23, 59, 59)
  const inicioMesAnterior = new Date(year, month - 1, 1)
  const finMesAnterior = new Date(year, month, 0, 23, 59, 59)

  const [{ data: appointments }, { data: expenses }, { data: expensesAnterior }, { data: nominaPagos }] =
    await Promise.all([
      supabase
        .from('appointments')
        .select('scheduled_at, total_price, status, service_id, services(name)')
        .eq('barbershop_id', barbershopId)
        .gte('scheduled_at', inicioMesAnterior.toISOString())
        .lte('scheduled_at', finMes.toISOString()),
      supabase
        .from('expenses')
        .select('*')
        .eq('barbershop_id', barbershopId)
        .gte('fecha', inicioMes.toISOString().split('T')[0])
        .lte('fecha', finMes.toISOString().split('T')[0]),
      supabase
        .from('expenses')
        .select('monto')
        .eq('barbershop_id', barbershopId)
        .gte('fecha', inicioMesAnterior.toISOString().split('T')[0])
        .lte('fecha', finMesAnterior.toISOString().split('T')[0]),
      supabase
        .from('nomina_payments')
        .select('amount_barber')
        .eq('barbershop_id', barbershopId)
        .gte('payment_date', inicioMes.toISOString())
        .lte('payment_date', finMes.toISOString()),
    ])

  type ApptRow = {
    scheduled_at: string
    total_price: number | null
    status: string
    service_id: string | null
    services: { name: string } | null
  }

  const allAppts = (appointments ?? []) as ApptRow[]
  const completedMes = allAppts.filter(
    (a) => a.status === 'completed' && new Date(a.scheduled_at) >= inicioMes,
  )
  const completedAnterior = allAppts.filter(
    (a) =>
      a.status === 'completed' &&
      new Date(a.scheduled_at) >= inicioMesAnterior &&
      new Date(a.scheduled_at) <= finMesAnterior,
  )

  const ingresosMes = completedMes.reduce((s, a) => s + Number(a.total_price ?? 0), 0)
  const ingresosMesAnterior = completedAnterior.reduce((s, a) => s + Number(a.total_price ?? 0), 0)

  const expensesMes = (expenses ?? []) as Expense[]
  const egresosMes = expensesMes.reduce((s, e) => s + Number(e.monto), 0)
  const egresosMesAnterior = (expensesAnterior ?? []).reduce((s: number, e: { monto: number }) => s + Number(e.monto), 0)

  const gastosNomina = (nominaPagos ?? []).reduce((s: number, p: { amount_barber: number }) => s + Number(p.amount_barber), 0)
  const gananciaNeta = ingresosMes - egresosMes - gastosNomina
  const ticketPromedio = completedMes.length > 0 ? Math.round(ingresosMes / completedMes.length) : 0

  // Ingresos por día
  const diaMap: Record<string, number> = {}
  for (const a of completedMes) {
    const dia = new Date(a.scheduled_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
    diaMap[dia] = (diaMap[dia] ?? 0) + Number(a.total_price ?? 0)
  }
  const ingresosPorDia = Object.entries(diaMap).map(([dia, ingresos]) => ({ dia, ingresos }))

  // Egresos por categoría
  const catMap: Record<string, number> = {}
  for (const e of expensesMes) {
    catMap[e.categoria] = (catMap[e.categoria] ?? 0) + Number(e.monto)
  }
  const egresosPorCategoria = Object.entries(catMap)
    .map(([categoria, monto]) => ({ categoria, monto }))
    .sort((a, b) => b.monto - a.monto)

  // Ingresos por servicio
  const svcMap: Record<string, { nombre: string; ingresos: number; count: number }> = {}
  for (const a of completedMes) {
    const nombre = (a.services as { name: string } | null)?.name ?? 'Otro'
    if (!svcMap[nombre]) svcMap[nombre] = { nombre, ingresos: 0, count: 0 }
    svcMap[nombre].ingresos += Number(a.total_price ?? 0)
    svcMap[nombre].count++
  }
  const ingresosPorServicio = Object.values(svcMap).sort((a, b) => b.ingresos - a.ingresos).slice(0, 6)

  return {
    ingresosMes,
    egresosMes,
    gastosNomina,
    gananciaNeta,
    citasCompletadas: completedMes.length,
    ticketPromedio,
    ingresosMesAnterior,
    egresosMesAnterior,
    ingresosPorDia,
    egresosPorCategoria,
    ingresosPorServicio,
  }
}

export async function getExpenses(mes?: string): Promise<Expense[]> {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return []

  let query = supabase.from('expenses').select('*').eq('barbershop_id', barbershopId)

  if (mes) {
    const [y, m] = mes.split('-').map(Number)
    const start = new Date(y, m - 1, 1).toISOString().split('T')[0]
    const end = new Date(y, m, 0).toISOString().split('T')[0]
    query = query.gte('fecha', start).lte('fecha', end)
  }

  const { data } = await query.order('fecha', { ascending: false })
  return (data ?? []) as Expense[]
}

export async function createExpense(formData: FormData) {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { error: 'No autorizado' }

  const { error } = await supabase.from('expenses').insert({
    barbershop_id: barbershopId,
    categoria: formData.get('categoria') as ExpenseCategoria,
    descripcion: formData.get('descripcion') as string,
    monto: Number(formData.get('monto')),
    fecha: formData.get('fecha') as string,
    es_recurrente: formData.get('es_recurrente') === 'true',
    frecuencia: (formData.get('frecuencia') as string) || null,
    notas: (formData.get('notas') as string) || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/reportes')
  return { success: true }
}

export async function updateExpense(id: string, formData: FormData) {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { error: 'No autorizado' }

  const { error } = await supabase
    .from('expenses')
    .update({
      categoria: formData.get('categoria') as ExpenseCategoria,
      descripcion: formData.get('descripcion') as string,
      monto: Number(formData.get('monto')),
      fecha: formData.get('fecha') as string,
      es_recurrente: formData.get('es_recurrente') === 'true',
      frecuencia: (formData.get('frecuencia') as string) || null,
      notas: (formData.get('notas') as string) || null,
    })
    .eq('id', id)
    .eq('barbershop_id', barbershopId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/reportes')
  return { success: true }
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return { error: 'No autorizado' }

  const { error } = await supabase.from('expenses').delete().eq('id', id).eq('barbershop_id', barbershopId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/reportes')
  return { success: true }
}
