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

    const supabase = getSupabaseAdmin();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        barbershop_id,
        client:clients(name, email),
        service:services(name),
        barbershop:barbershops(name, slug)
      `)
      .gte('scheduled_at', `${dateStr}T00:00:00Z`)
      .lte('scheduled_at', `${dateStr}T23:59:59Z`)
      .eq('status', 'completed');

    if (error) throw error;
    if (!appointments?.length) return NextResponse.json({ sent: 0 });

    let sentCount = 0;

    for (const app of appointments) {
      const { data: automation } = await supabase
        .from('automations')
        .select('is_active')
        .eq('barbershop_id', app.barbershop_id)
        .eq('type', 'post_visit')
        .maybeSingle();

      if (!automation?.is_active) continue;

      const client = app.client as any;
      const service = app.service as any;
      const shop = app.barbershop as any;

      if (!client?.email) continue;

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://trimlyapp-phi.vercel.app';
      const linkReserva = shop?.slug ? `${appUrl}/book/${shop.slug}` : appUrl;

      const html = getBaseEmailTemplate(
        '¿Cómo estuvo tu visita? ⭐',
        `<p>Hola <strong>${client.name}</strong>, gracias por visitarnos en <strong>${shop?.name || 'la barbería'}</strong> para tu <strong>${service?.name}</strong>.</p>
         <p>Nos encantaría saber tu opinión. ¿Nos regalas un momento?</p>`,
        'Volver a reservar ✂️',
        linkReserva
      );

      await sendEmail({
        to: client.email,
        toName: client.name,
        subject: `¿Qué te pareció tu visita en ${shop?.name || 'la barbería'}? ✂️`,
        html,
      });

      await supabase.from('automation_logs').insert({
        automation_type: 'post_visit',
        appointment_id: app.id,
        client_id: (app as any).client_id,
        channel: 'email',
        barbershop_id: app.barbershop_id,
      });

      sentCount++;
    }

    return NextResponse.json({ success: true, sent: sentCount });
  } catch (err: any) {
    console.error('CRON ERROR (Post-Visit):', err);
    return NextResponse.json({ error: 'Internal error', details: err.message }, { status: 500 });
  }
}
