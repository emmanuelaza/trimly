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
 * New algorithm: ts and v1 from x-signature + x-request-id
 */
export function verifyWebhookSignature(signature: string, xRequestId: string): boolean {
  try {
    console.log('--- MP Webhook Verification ---');
    console.log('X-Signature:', signature);
    console.log('X-Request-Id:', xRequestId);

    const secret = process.env.MP_WEBHOOK_SECRET;
    if (!secret) {
      console.error('MP_WEBHOOK_SECRET is missing');
      return false;
    }

    // signature format: ts=123456,v1=abcdef...
    const parts = signature.split(',');
    const tsPart = parts.find(p => p.startsWith('ts='));
    const v1Part = parts.find(p => p.startsWith('v1='));

    if (!tsPart || !v1Part) {
      console.warn('Invalid signature format');
      return false;
    }

    const ts = tsPart.split('=')[1];
    const v1 = v1Part.split('=')[1];

    const signedTemplate = `ts:${ts};v1:${xRequestId};`;
    console.log('Signed Template:', signedTemplate);

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(signedTemplate);
    const digest = hmac.digest('hex');
    
    console.log('Computed Digest:', digest);
    console.log('Expected v1:', v1);

    const isValid = digest === v1;
    console.log('Signature Valid:', isValid);
    console.log('-------------------------------');

    return isValid;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}
