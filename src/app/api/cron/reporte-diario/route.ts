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

    const { data: barbershops } = await supabase.from('barbershops').select('id, name, owner_id');
    if (!barbershops) return NextResponse.json({ ok: true, skipped: 'No barbershops' });

    const today = new Date().toISOString().split('T')[0];

    for (const shop of barbershops) {
      const { data: automation } = await supabase
        .from('automations')
        .select('is_active')
        .eq('barbershop_id', shop.id)
        .eq('type', 'daily_report')
        .maybeSingle();

      if (!automation?.is_active) continue;

      const { data: appointments } = await supabase
        .from('appointments')
        .select('price_charged, service:services(name)')
        .eq('barbershop_id', shop.id)
        .eq('status', 'completed')
        .gte('scheduled_at', `${today}T00:00:00Z`)
        .lte('scheduled_at', `${today}T23:59:59Z`);

      const totalCitas = appointments?.length || 0;
      const ingresos = (appointments as any[])?.reduce(
        (acc: number, curr: any) => acc + (Number(curr.price_charged) || 0),
        0
      ) || 0;

      const servicesMap: Record<string, number> = {};
      (appointments as any[])?.forEach((app: any) => {
        const name = (app.service as any)?.name || 'Desconocido';
        servicesMap[name] = (servicesMap[name] || 0) + 1;
      });
      const mostPopular = Object.entries(servicesMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
      const ingresosFormatted = `$${ingresos.toLocaleString('es-CO')}`;

      const { data: { user: owner } } = await supabase.auth.admin.getUserById(shop.owner_id);

      if (!owner?.email) continue;

      const fechaHoy = new Date().toLocaleDateString('es-CO', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });

      const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <style>
        body{background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:40px 20px}
        .card{background:#fff;max-width:520px;margin:0 auto;border-radius:12px;padding:32px;border:1px solid #e5e5e5}
        h2{color:#111;font-size:20px;margin:0 0 4px}
        .date{color:#888;font-size:13px;margin:0 0 24px}
        .stats{display:flex;gap:12px;margin:24px 0}
        .stat{flex:1;background:#fafafa;border:1px solid #eee;border-radius:10px;padding:16px;text-align:center}
        .stat-val{font-size:26px;font-weight:800;color:#111;display:block}
        .stat-lbl{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px;display:block}
        .row{margin-bottom:10px}
        .lbl{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:2px}
        .val{font-size:14px;font-weight:600;color:#111}
        .footer{color:#aaa;font-size:12px;text-align:center;margin-top:24px}
      </style></head><body>
      <div class="card">
        <h2>Reporte diario — ${shop.name}</h2>
        <p class="date">${fechaHoy}</p>
        <div class="stats">
          <div class="stat">
            <span class="stat-val">${totalCitas}</span>
            <span class="stat-lbl">Citas</span>
          </div>
          <div class="stat">
            <span class="stat-val">${ingresosFormatted}</span>
            <span class="stat-lbl">Ingresos</span>
          </div>
        </div>
        <div style="background:#fafafa;border-radius:8px;padding:16px;margin-top:8px">
          <div class="row"><span class="lbl">Servicio estrella</span><span class="val">${mostPopular}</span></div>
        </div>
        <p class="footer">Trimly · Sistema de gestión para barberías</p>
      </div></body></html>`;

      await sendEmail({
        to: owner.email,
        subject: `📈 Reporte Diario: ${shop.name}`,
        html,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('CRON ERROR (Daily Report):', err);
    return NextResponse.json({ error: 'Internal error', details: err.message }, { status: 500 });
  }
}
