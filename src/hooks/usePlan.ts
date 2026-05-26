'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type PlanType = 'basic' | 'pro'
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

const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  basic: {
    maxBarbers: 1,
    maxCitasPerMonth: 100,
    reportesAvanzados: false,
    reporteDiario: false,
    recuperarInactivos: false,
    cumpleanos: false,
    postVisita: false,
    nomina: false,
    cupones: false,
    referidos: false,
    metricas: false,
    soportePrioritario: false,
    garantia: true,
  },
  pro: {
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
  },
}

export function usePlan() {
  const [plan, setPlan] = useState<PlanType>('basic')
  const [status, setStatus] = useState<PlanStatus>('trialing')
  const [features, setFeatures] = useState<PlanFeatures>(PLAN_FEATURES.pro)
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
        .select('plan, subscription_status, trial_ends_at, license_number, license_activated_at')
        .eq('owner_id', session.user.id)
        .single()

      if (bs) {
        const ahora = new Date()
        const trialDate = bs.trial_ends_at ? new Date(bs.trial_ends_at) : null
        const trialVencido = trialDate ? trialDate < ahora : false

        const planType = (bs.plan || 'basic') as PlanType
        const rawStatus = bs.subscription_status as PlanStatus

        // During trialing with valid trial → full PRO access
        const effectivePlan =
          rawStatus === 'trialing' && !trialVencido ? 'pro' : planType

        setPlan(planType)
        setStatus(trialVencido && rawStatus === 'trialing' ? 'expired' : rawStatus)
        setFeatures(PLAN_FEATURES[effectivePlan])
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

  return {
    plan,
    status,
    features,
    loading,
    trialDaysLeft,
    licenseNumber,
    isTrialing: status === 'trialing',
    isActive: status === 'active',
    isExpired: status === 'expired',
  }
}
