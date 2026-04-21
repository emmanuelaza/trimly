import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/serviceRole';
import { getResend } from '@/lib/resend';
import { getBaseEmailTemplate } from '@/lib/emailTemplates';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Nota: La confirmación suele ser un trigger inmediato, 
    // pero se habilita este endpoint por consistencia.
    
    return NextResponse.json({ success: true, message: 'Confirmation endpoint active' });
  } catch (error: any) {
    console.error('CRON ERROR (Confirmation):', error);
    return NextResponse.json({ error: 'Internal error', details: error.message }, { status: 500 });
  }
}
