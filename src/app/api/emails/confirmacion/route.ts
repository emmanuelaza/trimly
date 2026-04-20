import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';
import { getBaseEmailTemplate } from '@/lib/emailTemplates';

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

    const data = await resend.emails.send({
      from: 'Trimly <citas@trimly.com>', // Set a valid domain once verified
      to: email,
      subject: `Tu cita confirmada en ${barberia}`,
      html: template,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
