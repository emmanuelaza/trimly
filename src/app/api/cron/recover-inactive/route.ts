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

    // Buscar clientes cuya última visita fue hace más de 45 días
    const { data: clients, error } = await supabaseAdmin
      .from('clients')
      .select('id, name, email, barbershop_id')
      .lte('last_visit', fortyFiveDaysAgo.toISOString());

    if (error) throw error;
    if (!clients || clients.length === 0) return NextResponse.json({ sent: 0 });

    let sentCount = 0;

    for (const client of clients) {
      const { data: automation } = await supabaseAdmin
        .from('automations')
        .select('is_active')
        .eq('barbershop_id', client.barbershop_id)
        .eq('type', 'recover_inactive')
        .single();

      if (automation?.is_active && client.email) {
        const html = getBaseEmailTemplate(
          "¡Te extrañamos!",
          `<p>Hola <strong>${client.name}</strong>,</p>
           <p>Hace tiempo no nos visitas y el equipo de la barbería te extraña. ✂️</p>
           <p>¿Qué tal si agendas una cita para este fin de semana? ¡Te esperamos con el mejor servicio!</p>`
        );

        await resend.emails.send({
          from: 'Trimly <no-reply@trimlyapp.com>',
          to: client.email,
          subject: 'Te extrañamos ✂️',
          html
        });

        await supabaseAdmin.from('automation_logs').insert({
          automation_type: 'recover_inactive',
          client_id: client.id,
          channel: 'email',
          barbershop_id: client.barbershop_id
        });

        sentCount++;
      }
    }

    return NextResponse.json({ sent: sentCount });
  } catch (err: any) {
    console.error('CRON ERROR (Recover Inactive):', err);
    return NextResponse.json({ error: 'Internal error', details: err.message }, { status: 500 });
  }
}
