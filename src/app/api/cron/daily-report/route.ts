import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/serviceRole';
import { getResend } from '@/lib/resend';
import { getBaseEmailTemplate } from '@/lib/emailTemplates';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const resend = getResend();
    
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    // 1. Get all barbershops
    const { data: barbershops } = await supabaseAdmin
      .from('barbershops')
      .select('id, name, owner_id');

    if (!barbershops) return NextResponse.json({ processed: 0 });

    let processedCount = 0;

    for (const shop of barbershops) {
      // 2. Check if daily_report is active
      const { data: automation } = await supabaseAdmin
        .from('automations')
        .select('is_active')
        .eq('barbershop_id', shop.id)
        .eq('type', 'daily_report')
        .single();

      if (automation?.is_active) {
        // 3. Calculate today's stats
        const { data: appointments } = await supabaseAdmin
          .from('appointments')
          .select('price_charged, status, service:services(name)')
          .eq('barbershop_id', shop.id)
          .gte('scheduled_at', `${dateStr}T00:00:00Z`)
          .lte('scheduled_at', `${dateStr}T23:59:59Z`);

        const totalCitas = appointments?.length || 0;
        const ingresos = appointments?.reduce((acc, a) => acc + (Number(a.price_charged) || 0), 0) || 0;
        const noShows = appointments?.filter(a => a.status === 'no_show').length || 0;

        // Calculate most popular service
        const serviceCounts: Record<string, number> = {};
        appointments?.forEach(a => {
           const sName = (a as any).service?.name || 'Varios';
           serviceCounts[sName] = (serviceCounts[sName] || 0) + 1;
        });
        const popularService = Object.entries(serviceCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';

        const html = getBaseEmailTemplate(
          `Resumen del Día - ${shop.name}`,
          `<p>Aquí tienes el resumen de actividad de hoy, <strong>${dateStr}</strong>:</p>
           <div class="highlight">
             <p><span class="label">Citas Totales</span><br>${totalCitas}</p>
             <p><span class="label">Ingresos</span><br>$${ingresos.toLocaleString()}</p>
             <p><span class="label">No-shows</span><br>${noShows}</p>
             <p><span class="label">Servicio Estrella</span><br>${popularService}</p>
           </div>
           <p>¡Buen trabajo hoy! Las métricas muestran un rendimiento sólido.</p>`,
           "Ver en Dashboard",
           `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
        );

        // Send to owner (Placeholder email for now)
        await resend.emails.send({
          from: 'Trimly <onboarding@resend.dev>',
          to: 'owner_placeholder@trimly.co',
          subject: `Reporte Diario: ${shop.name}`,
          html
        });

        processedCount++;
      }
    }

    return NextResponse.json({ success: true, processed: processedCount });
  } catch (err: any) {
    console.error('CRON ERROR (Daily Report):', err);
    return NextResponse.json({ error: 'Internal error', details: err.message }, { status: 500 });
  }
}
