import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/serviceRole';
import { getResend } from '@/lib/resend';
import { getBaseEmailTemplate } from '@/lib/emailTemplates';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const resend = getResend();

    // Buscar la primera barbería
    const { data: shop, error } = await supabaseAdmin
      .from('barbershops')
      .select('id, name, owner_id')
      .limit(1)
      .single();

    if (error || !shop) {
      return NextResponse.json({ success: false, error: "No hay barberías registradas" });
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Citas de hoy
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
    
    if (!owner?.email) {
      return NextResponse.json({ success: false, error: "El dueño de la barbería no tiene email registrado" });
    }

    const html = getBaseEmailTemplate(
      `TEST - Resumen Diario - ${shop.name}`,
      `<p>Hola, esto es una prueba del reporte diario para tu barbería:</p>
       <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
         <p><strong>Citas completadas:</strong> ${totalCitas}</p>
         <p><strong>Ingresos totales:</strong> $${ingresos.toLocaleString()}</p>
         <p><strong>Servicio estrella:</strong> ${mostPopular}</p>
       </div>`
    );

    await resend.emails.send({
      from: 'Trimly <no-reply@trimlyapp.com>',
      to: owner.email,
      subject: `📈 TEST: Reporte Diario - ${shop.name}`,
      html
    });

    return NextResponse.json({ success: true, sentTo: owner.email });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
