export function getBaseEmailTemplate(title: string, bodyObj: string, btnLabel?: string, btnUrl?: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { background: #0A0A0B; font-family: 'DM Sans', Arial, sans-serif; margin: 0; padding: 40px 20px; }
        .container { max-width: 520px; margin: 0 auto; }
        .card { background: #111113; border: 1px solid #1E1E24; border-radius: 16px; padding: 32px; }
        .logo { font-size: 18px; font-weight: 600; color: #F2F2F0; margin-bottom: 24px; }
        .accent { color: #C9F53B; }
        h1 { color: #F2F2F0; font-size: 20px; font-weight: 600; margin: 0 0 8px; }
        p { color: #8A8A8A; font-size: 14px; line-height: 1.6; margin: 0 0 16px; }
        .highlight { background: #1A1A1F; border-radius: 10px; padding: 16px; margin: 20px 0; }
        .highlight p { color: #F2F2F0; margin: 4px 0; font-size: 13px; }
        .highlight .label { color: #4A4A4A; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        .btn { display: inline-block; background: #C9F53B; color: #0A0A0B; font-weight: 600; 
              font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 8px; }
        .footer { color: #4A4A4A; font-size: 12px; text-align: center; margin-top: 32px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo">Trimly</div>
          <h1>${title}</h1>
          ${bodyObj}
          ${btnLabel && btnUrl ? `<a href="${btnUrl}" class="btn">${btnLabel}</a>` : ''}
        </div>
        <div class="footer">
          Generado automáticamente por Trimly.<br>
          Software SaaS para Barberías.
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getConfirmationEmailTemplate(data: {
  clientName: string;
  serviceName: string;
  barberName: string;
  date: string;
  time: string;
  barbershopName: string;
  barbershopCity: string;
  barbershopWhatsApp: string;
}) {
  const whatsappLink = `https://wa.me/${data.barbershopWhatsApp.replace(/[^0-9]/g, '')}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f9f9f9; padding-bottom: 40px; }
        .main { background-color: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; margin-top: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background-color: #ffffff; padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #f0f0f0; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; color: #000000; letter-spacing: -0.5px; }
        .content { padding: 40px; }
        .content p { font-size: 16px; line-height: 1.6; color: #444444; margin: 0 0 24px; }
        .details-card { background-color: #fcfcfc; border: 1px solid #eeeeee; border-radius: 12px; padding: 24px; margin-bottom: 32px; }
        .detail-item { margin-bottom: 16px; border-bottom: 1px solid #f0f0f0; padding-bottom: 12px; }
        .detail-item:last-child { margin-bottom: 0; border-bottom: none; padding-bottom: 0; }
        .label { font-size: 11px; font-weight: 700; color: #999999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .value { font-size: 16px; font-weight: 600; color: #111111; }
        .footer { padding: 0 40px 40px; text-align: center; }
        .btn-whatsapp { display: inline-block; background-color: #000000; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 16px 32px; border-radius: 100px; text-decoration: none; margin-bottom: 24px; }
        .footer-text { font-size: 12px; color: #aaaaaa; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="main">
          <div class="header">
            <h1>${data.barbershopName}</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${data.clientName}</strong>, tu cita ha sido confirmada con éxito. Aquí tienes los detalles:</p>
            
            <div class="details-card">
              <div class="detail-item">
                <div class="label">Servicio</div>
                <div class="value">${data.serviceName}</div>
              </div>
              <div class="detail-item">
                <div class="label">Barbero</div>
                <div class="value">${data.barberName}</div>
              </div>
              <div class="detail-item">
                <div class="label">Fecha</div>
                <div class="value">${data.date}</div>
              </div>
              <div class="detail-item">
                <div class="label">Hora</div>
                <div class="value">${data.time}</div>
              </div>
              <div class="detail-item">
                <div class="label">Ubicación</div>
                <div class="value">${data.barbershopCity}</div>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${whatsappLink}" class="btn-whatsapp">Escribir por WhatsApp</a>
              <p style="font-size: 13px; color: #888; margin-bottom: 0;">¿Necesitas reagendar o cancelar? Comunícate directamente con la barbería.</p>
            </div>
          </div>
        </div>
        <div class="footer">
          <p class="footer-text">Trimly · Sistema de gestión para barberías</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

