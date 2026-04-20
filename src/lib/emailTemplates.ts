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
