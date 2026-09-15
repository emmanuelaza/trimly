'use client'

import Link from 'next/link'
import { usePlan } from '@/hooks/usePlan'

export function TrialBanner() {
  const { isTrialing, isExpired, trialDaysLeft } = usePlan()
  if (!isTrialing && !isExpired) return null

  if (isExpired) {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3 mb-4 rounded-xl border bg-danger/8 border-danger/20 text-danger">
        <p className="text-sm font-medium">
          🔒 Tu prueba terminó — tus datos y clientes siguen aquí, pero necesitas activar tu licencia para seguir agendando citas nuevas
        </p>
        <Link
          href="/dashboard/planes"
          className="text-sm font-semibold whitespace-nowrap hover:underline flex-shrink-0"
        >
          Activar licencia →
        </Link>
      </div>
    )
  }

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
        {' '}— Tienes acceso completo a Trimly
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
