import { getPayrollData, getPaymentHistory } from '@/app/actions/nomina';
import NominaClient from './NominaClient';
import { getBarbershopId } from '@/app/actions/utils';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function NominaPage({ searchParams }: { searchParams: Promise<any> }) {
  const params = await searchParams;
  const now = new Date();

  const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const defaultEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const start = params.start || defaultStart;
  const end   = params.end   || defaultEnd;

  let services: { id: string; name: string; price: number }[] = [];
  try {
    const barbershopId = await getBarbershopId();
    if (barbershopId) {
      const supabase = await createClient();
      const { data } = await supabase
        .from('services')
        .select('id, name, price')
        .eq('barbershop_id', barbershopId)
        .eq('is_active', true);
      services = data || [];
    }
  } catch { /* non-blocking */ }

  const [liquidation, history] = await Promise.all([
    getPayrollData({ start, end }),
    getPaymentHistory(),
  ]);

  return (
    <NominaClient
      initialLiquidation={liquidation}
      initialHistory={history}
      period={{ start, end }}
      services={services}
    />
  );
}
