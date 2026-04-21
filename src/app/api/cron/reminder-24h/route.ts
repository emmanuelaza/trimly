import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/serviceRole';
import { getResend } from '@/lib/resend';
import { getBaseEmailTemplate } from '@/lib/emailTemplates';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const resend = getResend();
    
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

      const clientData = app.client as any;
      const serviceData = app.service as any;

      if (automation?.is_active && clientData?.email) {
        const time = new Date(app.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // 4. Send Email
        const html = getBaseEmailTemplate(
          "Recordatorio de tu Cita",
          `<p>Hola <strong>${clientData.name}</strong>, te recordamos tu cita para mañana en Trimly:</p>
           <div class="highlight">
             <p><span class="label">Servicio</span><br>${serviceData?.name}</p>
             <p><span class="label">Fecha</span><br>${dateStr}</p>
             <p><span class="label">Hora</span><br>${time}</p>
           </div>
           <p>¡Te esperamos!</p>`
        );

        await resend.emails.send({
          from: 'Trimly <onboarding@resend.dev>',
          to: clientData.email,
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

    return NextResponse.json({ success: true, sent: sentCount });
  } catch (err: any) {
    console.error('CRON ERROR (24h Reminder):', err);
    return NextResponse.json({ error: 'Internal error', details: err.message }, { status: 500 });
  }
}
