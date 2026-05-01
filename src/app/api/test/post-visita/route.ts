import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/serviceRole';
import { getResend } from '@/lib/resend';
import { getBaseEmailTemplate } from '@/lib/emailTemplates';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const resend = getResend();
    
    // Buscar la cita más reciente
    const { data: app, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        barbershop_id,
        client:clients(name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !app) {
      return NextResponse.json({ success: false, error: "No hay citas en la base de datos" });
    }

    const clientData = app.client as any;

    if (!clientData?.email) {
      return NextResponse.json({ success: false, error: "El cliente más reciente no tiene email" });
    }

    const html = getBaseEmailTemplate(
      "TEST - ¿Cómo te fue?",
      `<p>Hola <strong>${clientData.name}</strong>, esto es una prueba del mensaje de seguimiento post-visita.</p>
       <p>¿Te gustaría ayudarnos a mejorar? Tu opinión es muy valiosa para nosotros.</p>
       <p>Puedes dejarnos una reseña en Google haciendo clic en el siguiente enlace:</p>
       <p><a href="#" style="color: #0070f3;">Dejar reseña</a></p>`
    );

    await resend.emails.send({
      from: 'Trimly <no-reply@trimlyapp.com>',
      to: clientData.email,
      subject: '⭐ TEST: ¿Cómo te quedó el corte?',
      html
    });

    return NextResponse.json({ success: true, sentTo: clientData.email });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
