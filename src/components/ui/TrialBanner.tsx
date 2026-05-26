'use client'

import Link from 'next/link'
import { usePlan } from '@/hooks/usePlan'

export function TrialBanner() {
  const { isTrialing, trialDaysLeft } = usePlan()
  if (!isTrialing) return null

  const color =
    trialDaysLeft <= 1
      ? 'bg-danger/8 border-danger/20 text-danger'
      : 'bg-warning/8 border-warning/20 text-warning'

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-3 mb-4 rounded-xl border ${color}`}
    >
      <p className="text-sm font-medium">
        {trialDaysLeft === 0
          ? '⚠️ Tu prueba vence hoy'
          : `⏳ Te quedan ${trialDaysLeft} día${trialDaysLeft !== 1 ? 's' : ''} de prueba gratis`}
        {' '}— Tienes acceso completo al plan Pro
      </p>
      <Link
        href="/dashboard/planes"
        className="text-sm font-semibold whitespace-nowrap hover:underline"
      >
        Activar licencia →
      </Link>
    </div>
  )
}
