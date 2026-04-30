import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/serviceRole';
import { getResend } from '@/lib/resend';
import { getBaseEmailTemplate, getConfirmationEmailTemplate } from '@/lib/emailTemplates';

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
        barber:barbers(name),
        barbershop:barbershops(name, city, whatsapp)
      `)
      .eq('id', citaId)
      .single();

    if (error || !app) {
      console.error('Error fetching appointment details:', error);
      throw new Error('Cita no encontrada');
    }

    // Verificar automatización (pero si el usuario lo pide explícitamente para arreglar el flujo, nos aseguramos que el email se envíe si hay email del cliente)
    const { data: auto } = await supabaseAdmin
      .from('automations')
      .select('is_active')
      .eq('barbershop_id', app.barbershop_id)
      .eq('type', 'confirmation')
      .maybeSingle();

    const clientData = app.client as any;
    const serviceData = app.service as any;
    const barberData = app.barber as any;
    const shopData = app.barbershop as any;

    if (!clientData?.email) {
      console.log('El cliente no tiene email, saltando envío.');
      return NextResponse.json({ ok: true, message: 'No client email' });
    }

    // El usuario quiere que llegue siempre si hay email, pero respetamos si la automatización existe y está apagada.
    // Si NO existe el registro en automations, asumimos activo por defecto para el flujo de reservas online.
    const shouldSend = auto ? auto.is_active : true;

    if (shouldSend) {
      console.log('Preparando envío de email a:', clientData.email);
      
      // Formatear fecha en español
      const dateObj = new Date(app.scheduled_at);
      const dateStr = dateObj.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const timeStr = dateObj.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true,
        timeZone: 'America/Bogota' // Ajustar a zona horaria de Colombia
      });

      const html = getConfirmationEmailTemplate({
        clientName: clientData.name,
        serviceName: serviceData?.name,
        barberName: barberData?.name || 'Por asignar',
        date: dateStr,
        time: timeStr,
        barbershopName: shopData?.name || 'La Barbería',
        barbershopCity: shopData?.city || '',
        barbershopWhatsApp: shopData?.whatsapp || ''
      });

      try {
        const { data: emailRes, error: emailError } = await resend.emails.send({
          from: 'Trimly <onboarding@resend.dev>', // Usar onboarding como pidió el usuario
          to: clientData.email,
          subject: `Tu cita está confirmada — ${shopData?.name || 'Trimly'}`,
          html
        });

        if (emailError) {
          console.error('Resend Error:', emailError);
          throw emailError;
        }

        console.log('Email enviado exitosamente:', emailRes);

        await supabaseAdmin.from('automation_logs').insert({
          automation_type: 'confirmation',
          appointment_id: app.id,
          client_id: (app as any).client_id,
          channel: 'email',
          barbershop_id: app.barbershop_id
        });
      } catch (sendErr) {
        console.error('Error al enviar email con Resend:', sendErr);
        throw sendErr;
      }
    } else {
      console.log('Automatización desactivada para esta barbería.');
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('JOB ERROR (Confirmation):', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
