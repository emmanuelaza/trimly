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
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    // Fetch appointments completed exactly yesterday
    const { data: appointments, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        id, 
        barbershop_id,
        client:clients(name, email),
        service:services(name)
      `)
      .gte('scheduled_at', `${dateStr}T00:00:00Z`)
      .lte('scheduled_at', `${dateStr}T23:59:59Z`)
      .eq('status', 'completed');

    if (error) throw error;
    if (!appointments || appointments.length === 0) return NextResponse.json({ sent: 0 });

    let sentCount = 0;

    for (const app of appointments) {
      const { data: automation } = await supabaseAdmin
        .from('automations')
        .select('is_active')
        .eq('barbershop_id', app.barbershop_id)
        .eq('type', 'post_visit')
        .single();

      const clientData = app.client as any;
      const serviceData = app.service as any;

      if (automation?.is_active && clientData?.email) {
        const html = getBaseEmailTemplate(
          "¿Cómo estuvo tu visita?",
          `<p>Hola <strong>${clientData.name}</strong>, gracias por visitarnos ayer para tu <strong>${serviceData?.name}</strong>.</p>
           <p>Nos encantaría saber tu opinión. Tu feedback nos ayuda a mejorar cada día.</p>`,
           "Dejar Reseña",
           "https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID"
        );

        await resend.emails.send({
          from: 'Trimly <onboarding@resend.dev>',
          to: clientData.email,
          subject: '¿Qué te pareció tu servicio en Trimly?',
          html
        });

        await supabaseAdmin.from('automation_logs').insert({
          automation_type: 'post_visit',
          appointment_id: app.id,
          client_id: (app as any).client_id,
          channel: 'email'
        });

        sentCount++;
      }
    }

    return NextResponse.json({ success: true, sent: sentCount });
  } catch (err: any) {
    console.error('CRON ERROR (Post-Visit):', err);
    return NextResponse.json({ error: 'Internal error', details: err.message }, { status: 500 });
  }
}
