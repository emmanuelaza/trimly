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
      .eq('type', 'birthday')
      .eq('is_active', true);

    if (!automations?.length) return NextResponse.json({ sent: 0 });

    const today = new Date();
    const mes = today.getMonth() + 1;
    const dia = today.getDate();

    let sentCount = 0;

    for (const auto of automations) {
      const bsId = auto.barbershop_id;
      const descuento: number = (auto.config as any)?.descuento || 20;

      const [{ data: clients }, { data: shop }] = await Promise.all([
        supabase
          .from('clients')
          .select('id, name, email, birthdate')
          .eq('barbershop_id', bsId)
          .eq('bloqueado', false)
          .not('email', 'is', null)
          .not('birthdate', 'is', null),
        supabase
          .from('barbershops')
          .select('name, slug')
          .eq('id', bsId)
          .single(),
      ]);

      if (!clients?.length) continue;

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://trimlyapp-phi.vercel.app';
      const linkReserva = shop?.slug ? `${appUrl}/book/${shop.slug}` : appUrl;

      const cumpleaneros = clients.filter((c) => {
        if (!c.birthdate) return false;
        const bday = new Date(c.birthdate);
        return bday.getMonth() + 1 === mes && bday.getDate() === dia;
      });

      for (const client of cumpleaneros) {
        const html = getBaseEmailTemplate(
          `¡Feliz cumpleaños ${client.name}! 🎂`,
          `<p>En <strong>${shop?.name}</strong> queremos celebrarlo contigo.</p>
           <p>Tienes un <strong>${descuento}% de descuento</strong> en tu próxima visita como regalo de cumpleaños. ¡Válido por 7 días!</p>`,
          'Reservar con mi descuento 🎁',
          linkReserva
        );

        await sendEmail({
          to: client.email as string,
          toName: client.name,
          subject: `¡Feliz cumpleaños ${client.name}! 🎂 Un regalo te espera`,
          html,
        });

        await supabase.from('automation_logs').insert({
          automation_type: 'birthday',
          client_id: client.id,
          channel: 'email',
          barbershop_id: bsId,
        });

        sentCount++;
      }
    }

    return NextResponse.json({ success: true, sent: sentCount });
  } catch (err: any) {
    console.error('CRON ERROR (Birthday):', err);
    return NextResponse.json({ error: 'Internal error', details: err.message }, { status: 500 });
  }
}
