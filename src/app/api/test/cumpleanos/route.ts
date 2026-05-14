import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/serviceRole';
import { sendEmail } from '@/lib/email';
import { getBaseEmailTemplate } from '@/lib/emailTemplates';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Buscar cualquier cliente con email y fecha de nacimiento (o solo email para la prueba)
    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .select('id, name, email, barbershop_id, birthdate')
      .not('email', 'is', null)
      .limit(1)
      .single();

    if (error || !client) {
      return NextResponse.json({ success: false, error: "No hay clientes con email registrado" });
    }

    const html = getBaseEmailTemplate(
      "TEST - ¡Feliz Cumpleaños!",
      `<p>Hola <strong>${client.name}</strong>, esto es una prueba del mensaje de felicitación de cumpleaños. 🎂</p>
       <p>Para celebrar, tienes un <strong>20% de descuento</strong> en tu siguiente corte. ¡Pide tu cita y presenta este correo!</p>`
    );

    await sendEmail({
      to: client.email,
      toName: client.name,
      subject: '🎂 TEST: ¡Feliz cumpleaños!',
      html
    });

    return NextResponse.json({ success: true, sentTo: client.email });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
