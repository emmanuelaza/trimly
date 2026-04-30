import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendConfirmationEmail({
  to,
  clientName,
  barbershopName,
  serviceName,
  barberName,
  date,
  phone
}: {
  to: string
  clientName: string
  barbershopName: string
  serviceName: string
  barberName: string
  date: string
  phone: string
}) {
  const formattedDate = new Date(date).toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Bogota'
  })

  const formattedTime = new Date(date).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Bogota'
  })

  try {
    console.log('Attempting to send confirmation email to:', to);
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject: `Tu cita está confirmada — ${barbershopName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #ffffff; border: 1px solid #eee; border-radius: 12px;">
          <h1 style="font-size: 20px; font-weight: 600; color: #111; margin-bottom: 16px;">¡Tu cita está confirmada!</h1>
          
          <p style="font-size: 14px; color: #444; margin-bottom: 24px;">Hola <strong>${clientName}</strong>, tu reserva en <strong>${barbershopName}</strong> ha sido programada con éxito.</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
            <div style="margin-bottom: 12px;">
              <span style="font-size: 11px; text-transform: uppercase; color: #888; display: block; margin-bottom: 2px;">Servicio</span>
              <span style="font-size: 15px; font-weight: 600; color: #111;">${serviceName}</span>
            </div>
            <div style="margin-bottom: 12px;">
              <span style="font-size: 11px; text-transform: uppercase; color: #888; display: block; margin-bottom: 2px;">Barbero</span>
              <span style="font-size: 15px; font-weight: 600; color: #111;">${barberName}</span>
            </div>
            <div style="margin-bottom: 12px;">
              <span style="font-size: 11px; text-transform: uppercase; color: #888; display: block; margin-bottom: 2px;">Fecha y Hora</span>
              <span style="font-size: 15px; font-weight: 600; color: #111;">${formattedDate} a las ${formattedTime}</span>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="https://wa.me/${phone.replace(/\s+/g, '')}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Contactar con la barbería</a>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 32px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">Trimly · Gestión inteligente para tu barbería</p>
        </div>
      `
    });
    console.log('Resend result:', result);
    return result;
  } catch (error) {
    console.error('Error in sendConfirmationEmail:', error);
    throw error;
  }
}
