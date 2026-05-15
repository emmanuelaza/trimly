'use client'

import { usePlan } from '@/hooks/usePlan'
import { ProFeature } from '@/components/ui/ProFeature'

export function MetricasGate({ children }: { children: React.ReactNode }) {
  const { features } = usePlan()
  return (
    <ProFeature available={features.metricas} featureName="Métricas avanzadas">
      {children}
    </ProFeature>
  )
}
