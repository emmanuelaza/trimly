import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/serviceRole';
import { getResend } from '@/lib/resend';
import { getBaseEmailTemplate } from '@/lib/emailTemplates';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const resend = getResend();
    
    // Buscar la próxima cita agendada
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
      .eq('status', 'confirmed')
      .order('scheduled_at', { ascending: true })
      .limit(1)
      .single();

    if (error || !app) {
      return NextResponse.json({ success: false, error: "No hay citas próximas para probar" });
    }

    const clientData = app.client as any;
    const serviceData = app.service as any;
    const barberData = app.barber as any;

    if (!clientData?.email) {
      return NextResponse.json({ success: false, error: "La cita encontrada no tiene email de cliente" });
    }

    const time = new Date(app.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const html = getBaseEmailTemplate(
      "TEST - Recordatorio de tu Cita",
      `<p>Hola <strong>${clientData.name}</strong>, esto es una prueba del recordatorio para tu cita:</p>
       <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
         <p><strong>Servicio:</strong> ${serviceData?.name}</p>
         <p><strong>Barbero:</strong> ${barberData?.name || 'Por asignar'}</p>
         <p><strong>Hora:</strong> ${time}</p>
       </div>
       <p>¡Te esperamos!</p>`
    );

    await resend.emails.send({
      from: 'Trimly <no-reply@trimlyapp.com>',
      to: clientData.email,
      subject: '✂️ TEST: Recordatorio de cita',
      html
    });

    return NextResponse.json({ success: true, sentTo: clientData.email });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
