'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type PlanStatus = 'trialing' | 'active' | 'expired'

export interface PlanFeatures {
  maxBarbers: number
  maxCitasPerMonth: number
  reportesAvanzados: boolean
  reporteDiario: boolean
  recuperarInactivos: boolean
  cumpleanos: boolean
  postVisita: boolean
  nomina: boolean
  cupones: boolean
  referidos: boolean
  metricas: boolean
  soportePrioritario: boolean
  garantia: boolean
}

// Licencia única: todas las funciones disponibles sin distinción de plan.
const FULL_FEATURES: PlanFeatures = {
  maxBarbers: -1,
  maxCitasPerMonth: -1,
  reportesAvanzados: true,
  reporteDiario: true,
  recuperarInactivos: true,
  cumpleanos: true,
  postVisita: true,
  nomina: true,
  cupones: true,
  referidos: true,
  metricas: true,
  soportePrioritario: true,
  garantia: true,
}

export function usePlan() {
  const [status, setStatus] = useState<PlanStatus>('trialing')
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null)
  const [licenseNumber, setLicenseNumber] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPlan() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const { data: bs } = await supabase
        .from('barbershops')
        .select('subscription_status, trial_ends_at, license_number')
        .eq('owner_id', session.user.id)
        .single()

      if (bs) {
        const ahora = new Date()
        const trialDate = bs.trial_ends_at ? new Date(bs.trial_ends_at) : null
        const trialVencido = trialDate ? trialDate < ahora : false
        const rawStatus = bs.subscription_status as PlanStatus

        setStatus(trialVencido && rawStatus === 'trialing' ? 'expired' : rawStatus)
        setTrialEndsAt(trialDate)
        setLicenseNumber(bs.license_number || '')
      }
      setLoading(false)
    }
    loadPlan()
  }, [])

  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  const trialHoursLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60)))
    : 0

  return {
    status,
    features: FULL_FEATURES,
    loading,
    trialDaysLeft,
    trialHoursLeft,
    licenseNumber,
    isTrialing: status === 'trialing',
    isActive: status === 'active',
    isExpired: status === 'expired',
  }
}
