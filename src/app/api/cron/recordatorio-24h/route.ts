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

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        client_id,
        scheduled_at,
        barbershop_id,
        client:clients(name, email),
        service:services(name),
        barber:barbers(name),
        barbershop:barbershops(name, whatsapp)
      `)
      .gte('scheduled_at', `${dateStr}T00:00:00Z`)
      .lte('scheduled_at', `${dateStr}T23:59:59Z`)
      .eq('status', 'confirmed');

    if (error) throw error;
    if (!appointments?.length) return NextResponse.json({ sent: 0 });

    let sentCount = 0;

    for (const app of appointments) {
      const [{ data: automation }, { data: confirmAuto }] = await Promise.all([
        supabase.from('automations').select('is_active').eq('barbershop_id', app.barbershop_id).eq('type', 'reminder_24h').maybeSingle(),
        supabase.from('automations').select('is_active').eq('barbershop_id', app.barbershop_id).eq('type', 'confirmation').maybeSingle(),
      ]);

      if (!automation?.is_active || !confirmAuto?.is_active) continue;

      const client = app.client as any;
      const service = app.service as any;
      const barber = app.barber as any;
      const shop = (app as any).barbershop as any;

      if (!client?.email) continue;

      const scheduledDate = new Date(app.scheduled_at);
      const fecha = scheduledDate.toLocaleDateString('es-CO', {
        weekday: 'long', day: 'numeric', month: 'long',
        timeZone: 'America/Bogota',
      });
      const hora = scheduledDate.toLocaleTimeString('es-CO', {
        hour: '2-digit', minute: '2-digit',
        timeZone: 'America/Bogota',
      });

      const whatsappNum = shop?.whatsapp?.replace(/[^0-9]/g, '') || '';

      const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <style>
        body{background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:40px 20px}
        .card{background:#fff;max-width:520px;margin:0 auto;border-radius:12px;padding:32px;border:1px solid #e5e5e5}
        h2{color:#111;font-size:20px;margin:0 0 8px}
        p{color:#444;font-size:14px;line-height:1.6;margin:0 0 16px}
        .info{background:#fafafa;border-radius:8px;padding:16px;margin:20px 0}
        .row{margin-bottom:10px}
        .lbl{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:2px}
        .val{font-size:14px;font-weight:600;color:#111}
        .btn{display:inline-block;background:#111;color:#fff;font-weight:600;font-size:14px;padding:14px 28px;border-radius:8px;text-decoration:none}
        .footer{color:#aaa;font-size:12px;text-align:center;margin-top:24px}
      </style></head><body>
      <div class="card">
        <h2>Recordatorio: tu cita es mañana ✂️</h2>
        <p>Hola <strong>${client.name}</strong>, te recordamos que tienes una cita programada para mañana.</p>
        <div class="info">
          <div class="row"><span class="lbl">Servicio</span><span class="val">${service?.name}</span></div>
          <div class="row"><span class="lbl">Barbero</span><span class="val">${barber?.name || 'Por asignar'}</span></div>
          <div class="row"><span class="lbl">Fecha</span><span class="val">${fecha}</span></div>
          <div class="row"><span class="lbl">Hora</span><span class="val">${hora}</span></div>
          <div class="row"><span class="lbl">Barbería</span><span class="val">${shop?.name || ''}</span></div>
        </div>
        <p>¿Necesitas reagendar? Contáctanos con tiempo.</p>
        ${whatsappNum ? `<div style="text-align:center"><a href="https://wa.me/${whatsappNum}" class="btn">Escribir por WhatsApp</a></div>` : ''}
        <p class="footer">Trimly · Sistema de gestión para barberías</p>
      </div></body></html>`;

      await sendEmail({
        to: client.email,
        toName: client.name,
        subject: '✂️ Recordatorio: tu cita es mañana',
        html,
      });

      await supabase.from('automation_logs').insert({
        automation_type: 'reminder_24h',
        appointment_id: app.id,
        client_id: app.client_id,
        channel: 'email',
        barbershop_id: app.barbershop_id,
      });

      sentCount++;
    }

    return NextResponse.json({ success: true, sent: sentCount });
  } catch (err: any) {
    console.error('CRON ERROR (24h Reminder):', err);
    return NextResponse.json({ error: 'Internal error', details: err.message }, { status: 500 });
  }
}
