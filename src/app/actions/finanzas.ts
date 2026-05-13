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
  created_at: string
}

export interface ResumenFinanciero {
  ingresosBrutos: number
  descuentosTotales: number
  ingresosNetos: number
  ingresosPases: number
  egresosMes: number
  gastosNomina: number
  utilidadNeta: number
  citasCompletadas: number
  ticketPromedio: number
  ingresosNetosMesAnterior: number
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

  const [
    { data: apptsMes },
    { data: apptsAnterior },
    { data: expenses },
    { data: expensesAnterior },
    { data: nominaPagos },
    { data: pasesMes },
  ] = await Promise.all([
    supabase
      .from('appointments')
      .select('scheduled_at, price_charged, descuento_aplicado, descuento_referido, service_id, services(name, price)')
      .eq('barbershop_id', barbershopId)
      .eq('status', 'completed')
      .gte('scheduled_at', inicioMes.toISOString())
      .lte('scheduled_at', finMes.toISOString()),
    supabase
      .from('appointments')
      .select('price_charged, descuento_aplicado, descuento_referido')
      .eq('barbershop_id', barbershopId)
      .eq('status', 'completed')
      .gte('scheduled_at', inicioMesAnterior.toISOString())
      .lte('scheduled_at', finMesAnterior.toISOString()),
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
      .eq('status', 'paid')
      .gte('payment_date', inicioMes.toISOString())
      .lte('payment_date', finMes.toISOString()),
    supabase
      .from('client_subscriptions')
      .select('price_paid')
      .eq('barbershop_id', barbershopId)
      .gte('starts_at', inicioMes.toISOString().split('T')[0])
      .lte('starts_at', finMes.toISOString().split('T')[0]),
  ])

  type ApptRow = {
    scheduled_at: string
    price_charged: number | null
    descuento_aplicado: number | null
    descuento_referido: number | null
    service_id: string | null
    services: { name: string; price: number } | null
  }

  const mesAppts = (apptsMes ?? []) as ApptRow[]
  const anteriorAppts = (apptsAnterior ?? []) as Pick<ApptRow, 'price_charged' | 'descuento_aplicado' | 'descuento_referido'>[]

  const effectivePrice = (a: Pick<ApptRow, 'price_charged' | 'descuento_aplicado' | 'descuento_referido'> & { services?: { price: number } | null }) => {
    const bruto = Number(a.price_charged ?? (a as ApptRow).services?.price ?? 0)
    const desc = Number((a as ApptRow).descuento_aplicado ?? 0) + Number((a as ApptRow).descuento_referido ?? 0)
    return { bruto, neto: bruto - desc, desc }
  }

  let ingresosBrutos = 0, descuentosTotales = 0, ingresosNetos = 0
  for (const a of mesAppts) {
    const { bruto, neto, desc } = effectivePrice(a)
    ingresosBrutos += bruto
    descuentosTotales += desc
    ingresosNetos += neto
  }

  let ingresosNetosMesAnterior = 0
  for (const a of anteriorAppts) {
    const bruto = Number(a.price_charged ?? 0)
    const desc = Number(a.descuento_aplicado ?? 0) + Number(a.descuento_referido ?? 0)
    ingresosNetosMesAnterior += bruto - desc
  }

  const expensesMes = (expenses ?? []) as Expense[]
  const egresosMes = expensesMes.reduce((s, e) => s + Number(e.monto), 0)
  const egresosMesAnterior = (expensesAnterior ?? []).reduce(
    (s: number, e: { monto: number }) => s + Number(e.monto), 0,
  )
  const gastosNomina = (nominaPagos ?? []).reduce(
    (s: number, p: { amount_barber: number }) => s + Number(p.amount_barber), 0,
  )
  const ingresosPases = (pasesMes ?? []).reduce(
    (s: number, p: { price_paid: number }) => s + Number(p.price_paid ?? 0), 0,
  )
  const utilidadNeta = ingresosNetos + ingresosPases - egresosMes - gastosNomina
  const ticketPromedio = mesAppts.length > 0 ? Math.round(ingresosNetos / mesAppts.length) : 0

  // Ingresos netos por día
  const diaMap: Record<string, number> = {}
  for (const a of mesAppts) {
    const dia = new Date(a.scheduled_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
    const bruto = Number(a.price_charged ?? a.services?.price ?? 0)
    const desc = Number(a.descuento_aplicado ?? 0) + Number(a.descuento_referido ?? 0)
    diaMap[dia] = (diaMap[dia] ?? 0) + (bruto - desc)
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

  // Ingresos netos por servicio
  const svcMap: Record<string, { nombre: string; ingresos: number; count: number }> = {}
  for (const a of mesAppts) {
    const nombre = (a.services as { name: string } | null)?.name ?? 'Otro'
    if (!svcMap[nombre]) svcMap[nombre] = { nombre, ingresos: 0, count: 0 }
    const bruto = Number(a.price_charged ?? a.services?.price ?? 0)
    const desc = Number(a.descuento_aplicado ?? 0) + Number(a.descuento_referido ?? 0)
    svcMap[nombre].ingresos += bruto - desc
    svcMap[nombre].count++
  }
  const ingresosPorServicio = Object.values(svcMap).sort((a, b) => b.ingresos - a.ingresos).slice(0, 6)

  return {
    ingresosBrutos,
    descuentosTotales,
    ingresosNetos,
    ingresosPases,
    egresosMes,
    gastosNomina,
    utilidadNeta,
    citasCompletadas: mesAppts.length,
    ticketPromedio,
    ingresosNetosMesAnterior,
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
    descripcion: (formData.get('descripcion') as string).trim(),
    monto: Number(formData.get('monto')),
    fecha: formData.get('fecha') as string,
    es_recurrente: formData.get('es_recurrente') === 'true',
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
      descripcion: (formData.get('descripcion') as string).trim(),
      monto: Number(formData.get('monto')),
      fecha: formData.get('fecha') as string,
      es_recurrente: formData.get('es_recurrente') === 'true',
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
