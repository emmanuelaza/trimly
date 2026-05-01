import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/serviceRole';
import { getResend } from '@/lib/resend';
import { getBaseEmailTemplate } from '@/lib/emailTemplates';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const resend = getResend();
    
    // Buscar cualquier cliente con email para la prueba
    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .select('id, name, email, barbershop_id')
      .not('email', 'is', null)
      .limit(1)
      .single();

    if (error || !client) {
      return NextResponse.json({ success: false, error: "No hay clientes con email registrado" });
    }

    const html = getBaseEmailTemplate(
      "TEST - ¡Te extrañamos!",
      `<p>Hola <strong>${client.name}</strong>, esto es una prueba del mensaje de recuperación de clientes inactivos.</p>
       <p>Hace tiempo no nos visitas y el equipo de la barbería te extraña. ✂️</p>
       <p>¿Qué tal si agendas una cita para este fin de semana? ¡Te esperamos con el mejor servicio!</p>`
    );

    await resend.emails.send({
      from: 'Trimly <no-reply@trimlyapp.com>',
      to: client.email,
      subject: '✂️ TEST: Te extrañamos',
      html
    });

    return NextResponse.json({ success: true, sentTo: client.email });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
