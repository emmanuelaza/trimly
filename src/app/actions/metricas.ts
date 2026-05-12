'use server'

import { createClient } from '@/lib/supabase/server'
import { getBarbershopId } from '@/lib/getBarbershopId'

export interface MetricasData {
  diasDeData: number
  totalCitasHistorico: number
  ingresosMes: number
  ingresosMesAnterior: number
  ticketPromedio: number
  tasaCompletacion: number
  clientesNuevosMes: number
  clientesRecurrentes: number
  topServicios: { nombre: string; count: number; ingresos: number }[]
  topClientes: { nombre: string; visitas: number; gasto: number }[]
  citasPorHora: { hora: string; count: number }[]
  ingresosPorDia: { dia: string; ingresos: number }[]
}

export async function getMetricasData(): Promise<MetricasData | null> {
  const supabase = await createClient()
  const barbershopId = await getBarbershopId()
  if (!barbershopId) return null

  const now = new Date()
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1)
  const inicioMesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const finMesAnterior = new Date(now.getFullYear(), now.getMonth(), 0)
  const hace30dias = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Fetch all completed appointments (last 90 days for sufficient data)
  const hace90dias = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  type ApptRow = {
    id: string
    scheduled_at: string
    price_charged: number | null
    status: string
    service_id: string | null
    client_id: string | null
    services: { name: string; price: number } | null
    clients: { name: string; created_at: string } | null
  }

  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, scheduled_at, price_charged, status, service_id, client_id, services(name, price), clients(name, created_at)')
    .eq('barbershop_id', barbershopId)
    .gte('scheduled_at', hace90dias.toISOString())
    .order('scheduled_at', { ascending: true })

  const allAppts: ApptRow[] = (appointments ?? []) as ApptRow[]

  // Días de data desde la primera cita de Supabase (para mostrar progreso)
  const { data: firstAppt } = await supabase
    .from('appointments')
    .select('scheduled_at')
    .eq('barbershop_id', barbershopId)
    .order('scheduled_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  const diasDeData = firstAppt
    ? Math.floor((now.getTime() - new Date(firstAppt.scheduled_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const { data: totalCitasRow } = await supabase
    .from('appointments')
    .select('id', { count: 'exact' })
    .eq('barbershop_id', barbershopId)
    .eq('status', 'completed')

  const totalCitasHistorico = (totalCitasRow as unknown as { count: number } | null)?.count ?? 0

  const completed = allAppts.filter((a) => a.status === 'completed')

  // Ingresos del mes actual y anterior
  const citasMes = completed.filter((a) => new Date(a.scheduled_at) >= inicioMes)
  const citasMesAnterior = completed.filter(
    (a) => new Date(a.scheduled_at) >= inicioMesAnterior && new Date(a.scheduled_at) <= finMesAnterior,
  )

  const ingresosMes = citasMes.reduce((s, a) => s + Number(a.price_charged ?? a.services?.price ?? 0), 0)
  const ingresosMesAnterior = citasMesAnterior.reduce((s, a) => s + Number(a.price_charged ?? a.services?.price ?? 0), 0)
  const ticketPromedio = completed.length > 0 ? Math.round(ingresosMes / (citasMes.length || 1)) : 0

  const totalAppts90 = allAppts.filter((a) => a.status !== 'cancelled').length
  const tasaCompletacion = totalAppts90 > 0 ? Math.round((completed.length / totalAppts90) * 100) : 0

  // Clientes nuevos este mes
  const clientIdsInMonth = [...new Set(citasMes.map((a) => a.client_id).filter(Boolean))]
  const clienteNuevosMes = allAppts.filter(
    (a) =>
      a.client_id &&
      clientIdsInMonth.includes(a.client_id) &&
      a.clients?.created_at &&
      new Date(a.clients.created_at) >= inicioMes,
  )
  const clientesNuevosMes = new Set(clienteNuevosMes.map((a) => a.client_id)).size

  // Clientes recurrentes (más de 1 cita en últimos 30 días)
  const recientes = completed.filter((a) => new Date(a.scheduled_at) >= hace30dias)
  const visitasPorCliente: Record<string, number> = {}
  for (const a of recientes) {
    if (a.client_id) visitasPorCliente[a.client_id] = (visitasPorCliente[a.client_id] ?? 0) + 1
  }
  const clientesRecurrentes = Object.values(visitasPorCliente).filter((v) => v > 1).length

  // Top servicios
  const servicioMap: Record<string, { nombre: string; count: number; ingresos: number }> = {}
  for (const a of completed) {
    const nombre = (a.services as { name: string } | null)?.name ?? 'Otro'
    if (!servicioMap[nombre]) servicioMap[nombre] = { nombre, count: 0, ingresos: 0 }
    servicioMap[nombre].count++
    servicioMap[nombre].ingresos += Number(a.price_charged ?? a.services?.price ?? 0)
  }
  const topServicios = Object.values(servicioMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Top clientes
  const clienteMap: Record<string, { nombre: string; visitas: number; gasto: number }> = {}
  for (const a of completed) {
    const nombre = (a.clients as { name: string } | null)?.name ?? 'Cliente'
    const key = a.client_id ?? nombre
    if (!clienteMap[key]) clienteMap[key] = { nombre, visitas: 0, gasto: 0 }
    clienteMap[key].visitas++
    clienteMap[key].gasto += Number(a.price_charged ?? a.services?.price ?? 0)
  }
  const topClientes = Object.values(clienteMap)
    .sort((a, b) => b.visitas - a.visitas)
    .slice(0, 5)

  // Citas por hora
  const horaCounts: Record<string, number> = {}
  for (const a of completed) {
    const hora = new Date(a.scheduled_at).getHours()
    const label = `${hora}:00`
    horaCounts[label] = (horaCounts[label] ?? 0) + 1
  }
  const citasPorHora = Object.entries(horaCounts)
    .map(([hora, count]) => ({ hora, count }))
    .sort((a, b) => parseInt(a.hora) - parseInt(b.hora))

  // Ingresos por día (últimos 14 días)
  const hace14 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const recientes14 = completed.filter((a) => new Date(a.scheduled_at) >= hace14)
  const diaMap: Record<string, number> = {}
  for (const a of recientes14) {
    const dia = new Date(a.scheduled_at).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' })
    diaMap[dia] = (diaMap[dia] ?? 0) + Number(a.price_charged ?? a.services?.price ?? 0)
  }
  const ingresosPorDia = Object.entries(diaMap).map(([dia, ingresos]) => ({ dia, ingresos }))

  return {
    diasDeData,
    totalCitasHistorico: typeof totalCitasHistorico === 'number' ? totalCitasHistorico : 0,
    ingresosMes,
    ingresosMesAnterior,
    ticketPromedio,
    tasaCompletacion,
    clientesNuevosMes,
    clientesRecurrentes,
    topServicios,
    topClientes,
    citasPorHora,
    ingresosPorDia,
  }
}
