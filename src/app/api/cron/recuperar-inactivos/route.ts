import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/serviceRole';
import { sendEmail } from '@/lib/email';

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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://trimlyapp-phi.vercel.app';
    let sentCount = 0;

    for (const auto of automations) {
      const bsId = auto.barbershop_id;

      const { data: bsData } = await supabase
        .from('barbershops')
        .select('plan, subscription_status')
        .eq('id', bsId)
        .maybeSingle();
      const planOk =
        bsData?.plan === 'pro' ||
        bsData?.plan === 'lifetime' ||
        bsData?.subscription_status === 'trialing' ||
        bsData?.subscription_status === 'trial';
      if (!planOk) continue;

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

      const bookingLink = shop?.slug ? `${appUrl}/book/${shop.slug}` : appUrl;

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

        const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
        <style>
          body{background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:40px 20px}
          .card{background:#fff;max-width:520px;margin:0 auto;border-radius:12px;padding:32px;border:1px solid #e5e5e5}
          h2{color:#111;font-size:20px;margin:0 0 8px}
          p{color:#444;font-size:14px;line-height:1.6;margin:0 0 16px}
          .highlight{font-size:32px;text-align:center;margin:24px 0}
          .btn{display:inline-block;background:#111;color:#fff;font-weight:600;font-size:14px;padding:14px 28px;border-radius:8px;text-decoration:none}
          .footer{color:#aaa;font-size:12px;text-align:center;margin-top:24px}
        </style></head><body>
        <div class="card">
          <div class="highlight">💈</div>
          <h2>Te echamos de menos, ${client.name}</h2>
          <p>Han pasado más de <strong>${diasInactivo} días</strong> desde tu última visita a <strong>${shop?.name}</strong> y el equipo te extraña.</p>
          <p>¿Qué tal si vuelves a darte un buen corte? Tienes tu lugar reservado.</p>
          <div style="text-align:center;margin:24px 0">
            <a href="${bookingLink}" class="btn">Reservar mi cita ✂️</a>
          </div>
          <p class="footer">Trimly · Sistema de gestión para barberías</p>
        </div></body></html>`;

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
