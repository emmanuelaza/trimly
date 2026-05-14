import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (req.headers.get('x-vercel-cron') !== '1' && authHeader !== `Bearer ${cronSecret}`) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Nota: La confirmación suele ser un trigger inmediato, 
    // pero se habilita este endpoint por consistencia.
    
    return NextResponse.json({ success: true, message: 'Confirmation endpoint active' });
  } catch (error: any) {
    console.error('CRON ERROR (Confirmation):', error);
    return NextResponse.json({ error: 'Internal error', details: error.message }, { status: 500 });
  }
}
