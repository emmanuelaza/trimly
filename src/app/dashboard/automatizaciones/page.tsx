import React from 'react';
import AutomatizacionesClient from './AutomatizacionesClient';
import { getAutomations, getAutomationStats } from '@/app/actions/barbershops';
import { getBarbershopId } from '@/app/actions/utils';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/serviceRole';

export default async function AutomatizacionesPage() {
  const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms));

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const barbershopId = await getBarbershopId();

    const [automations, stats] = await Promise.race([
      Promise.all([getAutomations(), getAutomationStats()]),
      timeout(5000)
    ]) as [any[], any];

    // Check if there's an active push subscription for this barbershop
    let hasPushSubscription = false;
    if (barbershopId && user?.id) {
      const admin = getSupabaseAdmin();
      const { data: sub } = await admin
        .from('push_subscriptions')
        .select('id')
        .eq('barbershop_id', barbershopId)
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();
      hasPushSubscription = !!sub;
    }

    return (
      <AutomatizacionesClient
        initialAutomations={automations || []}
        stats={stats || { recordadas: 0, recuperados: 0, evitados: 0 }}
        barbershopId={barbershopId || ''}
        userId={user?.id || ''}
        hasPushSubscription={hasPushSubscription}
      />
    );
  } catch (error) {
    console.error("Error/Timeout in AutomatizacionesPage:", error);
    return (
      <div className="p-10 text-center bg-error/5 rounded-xl border border-error/20">
        <h2 className="text-xl font-semibold text-error mb-2">Error al cargar datos</h2>
        <p className="text-text-tertiary">No pudimos obtener las estadísticas. Por favor, intenta de nuevo.</p>
        <div className="mt-6">
          <a href="/dashboard/automatizaciones" className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium">Reintentar</a>
        </div>
      </div>
    );
  }
}
