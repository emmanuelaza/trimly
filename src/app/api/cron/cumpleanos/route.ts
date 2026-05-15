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
      .eq('type', 'birthday')
      .eq('is_active', true);

    if (!automations?.length) return NextResponse.json({ sent: 0 });

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const mes = today.getMonth() + 1;
    const dia = today.getDate();

    const expiresAt = new Date(today);
    expiresAt.setDate(expiresAt.getDate() + 7);
    const expiresStr = expiresAt.toISOString().split('T')[0];

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

      const bookingLink = shop?.slug ? `${appUrl}/book/${shop.slug}` : appUrl;

      const cumpleaneros = clients.filter((c) => {
        if (!c.birthdate) return false;
        const bday = new Date(c.birthdate);
        return bday.getMonth() + 1 === mes && bday.getDate() === dia;
      });

      for (const client of cumpleaneros) {
        // Duplicate check — skip if birthday coupon already sent this year
        const { data: existingCoupon } = await supabase
          .from('coupons')
          .select('id')
          .eq('client_id', client.id)
          .eq('barbershop_id', bsId)
          .eq('es_cumpleanos', true)
          .gte('fecha_vencimiento', todayStr)
          .maybeSingle();

        if (existingCoupon) continue;

        // Create coupon
        const couponCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        try {
          await supabase.from('coupons').insert({
            barbershop_id: bsId,
            client_id: client.id,
            codigo: couponCode,
            descuento_porcentaje: descuento,
            es_cumpleanos: true,
            fecha_vencimiento: expiresStr,
          });
        } catch {
          // non-blocking — still send email
        }

        const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
        <style>
          body{background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:40px 20px}
          .card{background:#fff;max-width:520px;margin:0 auto;border-radius:12px;padding:32px;border:1px solid #e5e5e5}
          h2{color:#111;font-size:22px;margin:0 0 8px}
          p{color:#444;font-size:14px;line-height:1.6;margin:0 0 16px}
          .coupon{background:#fafafa;border:2px dashed #ddd;border-radius:12px;padding:20px;text-align:center;margin:24px 0}
          .coupon-code{font-size:28px;font-weight:800;color:#111;letter-spacing:4px;display:block;margin:8px 0}
          .coupon-label{font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px}
          .discount{font-size:36px;font-weight:800;color:#111;display:block;margin:4px 0}
          .btn{display:inline-block;background:#111;color:#fff;font-weight:600;font-size:14px;padding:14px 28px;border-radius:8px;text-decoration:none;margin-top:8px}
          .footer{color:#aaa;font-size:12px;text-align:center;margin-top:24px}
        </style></head><body>
        <div class="card">
          <h2>¡Feliz cumpleaños, ${client.name}! 🎂</h2>
          <p>En <strong>${shop?.name}</strong> queremos celebrar este día especial contigo. Tienes un regalo esperándote:</p>
          <div class="coupon">
            <span class="coupon-label">Tu regalo de cumpleaños</span>
            <span class="discount">${descuento}% OFF</span>
            <span class="coupon-label">Código</span>
            <span class="coupon-code">${couponCode}</span>
            <p style="margin:8px 0 0;font-size:12px;color:#888">Válido por 7 días · Preséntalo al reservar</p>
          </div>
          <p>Úsalo en tu próxima visita y disfruta de un corte con estilo.</p>
          <div style="text-align:center">
            <a href="${bookingLink}" class="btn">Reservar con mi descuento 🎁</a>
          </div>
          <p class="footer">Trimly · Sistema de gestión para barberías</p>
        </div></body></html>`;

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
