import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/serviceRole';
import { resend } from '@/lib/resend';
import { getBaseEmailTemplate } from '@/lib/emailTemplates';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
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
          .select('price_charged, status')
          .eq('barbershop_id', shop.id)
          .gte('scheduled_at', `${dateStr}T00:00:00Z`)
          .lte('scheduled_at', `${dateStr}T23:59:59Z`);

        const totalCitas = appointments?.length || 0;
        const ingresos = appointments?.reduce((acc, a) => acc + (Number(a.price_charged) || 0), 0) || 0;
        const noShows = appointments?.filter(a => a.status === 'no_show').length || 0;

        // 4. Get owner email (need to join with auth.users or check if we have it in barbershops - currently we have owner_id)
        // For simplicity, let's assume we send it to a test address or we have a way to get owner email.
        // In a real app, we'd query auth.users or have an email field in barbershops.
        
        const html = getBaseEmailTemplate(
          `Resumen del Día - ${shop.name}`,
          `<p>Aquí tienes el resumen de actividad de hoy, <strong>${dateStr}</strong>:</p>
           <div class="highlight">
             <p><span class="label">Citas Totales</span><br>${totalCitas}</p>
             <p><span class="label">Ingresos</span><br>$${ingresos.toLocaleString()}</p>
             <p><span class="label">No-shows</span><br>${noShows}</p>
           </div>
           <p>¡Buen trabajo hoy!</p>`,
           "Ver en Dashboard",
           `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
        );

        // Send to owner (Mocking owner email for now or using a fixed one for the user)
        // In full implementation, we'd fetch shop.owner_email
        await resend.emails.send({
          from: 'Trimly <onboarding@resend.dev>',
          to: 'owner_placeholder@trimly.co', // This would be shop.owner_email
          subject: `Reporte Diario: ${shop.name}`,
          html
        });

        processedCount++;
      }
    }

    return NextResponse.json({ processed: processedCount });
  } catch (err: any) {
    console.error('CRON ERROR (Daily Report):', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
