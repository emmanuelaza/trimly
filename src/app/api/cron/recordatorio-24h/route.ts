import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/serviceRole';
import { sendEmail } from '@/lib/email';
import { getBaseEmailTemplate } from '@/lib/emailTemplates';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (req.headers.get('x-vercel-cron') !== '1' && authHeader !== `Bearer ${cronSecret}`) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const { data: appointments, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        client_id,
        scheduled_at,
        barbershop_id,
        client:clients(name, email),
        service:services(name),
        barber:barbers(name),
        barbershop:barbershops(name)
      `)
      .gte('scheduled_at', `${dateStr}T00:00:00Z`)
      .lte('scheduled_at', `${dateStr}T23:59:59Z`)
      .eq('status', 'confirmed');

    if (error) throw error;
    if (!appointments || appointments.length === 0) return NextResponse.json({ sent: 0 });

    let sentCount = 0;

    for (const app of appointments) {
      // 3. Verify if automation is active for this barbershop
      const { data: automation } = await supabaseAdmin
        .from('automations')
        .select('is_active')
        .eq('barbershop_id', app.barbershop_id)
        .eq('type', 'reminder_24h')
        .maybeSingle();

      const clientData = app.client as any;
      const serviceData = app.service as any;
      const barberData = app.barber as any;

      const shopData = (app as any).barbershop as any;

      if (automation?.is_active && clientData?.email) {
        const time = new Date(app.scheduled_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
        const fecha = new Date(app.scheduled_at).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });

        const html = getBaseEmailTemplate(
          'Recordatorio: tu cita es mañana ✂️',
          `<p>Hola <strong>${clientData.name}</strong>, te recordamos tu cita para mañana:</p>
           <div class="highlight">
             <p class="label">Servicio</p><p>${serviceData?.name}</p>
             <p class="label">Barbero</p><p>${barberData?.name || 'Por asignar'}</p>
             <p class="label">Fecha</p><p>${fecha}</p>
             <p class="label">Hora</p><p>${time}</p>
             <p class="label">Barbería</p><p>${shopData?.name || ''}</p>
           </div>
           <p>¡Te esperamos!</p>`
        );

        await sendEmail({
          to: clientData.email,
          toName: clientData.name,
          subject: '✂️ Recordatorio: tu cita es mañana',
          html,
        });

        // 5. Log activity
        await supabaseAdmin.from('automation_logs').insert({
          automation_type: 'reminder_24h',
          appointment_id: app.id,
          client_id: app.client_id,
          channel: 'email',
          barbershop_id: app.barbershop_id
        });

        sentCount++;
      }

    }

    return NextResponse.json({ success: true, sent: sentCount });
  } catch (err: any) {
    console.error('CRON ERROR (24h Reminder):', err);
    return NextResponse.json({ error: 'Internal error', details: err.message }, { status: 500 });
  }
}
