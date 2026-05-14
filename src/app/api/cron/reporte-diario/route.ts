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

    const supabaseAdmin = getSupabaseAdmin();

    const { data: barbershops } = await supabaseAdmin.from('barbershops').select('id, name, owner_id');
    if (!barbershops) return NextResponse.json({ ok: true, skipped: 'No barbershops' });

    for (const shop of barbershops) {
      const { data: automation } = await supabaseAdmin
        .from('automations')
        .select('is_active')
        .eq('barbershop_id', shop.id)
        .eq('type', 'daily_report')
        .maybeSingle();

      if (automation?.is_active) {
        const today = new Date().toISOString().split('T')[0];
        
        const { data: appointments } = await supabaseAdmin
          .from('appointments')
          .select('price_charged, service:services(name)')
          .eq('barbershop_id', shop.id)
          .eq('status', 'completed')
          .gte('scheduled_at', `${today}T00:00:00Z`)
          .lte('scheduled_at', `${today}T23:59:59Z`);

        const totalCitas = appointments?.length || 0;
        const ingresos = (appointments as any[])?.reduce((acc: number, curr: any) => acc + (Number(curr.price_charged) || 0), 0) || 0;
        
        const servicesMap: Record<string, number> = {};
        (appointments as any[])?.forEach((app: any) => {
          const name = (app.service as any)?.name || 'Desconocido';
          servicesMap[name] = (servicesMap[name] || 0) + 1;
        });
        const mostPopular = Object.entries(servicesMap).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';

        const { data: { user: owner } } = await supabaseAdmin.auth.admin.getUserById(shop.owner_id);
        
        if (owner?.email) {
          const html = getBaseEmailTemplate(
            `Resumen Diario - ${shop.name}`,
            `<p>Hola, este es el resumen de hoy para tu barbería:</p>
             <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
               <p><strong>Citas completadas:</strong> ${totalCitas}</p>
               <p><strong>Ingresos totales:</strong> $${ingresos.toLocaleString()}</p>
               <p><strong>Servicio estrella:</strong> ${mostPopular}</p>
             </div>`
          );

          await sendEmail({
            to: owner.email,
            subject: `📈 Reporte Diario: ${shop.name}`,
            html,
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('CRON ERROR (Daily Report):', err);
    return NextResponse.json({ error: 'Internal error', details: err.message }, { status: 500 });
  }
}
