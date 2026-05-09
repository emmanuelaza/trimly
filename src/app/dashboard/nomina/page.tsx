import { getPayrollData, getPaymentHistory } from '@/app/actions/nomina';
import NominaClient from './NominaClient';
import { getBarbershopId } from '@/app/actions/utils';
import { createClient } from '@/lib/supabase/server';

export default async function NominaPage({ searchParams }: { searchParams: any }) {
  const params = await searchParams;
  const now = new Date();
  
  // Default to current week if no range specified
  const start = params.start || new Date(now.setDate(now.getDate() - now.getDay())).toISOString().split('T')[0];
  const end = params.end || new Date(now.setDate(now.getDate() - now.getDay() + 6)).toISOString().split('T')[0];

  const [liquidation, history] = await Promise.all([
    getPayrollData({ start, end }),
    getPaymentHistory()
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-text-primary">Nómina</h1>
        <p className="text-sm text-text-tertiary mt-1">Controla lo que gana cada barbero y lleva el registro de tus pagos</p>
      </div>

      <NominaClient 
        initialLiquidation={liquidation} 
        initialHistory={history}
        period={{ start, end }}
      />
    </div>
  );
}
