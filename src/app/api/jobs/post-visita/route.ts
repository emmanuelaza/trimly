import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/serviceRole';
import { getResend } from '@/lib/resend';
import { getBaseEmailTemplate } from '@/lib/emailTemplates';

export async function POST(req: Request) {
  try {
    const { citaId } = await req.json();
    if (!citaId) return NextResponse.json({ error: 'Falta citaId' }, { status: 400 });

    const supabaseAdmin = getSupabaseAdmin();
    const resend = getResend();

    const { data: app, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        barbershop_id,
        client:clients(name, email)
      `)
      .eq('id', citaId)
      .single();

    if (error || !app) throw new Error('Cita no encontrada');

    const { data: auto } = await supabaseAdmin
      .from('automations')
      .select('is_active')
      .eq('barbershop_id', app.barbershop_id)
      .eq('type', 'post_visit')
      .single();

    const clientData = app.client as any;

    if (auto?.is_active && clientData?.email) {
      const html = getBaseEmailTemplate(
        "¿Cómo te fue?",
        `<p>Hola <strong>${clientData.name}</strong>, esperamos que hayas disfrutado de tu visita.</p>
         <p>¿Te gustaría ayudarnos a mejorar? Tu opinión es muy valiosa para nosotros.</p>
         <p>Puedes dejarnos una reseña en Google haciendo clic en el siguiente enlace:</p>
         <p><a href="#" style="color: #0070f3;">Dejar reseña</a></p>`
      );

      await resend.emails.send({
        from: 'Trimly <no-reply@trimlyapp.com>',
        to: clientData.email,
        subject: '⭐ ¿Cómo te quedó el corte?',
        html
      });

      await supabaseAdmin.from('automation_logs').insert({
        automation_type: 'post_visit',
        appointment_id: app.id,
        client_id: (app as any).client_id,
        channel: 'email',
        barbershop_id: app.barbershop_id
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('JOB ERROR (Post Visit):', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
