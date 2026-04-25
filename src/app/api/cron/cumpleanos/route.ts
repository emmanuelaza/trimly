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
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const monthDay = `${month}-${day}`;

    // Buscar clientes que cumplen años hoy (formato MM-DD en el campo birthdate o similar cast)
    // Usamos una consulta que compare mes y día
    const { data: clients, error } = await supabaseAdmin
      .from('clients')
      .select('id, name, email, barbershop_id, birthdate');

    if (error) throw error;
    
    // Filtrado en JS para simplicidad con diferentes formatos de fecha, 
    // aunque lo ideal sería en SQL si el volumen es muy alto.
    const bdayClients = clients?.filter(c => c.birthdate && c.birthdate.includes(monthDay)) || [];

    if (bdayClients.length === 0) return NextResponse.json({ sent: 0 });

    let sentCount = 0;

    for (const client of bdayClients) {
      const { data: automation } = await supabaseAdmin
        .from('automations')
        .select('is_active')
        .eq('barbershop_id', client.barbershop_id)
        .eq('type', 'birthday')
        .single();

      if (automation?.is_active && client.email) {
        const html = getBaseEmailTemplate(
          "¡Feliz Cumpleaños!",
          `<p>Hola <strong>${client.name}</strong>, de parte de todo el equipo de la barbería te deseamos un muy feliz día. 🎂</p>
           <p>Para celebrar, tienes un <strong>20% de descuento</strong> en tu siguiente corte. ¡Pide tu cita y presenta este correo!</p>`
        );

        await resend.emails.send({
          from: 'Trimly <no-reply@trimlyapp.com>',
          to: client.email,
          subject: '🎂 ¡Feliz cumpleaños! Tenemos un regalo para ti',
          html
        });

        await supabaseAdmin.from('automation_logs').insert({
          automation_type: 'birthday',
          client_id: client.id,
          channel: 'email',
          barbershop_id: client.barbershop_id
        });

        sentCount++;
      }
    }

    return NextResponse.json({ sent: sentCount });
  } catch (err: any) {
    console.error('CRON ERROR (Birthday):', err);
    return NextResponse.json({ error: 'Internal error', details: err.message }, { status: 500 });
  }
}
