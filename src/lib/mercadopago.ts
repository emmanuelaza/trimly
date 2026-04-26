import { MercadoPagoConfig, Payment, Preference, PreApproval } from 'mercadopago';
import crypto from 'crypto';

// Initialize Mercado Pago with Access Token
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN! 
});

// Export instances
export const mpPayment = new Payment(client);
export const mpPreference = new Preference(client);
export const mpPreApproval = new PreApproval(client);

/**
 * Verifies the signature of the Mercado Pago webhook.
 * Patrón solicitado por el usuario: HMAC SHA256 con MP_WEBHOOK_SECRET
 */
export function verifyWebhookSignature(signature: string, body: string): boolean {
  try {
    const secret = process.env.MP_WEBHOOK_SECRET;
    if (!secret) return false;

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(body);
    const digest = hmac.digest('hex');
    
    return digest === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}
