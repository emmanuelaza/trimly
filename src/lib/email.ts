interface SendEmailParams {
  to: string
  toName?: string
  subject: string
  html: string
}

export async function sendEmail({ to, toName, subject, html }: SendEmailParams): Promise<boolean> {
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: {
          email: process.env.BREVO_FROM_EMAIL!,
          name: process.env.BREVO_FROM_NAME || 'Trimly',
        },
        to: [{ email: to, name: toName || to }],
        subject,
        htmlContent: html,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('Brevo email error:', res.status, body)
      return false
    }

    return true
  } catch (err) {
    console.error('Brevo email error:', err)
    return false
  }
}
