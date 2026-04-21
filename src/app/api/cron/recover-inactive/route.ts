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
    
    const fortyFiveDaysAgo = new Date();
    fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Fetch clients with old last_visit or no visit and old created_at
    const { data: clients, error } = await supabaseAdmin
      .from('clients')
      .select('id, name, email, barbershop_id, last_visit')
      .lte('last_visit', fortyFiveDaysAgo.toISOString());

    if (error) throw error;
    if (!clients || clients.length === 0) return NextResponse.json({ sent: 0 });

    let sentCount = 0;

    for (const client of clients) {
      // 2. Check automation status
      const { data: automation } = await supabaseAdmin
        .from('automations')
        .select('is_active')
        .eq('barbershop_id', client.barbershop_id)
        .eq('type', 'recover_inactive')
        .single();

      if (automation?.is_active && client.email) {
        // 3. Check if sent in last 30 days
        const { count: recentlySent } = await supabaseAdmin
          .from('automation_logs')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client.id)
          .eq('automation_type', 'recover_inactive')
          .gte('sent_at', thirtyDaysAgo.toISOString());

        if (recentlySent === 0) {
          const html = getBaseEmailTemplate(
            `¡Te extrañamos en Trimly!`,
            `<p>Hola <strong>${client.name}</strong>, hace tiempo no nos visitas. ¡Te echamos de menos! 💈</p>
             <p>Queremos invitarte a volver y por eso te regalamos un <strong>10% de descuento</strong> en tu siguiente servicio.</p>`,
             "Agendar Cita",
             `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding`
          );

          await resend.emails.send({
            from: 'Trimly <onboarding@resend.dev>',
            to: client.email,
            subject: '¡Te echamos de menos! Vuelve a Trimly',
            html
          });

          await supabaseAdmin.from('automation_logs').insert({
            automation_type: 'recover_inactive',
            client_id: client.id,
            channel: 'email'
          });

          sentCount++;
        }
      }
    }

    return NextResponse.json({ success: true, sent: sentCount });
  } catch (err: any) {
    console.error('CRON ERROR (Recover Inactive):', err);
    return NextResponse.json({ error: 'Internal error', details: err.message }, { status: 500 });
  }
}
