import React from 'react';
import ReportesClient from './ReportesClient';
import { getReportStats } from '@/app/actions/appointments';
import { createClient } from '@/lib/supabase/server';
import { getBarbershopId } from '@/app/actions/utils';

export default async function ReportesPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  try {
    const { p } = await searchParams;
    const stats = await getReportStats((p as any) || 'mes');
    const barbershopId = await getBarbershopId();
    const supabase = await createClient();

    if (!barbershopId) throw new Error("No barbershopId");

    const { data: barbershop } = await supabase
      .from('barbershops')
      .select('subscription_status')
      .eq('id', barbershopId)
      .maybeSingle();

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan_type')
      .eq('barbershop_id', barbershopId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!stats) {
      // If null, it means no barbershop found or critical error
      return (
        <div className="p-10 text-center bg-background-secondary/30 rounded-xl border border-border-strong">
          <h2 className="text-xl font-semibold text-text-primary mb-2">No hay datos disponibles</h2>
          <p className="text-text-tertiary">Asegúrate de tener un negocio configurado.</p>
        </div>
      );
    }

    return (
      <ReportesClient 
        stats={stats} 
        initialPeriod={(p as any) || 'mes'} 
        subscriptionStatus={barbershop?.subscription_status}
        planType={sub?.plan_type}
      />
    );
  } catch (error) {
    console.error("Error in ReportesPage:", error);
    return (
      <div className="p-10 text-center bg-error/5 rounded-xl border border-error/20">
        <h2 className="text-xl font-semibold text-error mb-2">Error al generar reporte</h2>
        <p className="text-text-tertiary">Hubo un problema al procesar los datos.</p>
      </div>
    );
  }
}
