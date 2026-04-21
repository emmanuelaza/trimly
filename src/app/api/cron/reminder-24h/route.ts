import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/serviceRole';
import { resend } from '@/lib/resend';
import { getBaseEmailTemplate } from '@/lib/emailTemplates';

export async function GET(req: Request) {
  // 1. Basic Authorization
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    // 2. Fetch appointments for tomorrow joined with relevant data
    const { data: appointments, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        id, 
        scheduled_at, 
        barbershop_id,
        client:clients(name, email),
        service:services(name)
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
        .single();

      if (automation?.is_active && app.client?.email) {
        const time = new Date(app.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // 4. Send Email
        const html = getBaseEmailTemplate(
          "Recordatorio de tu Cita",
          `<p>Hola <strong>${app.client.name}</strong>, te recordamos tu cita para mañana en Trimly:</p>
           <div class="highlight">
             <p><span class="label">Servicio</span><br>${app.service?.name}</p>
             <p><span class="label">Fecha</span><br>${dateStr}</p>
             <p><span class="label">Hora</span><br>${time}</p>
           </div>
           <p>¡Te esperamos!</p>`
        );

        await resend.emails.send({
          from: 'Trimly <onboarding@resend.dev>',
          to: app.client.email,
          subject: 'Recordatorio: Tu cita en Trimly',
          html
        });

        // 5. Log activity
        await supabaseAdmin.from('automation_logs').insert({
          automation_type: 'reminder_24h',
          appointment_id: app.id,
          client_id: (app as any).client_id, 
          channel: 'email'
        });

        sentCount++;
      }
    }

    return NextResponse.json({ sent: sentCount });
  } catch (err: any) {
    console.error('CRON ERROR (24h Reminder):', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
