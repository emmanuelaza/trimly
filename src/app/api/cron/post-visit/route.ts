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

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        client_id,
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://trimlyapp-phi.vercel.app';
    let sentCount = 0;
    const planCache = new Map<string, boolean>();

    for (const app of appointments) {
      if (!planCache.has(app.barbershop_id)) {
        const { data: bsData } = await supabase
          .from('barbershops')
          .select('plan, subscription_status')
          .eq('id', app.barbershop_id)
          .maybeSingle();
        const planOk =
          bsData?.plan === 'pro' ||
          bsData?.plan === 'lifetime' ||
          bsData?.subscription_status === 'trialing' ||
          bsData?.subscription_status === 'trial';
        planCache.set(app.barbershop_id, planOk);
      }
      if (!planCache.get(app.barbershop_id)) continue;

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

      // Generate unique review code and store it
      const reviewCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      try {
        await supabase.from('reviews').insert({
          appointment_id: app.id,
          client_id: app.client_id,
          barbershop_id: app.barbershop_id,
          codigo_unico: reviewCode,
        });
      } catch {
        // reviews table may not exist — continue with generic booking link
      }

      const reviewLink = `${appUrl}/review/${reviewCode}`;
      const bookingLink = shop?.slug ? `${appUrl}/book/${shop.slug}` : appUrl;

      const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <style>
        body{background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:40px 20px}
        .card{background:#fff;max-width:520px;margin:0 auto;border-radius:12px;padding:32px;border:1px solid #e5e5e5}
        h2{color:#111;font-size:20px;margin:0 0 8px}
        p{color:#444;font-size:14px;line-height:1.6;margin:0 0 16px}
        .stars{font-size:28px;text-align:center;margin:24px 0 8px;letter-spacing:4px}
        .btn{display:inline-block;background:#111;color:#fff;font-weight:600;font-size:14px;padding:14px 28px;border-radius:8px;text-decoration:none;margin:8px 4px}
        .btn-secondary{background:#f5f5f5;color:#111;border:1px solid #ddd}
        .actions{text-align:center;margin:24px 0}
        .footer{color:#aaa;font-size:12px;text-align:center;margin-top:24px}
      </style></head><body>
      <div class="card">
        <h2>¿Cómo estuvo tu visita? ⭐</h2>
        <p>Hola <strong>${client.name}</strong>, gracias por visitarnos en <strong>${shop?.name || 'la barbería'}</strong> para tu <strong>${service?.name}</strong>.</p>
        <p>Tu opinión nos ayuda a mejorar. ¿Nos regalas un momento?</p>
        <div class="stars">⭐⭐⭐⭐⭐</div>
        <div class="actions">
          <a href="${reviewLink}" class="btn">Dejar mi reseña</a>
        </div>
        <p style="text-align:center;margin-top:16px">¿Te gustaría volver?
          <a href="${bookingLink}" style="color:#111;font-weight:600">Reservar mi próxima cita ✂️</a>
        </p>
        <p class="footer">Trimly · Sistema de gestión para barberías</p>
      </div></body></html>`;

      await sendEmail({
        to: client.email,
        toName: client.name,
        subject: `¿Qué te pareció tu visita en ${shop?.name || 'la barbería'}? ✂️`,
        html,
      });

      await supabase.from('automation_logs').insert({
        automation_type: 'post_visit',
        appointment_id: app.id,
        client_id: app.client_id,
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
