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

    // Consultar cita con detalles
    const { data: app, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        id, 
        scheduled_at, 
        barbershop_id,
        client:clients(name, email),
        service:services(name),
        barber:barbers(name)
      `)
      .eq('id', citaId)
      .single();

    if (error || !app) throw new Error('Cita no encontrada');

    // Verificar automatización
    const { data: auto } = await supabaseAdmin
      .from('automations')
      .select('is_active')
      .eq('barbershop_id', app.barbershop_id)
      .eq('type', 'confirmation')
      .single();

    const clientData = app.client as any;
    const serviceData = app.service as any;
    const barberData = app.barber as any;

    if (auto?.is_active && clientData?.email) {
      const date = new Date(app.scheduled_at).toLocaleDateString();
      const time = new Date(app.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const html = getBaseEmailTemplate(
        "Cita Confirmada",
        `<p>Hola <strong>${clientData.name}</strong>, tu cita ha sido confirmada con éxito.</p>
         <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
           <p><strong>Servicio:</strong> ${serviceData?.name}</p>
           <p><strong>Barbero:</strong> ${barberData?.name || 'Por asignar'}</p>
           <p><strong>Fecha:</strong> ${date}</p>
           <p><strong>Hora:</strong> ${time}</p>
         </div>
         <p>¡Gracias por elegirnos!</p>`
      );

      await resend.emails.send({
        from: 'Trimly <no-reply@trimlyapp.com>',
        to: clientData.email,
        subject: '✅ Cita confirmada en Trimly',
        html
      });

      await supabaseAdmin.from('automation_logs').insert({
        automation_type: 'confirmation',
        appointment_id: app.id,
        client_id: (app as any).client_id,
        channel: 'email',
        barbershop_id: app.barbershop_id
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('JOB ERROR (Confirmation):', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
