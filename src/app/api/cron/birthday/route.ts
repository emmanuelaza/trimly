import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/serviceRole';
import { resend } from '@/lib/resend';
import { getBaseEmailTemplate } from '@/lib/emailTemplates';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    // 1. Fetch clients with birthday today
    // Using a raw RPC or complex filter if needed, but for now filtering via raw SQL logic in filter
    const { data: clients, error } = await supabaseAdmin
      .from('clients')
      .select('id, name, email, barbershop_id, birthdate');
      
    // Filter manually for birthday safety
    const todayClients = clients?.filter(c => {
      if (!c.birthdate) return false;
      const b = new Date(c.birthdate);
      return b.getUTCMonth() + 1 === month && b.getUTCDate() === day;
    });

    if (error) throw error;
    if (!todayClients || todayClients.length === 0) return NextResponse.json({ sent: 0 });

    let sentCount = 0;

    for (const client of todayClients) {
      const { data: automation } = await supabaseAdmin
        .from('automations')
        .select('is_active')
        .eq('barbershop_id', client.barbershop_id)
        .eq('type', 'birthday')
        .single();

      if (automation?.is_active && client.email) {
        const html = getBaseEmailTemplate(
          `¡Feliz Cumpleaños, ${client.name}!`,
          `<p>¡Hoy es tu día especial y en Trimly queremos celebrarlo contigo! 🥳</p>
           <p>Te regalamos un <strong>15% de descuento exclusivo</strong> en tu próxima visita durante este mes.</p>
           <p>Código: <strong style="font-size: 18px; color: #C9F53B;">CUMPLE${day}${month}</strong></p>`,
           "Agendar Cumpleaños",
           `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding`
        );

        await resend.emails.send({
          from: 'Trimly <onboarding@resend.dev>',
          to: client.email,
          subject: '¡Feliz Cumpleaños! Tu regalo te espera en Trimly',
          html
        });

        await supabaseAdmin.from('automation_logs').insert({
          automation_type: 'birthday',
          client_id: client.id,
          channel: 'email'
        });

        sentCount++;
      }
    }

    return NextResponse.json({ sent: sentCount });
  } catch (err: any) {
    console.error('CRON ERROR (Birthday):', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
