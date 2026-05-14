import * as Brevo from '@getbrevo/brevo'

const apiInstance = new Brevo.TransactionalEmailsApi()
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
)

interface SendEmailParams {
  to: string
  toName?: string
  subject: string
  html: string
}

export async function sendEmail({ to, toName, subject, html }: SendEmailParams): Promise<boolean> {
  const email = new Brevo.SendSmtpEmail()

  email.sender = {
    email: process.env.BREVO_FROM_EMAIL!,
    name: process.env.BREVO_FROM_NAME || 'Trimly',
  }
  email.to = [{ email: to, name: toName || to }]
  email.subject = subject
  email.htmlContent = html

  try {
    await apiInstance.sendTransacEmail(email)
    return true
  } catch (err) {
    console.error('Brevo email error:', err)
    return false
  }
}
