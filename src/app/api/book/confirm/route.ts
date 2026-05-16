import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase/serviceRole';
import { sendConfirmationEmail } from '@/lib/emails';
import { sendEmail } from '@/lib/email';

const QSTASH_MAX_DELAY = 604800;

function ownerNotificationHtml(d: {
  shopName: string; clientName: string; clientPhone: string;
  serviceName: string; barberName: string; fecha: string; hora: string;
}) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    body{background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:40px 20px}
    .card{background:#fff;max-width:520px;margin:0 auto;border-radius:12px;padding:32px;border:1px solid #e5e5e5}
    h2{color:#111;font-size:20px;margin:0 0 8px}
    p{color:#444;font-size:14px;line-height:1.6;margin:0 0 16px}
    .info{background:#fafafa;border-radius:8px;padding:16px;margin:20px 0}
    .row{margin-bottom:10px}
    .lbl{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:2px}
    .val{font-size:14px;font-weight:600;color:#111}
    .footer{color:#aaa;font-size:12px;text-align:center;margin-top:24px}
  </style></head><body>
  <div class="card">
    <h2>Nueva cita ✂️</h2>
    <p>Se acaba de reservar una cita en <strong>${d.shopName}</strong>.</p>
    <div class="info">
      <div class="row"><span class="lbl">Cliente</span><span class="val">${d.clientName}</span></div>
      <div class="row"><span class="lbl">Celular</span><span class="val">${d.clientPhone}</span></div>
      <div class="row"><span class="lbl">Servicio</span><span class="val">${d.serviceName}</span></div>
      <div class="row"><span class="lbl">Barbero</span><span class="val">${d.barberName}</span></div>
      <div class="row"><span class="lbl">Fecha</span><span class="val">${d.fecha}</span></div>
      <div class="row"><span class="lbl">Hora</span><span class="val">${d.hora}</span></div>
    </div>
    <p class="footer">Trimly · Sistema de gestión para barberías</p>
  </div></body></html>`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      barbershopId,
      barberId,
      serviceId,
      scheduledAt,
      clientName,
      clientPhone,
      clientEmail,
      priceCharged,
      referralCode,
      referralClienteId,
      referralValor,
      referralTipo,
    } = body;

    if (!barbershopId || !serviceId || !scheduledAt || !clientName || !clientPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Find or create client
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('barbershop_id', barbershopId)
      .eq('phone', clientPhone)
      .maybeSingle();

    let clientId;
    if (existingClient) {
      clientId = existingClient.id;
      await supabase
        .from('clients')
        .update({ last_visit: new Date().toISOString(), email: clientEmail || null })
        .eq('id', clientId);
    } else {
      const { data: newClient, error: clientErr } = await supabase
        .from('clients')
        .insert({
          barbershop_id: barbershopId,
          name: clientName,
          phone: clientPhone,
          email: clientEmail || null,
          last_visit: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (clientErr) throw clientErr;
      clientId = newClient.id;
    }

    // 2. Conflict check
    const { data: conflict } = await supabase
      .from('appointments')
      .select('id')
      .eq('barber_id', barberId)
      .eq('scheduled_at', scheduledAt)
      .in('status', ['confirmed', 'pending'])
      .maybeSingle();

    if (conflict) {
      return NextResponse.json({ error: 'slot_taken' }, { status: 409 });
    }

    // 3. Create appointment
    const descuento = referralCode && referralValor
      ? (referralTipo === 'porcentaje'
          ? Math.round((priceCharged * referralValor) / 100)
          : referralValor)
      : 0;

    const { data: appointment, error: appErr } = await supabase
      .from('appointments')
      .insert({
        barbershop_id: barbershopId,
        client_id: clientId,
        service_id: serviceId,
        barber_id: barberId,
        scheduled_at: scheduledAt,
        status: 'confirmed',
        price_charged: priceCharged,
        referral_code_usado: referralCode || null,
        descuento_referido: descuento,
      })
      .select()
      .single();

    if (appErr) {
      if (appErr.code === '23505') {
        return NextResponse.json({ error: 'slot_taken' }, { status: 409 });
      }
      return NextResponse.json({ error: appErr.message }, { status: 400 });
    }

    // 3b. Register referral
    if (referralCode && referralClienteId && referralValor) {
      try {
        const creditAmount = referralTipo === 'porcentaje'
          ? Math.round((priceCharged * referralValor) / 100)
          : referralValor;

        await supabase.from('referral_uses').insert({
          barbershop_id: barbershopId,
          referral_code: referralCode.toUpperCase(),
          cliente_que_refirio: referralClienteId,
          cliente_nuevo: clientId,
          credito_otorgado: creditAmount,
          estado: 'pendiente',
        });

        const { data: referidor } = await supabase
          .from('clients')
          .select('credito_acumulado')
          .eq('id', referralClienteId)
          .maybeSingle();
        const newCredit = (Number(referidor?.credito_acumulado) || 0) + creditAmount;
        await supabase.from('clients').update({ credito_acumulado: newCredit }).eq('id', referralClienteId);
      } catch (refErr) {
        console.error('Referral registration error:', refErr);
      }
    }

    // 4. Notifications
    try {
      const admin = getSupabaseAdmin();

      const [{ data: shop }, { data: service }, barberRes] = await Promise.all([
        admin.from('barbershops').select('name, whatsapp, owner_id').eq('id', barbershopId).single(),
        admin.from('services').select('name').eq('id', serviceId).single(),
        barberId
          ? admin.from('barbers').select('name').eq('id', barberId).single()
          : Promise.resolve({ data: { name: 'Sin preferencia' } }),
      ]);

      const barber = (barberRes as any).data;
      const scheduledDate = new Date(scheduledAt);
      const fecha = scheduledDate.toLocaleDateString('es-CO', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        timeZone: 'America/Bogota',
      });
      const hora = scheduledDate.toLocaleTimeString('es-CO', {
        hour: '2-digit', minute: '2-digit',
        timeZone: 'America/Bogota',
      });

      // Emails — only if confirmation automation active
      const { data: confirmAuto } = await admin
        .from('automations')
        .select('is_active')
        .eq('barbershop_id', barbershopId)
        .eq('type', 'confirmation')
        .maybeSingle();

      if (confirmAuto?.is_active) {
        if (clientEmail) {
          await sendConfirmationEmail({
            to: clientEmail,
            clientName,
            barbershopName: shop?.name || 'La Barbería',
            serviceName: service?.name || 'Servicio',
            barberName: barber?.name || 'Sin preferencia',
            date: scheduledAt,
            phone: shop?.whatsapp || '',
          });
        }

        if (shop?.owner_id) {
          const { data: { user: owner } } = await admin.auth.admin.getUserById(shop.owner_id);
          if (owner?.email) {
            await sendEmail({
              to: owner.email,
              subject: `Nueva cita — ${shop.name}`,
              html: ownerNotificationHtml({
                shopName: shop.name,
                clientName,
                clientPhone,
                serviceName: service?.name || 'Servicio',
                barberName: barber?.name || 'Sin preferencia',
                fecha,
                hora,
              }),
            });
          }
        }
      }
    } catch (notifErr) {
      console.error('Notification error:', notifErr);
    }

    // 4b. Push notifications (direct, no HTTP hop)
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const webpush = require('web-push');
      if (process.env.VAPID_SUBJECT && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        const vapidSubject = process.env.VAPID_SUBJECT!;
        webpush.setVapidDetails(
          vapidSubject.startsWith('mailto:') || vapidSubject.startsWith('https://') ? vapidSubject : `mailto:${vapidSubject}`,
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
          process.env.VAPID_PRIVATE_KEY!,
        );

        const adminPush = getSupabaseAdmin();
        const [{ data: shopP }, { data: serviceP }, barberPRes] = await Promise.all([
          adminPush.from('barbershops').select('name').eq('id', barbershopId).single(),
          adminPush.from('services').select('name').eq('id', serviceId).single(),
          barberId
            ? adminPush.from('barbers').select('name').eq('id', barberId).single()
            : Promise.resolve({ data: { name: 'Sin preferencia' } }),
        ]);
        const barberP = (barberPRes as any).data;
        const scheduledDateP = new Date(scheduledAt);
        const fechaP = scheduledDateP.toLocaleDateString('es-CO', {
          weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Bogota',
        });
        const horaP = scheduledDateP.toLocaleTimeString('es-CO', {
          hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota',
        });
        const pushTitle = `📅 Nueva cita — ${shopP?.name || 'Barbería'}`;
        const pushBody = `${clientName} agendó ${serviceP?.name || 'Servicio'} con ${barberP?.name || 'Sin preferencia'} el ${fechaP} a las ${horaP}`;

        // Owner subs (barbershop-level, exclude the booked barber)
        const ownerQ = adminPush
          .from('push_subscriptions')
          .select('endpoint, keys_p256dh, keys_auth')
          .eq('barbershop_id', barbershopId)
          .eq('notif_nueva_cita', true);
        if (barberId) ownerQ.neq('user_id', barberId);
        const { data: ownerSubs } = await ownerQ;

        // Barber subs
        let barberSubs: { endpoint: string; keys_p256dh: string; keys_auth: string }[] = [];
        if (barberId) {
          const { data: bSubs } = await adminPush
            .from('push_subscriptions')
            .select('endpoint, keys_p256dh, keys_auth')
            .eq('user_id', barberId)
            .eq('notif_nueva_cita', true);
          barberSubs = bSubs || [];
        }

        const firePush = async (
          subs: { endpoint: string; keys_p256dh: string; keys_auth: string }[],
          url: string,
        ) => {
          await Promise.allSettled(
            subs.map(async (sub) => {
              try {
                await webpush.sendNotification(
                  { endpoint: sub.endpoint, keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth } },
                  JSON.stringify({ title: pushTitle, body: pushBody, url, tag: 'nueva_cita' }),
                );
              } catch (err: any) {
                if (err.statusCode === 410 || err.statusCode === 404) {
                  await adminPush.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
                }
              }
            }),
          );
        };

        await Promise.all([
          firePush(ownerSubs || [], '/dashboard/agenda'),
          firePush(barberSubs, '/barber/dashboard'),
        ]);
      }
    } catch (pushErr) {
      console.error('Push notification error:', pushErr);
    }

    // 5. Schedule post-visit via QStash
    try {
      const { Client } = await import('@upstash/qstash');
      const qstash = new Client({ token: process.env.QSTASH_TOKEN! });
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;

      const appointmentTime = new Date(scheduledAt).getTime();
      const delayMs = (appointmentTime - Date.now()) + 24 * 60 * 60 * 1000;
      const delaySeconds = Math.floor(delayMs / 1000);

      if (delaySeconds > 0 && delaySeconds <= QSTASH_MAX_DELAY) {
        await qstash.publishJSON({
          url: `${appUrl}/api/jobs/post-visita`,
          body: { citaId: appointment.id },
          delay: delaySeconds,
        });
      }
    } catch (e) {
      console.error('QStash error:', e);
    }

    return NextResponse.json(appointment, { status: 200 });

  } catch (error: any) {
    console.error('Confirmation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
