import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { codigo, barbershopId } = await req.json()
    if (!codigo || !barbershopId) return NextResponse.json({ valid: false })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: client } = await supabase
      .from('clients')
      .select('id, name')
      .eq('referral_code', (codigo as string).toUpperCase().trim())
      .eq('barbershop_id', barbershopId)
      .maybeSingle()

    if (!client) return NextResponse.json({ valid: false, error: 'Código no válido' })

    const { data: program } = await supabase
      .from('referral_program')
      .select('activo, tipo_beneficio, valor_beneficio')
      .eq('barbershop_id', barbershopId)
      .eq('activo', true)
      .maybeSingle()

    if (!program) return NextResponse.json({ valid: false, error: 'Programa de referidos inactivo' })

    const beneficio =
      program.tipo_beneficio === 'porcentaje'
        ? `${program.valor_beneficio}% de descuento`
        : `$${Number(program.valor_beneficio).toLocaleString('es-CO')} de descuento`

    return NextResponse.json({
      valid: true,
      clienteName: client.name,
      clienteId: client.id,
      beneficio,
      valorBeneficio: Number(program.valor_beneficio),
      tipoBeneficio: program.tipo_beneficio,
    })
  } catch {
    return NextResponse.json({ valid: false })
  }
}
