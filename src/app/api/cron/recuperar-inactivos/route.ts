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

    const { data: automations } = await supabase
      .from('automations')
      .select('barbershop_id, config')
      .eq('type', 'recover_inactive')
      .eq('is_active', true);

    if (!automations?.length) return NextResponse.json({ sent: 0 });

    let sentCount = 0;

    for (const auto of automations) {
      const bsId = auto.barbershop_id;
      const diasInactivo: number = (auto.config as any)?.dias_inactivo || 45;
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - diasInactivo);

      const [{ data: clients }, { data: shop }] = await Promise.all([
        supabase
          .from('clients')
          .select('id, name, email')
          .eq('barbershop_id', bsId)
          .eq('bloqueado', false)
          .not('email', 'is', null),
        supabase
          .from('barbershops')
          .select('name, slug')
          .eq('id', bsId)
          .single(),
      ]);

      if (!clients?.length) continue;

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://trimlyapp-phi.vercel.app';
      const linkReserva = shop?.slug ? `${appUrl}/book/${shop.slug}` : appUrl;

      for (const client of clients) {
        const { data: ultimaCita } = await supabase
          .from('appointments')
          .select('scheduled_at')
          .eq('client_id', client.id)
          .eq('barbershop_id', bsId)
          .eq('status', 'completed')
          .order('scheduled_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!ultimaCita) continue;
        if (new Date(ultimaCita.scheduled_at) > fechaLimite) continue;

        const html = getBaseEmailTemplate(
          `Te echamos de menos en ${shop?.name} 💈`,
          `<p>Hola <strong>${client.name}</strong>,</p>
           <p>Hace más de ${diasInactivo} días que no te vemos por <strong>${shop?.name}</strong> y el equipo te extraña.</p>
           <p>¿Qué tal si vuelves a darte un buen corte?</p>`,
          'Reservar mi cita ✂️',
          linkReserva
        );

        await sendEmail({
          to: client.email as string,
          toName: client.name,
          subject: `Te echamos de menos en ${shop?.name} 💈`,
          html,
        });

        await supabase.from('automation_logs').insert({
          automation_type: 'recover_inactive',
          client_id: client.id,
          channel: 'email',
          barbershop_id: bsId,
        });

        sentCount++;
      }
    }

    return NextResponse.json({ success: true, sent: sentCount });
  } catch (err: any) {
    console.error('CRON ERROR (Recover Inactive):', err);
    return NextResponse.json({ error: 'Internal error', details: err.message }, { status: 500 });
  }
}
