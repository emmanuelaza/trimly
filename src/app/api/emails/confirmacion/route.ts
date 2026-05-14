import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getBaseEmailTemplate } from '@/lib/emailTemplates';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, nombre, fecha, hora, servicio, barberia } = body;

    const htmlBody = `
      <p>Hola ${nombre},</p>
      <p>Tu cita en <strong>${barberia}</strong> ha sido confirmada. Aquí tienes los detalles:</p>
      <div class="highlight">
        <p><span class="label">Servicio:</span> ${servicio}</p>
        <p><span class="label">Fecha:</span> ${fecha}</p>
        <p><span class="label">Hora:</span> ${hora}</p>
      </div>
      <p>Te esperamos puntualmente. Si necesitas reagendar, por favor contáctanos con anticipación.</p>
    `;

    const template = getBaseEmailTemplate('Cita Confirmada ✅', htmlBody);

    await sendEmail({
      to: email,
      toName: nombre,
      subject: `Tu cita confirmada en ${barberia}`,
      html: template,
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Confirmation email POST fail', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
