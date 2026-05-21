'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export type PlanType = 'basic' | 'pro' | 'lifetime'
export type PlanStatus = 'trialing' | 'trial' | 'active' | 'expired'

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
  },
  lifetime: {
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
  },
}

function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export function usePlan() {
  const [plan, setPlan] = useState<PlanType>('basic')
  const [status, setStatus] = useState<PlanStatus>('trialing')
  const [features, setFeatures] = useState<PlanFeatures>(PLAN_FEATURES.basic)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPlan() {
      const supabase = getAnonClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const { data: bs } = await supabase
        .from('barbershops')
        .select('plan, subscription_status')
        .eq('owner_id', session.user.id)
        .maybeSingle()

      if (bs) {
        const effectivePlan =
          bs.subscription_status === 'trialing'
            ? 'pro'
            : (bs.plan as PlanType) || 'basic'
        setPlan(effectivePlan)
        setStatus(bs.subscription_status as PlanStatus)
        setFeatures(PLAN_FEATURES[effectivePlan])

        console.log('Plan:', bs.plan)
        console.log('Status:', bs.subscription_status)
        console.log('Effective:', effectivePlan)
        console.log('Features:', PLAN_FEATURES[effectivePlan])
      }
      setLoading(false)
    }
    loadPlan()
  }, [])

  return { plan, status, features, loading }
}
