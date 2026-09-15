'use client'

import Link from 'next/link'

interface TrialBannerProps {
  planStatus: 'trialing' | 'active' | 'expired'
  trialDaysLeft: number
  trialHoursLeft: number
}

export function TrialBanner({ planStatus, trialDaysLeft, trialHoursLeft }: TrialBannerProps) {
  if (planStatus === 'active') return null

  if (planStatus === 'expired') {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3 mb-4 rounded-xl border bg-danger/8 border-danger/20 text-danger">
        <p className="text-sm font-medium">
          🔒 Tu prueba gratuita terminó — tus datos y clientes siguen aquí, pero no puedes agendar citas nuevas hasta activar tu licencia
        </p>
        <Link
          href="/dashboard/planes"
          className="text-sm font-semibold whitespace-nowrap hover:underline flex-shrink-0"
        >
          Activar por $399.000 →
        </Link>
      </div>
    )
  }

  const isLastDay = trialDaysLeft <= 1

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-3 mb-4 rounded-xl border ${
        isLastDay
          ? 'bg-danger/8 border-danger/20 text-danger'
          : 'bg-warning/8 border-warning/20 text-warning'
      }`}
    >
      <p className="text-sm font-medium">
        {isLastDay
          ? trialHoursLeft <= 1
            ? '⚠️ Tu prueba vence en menos de 1 hora'
            : `⚠️ Tu prueba vence en ${trialHoursLeft} horas`
          : `⏳ Te quedan ${trialDaysLeft} día${trialDaysLeft !== 1 ? 's' : ''} de prueba gratis`}
        {' '}— tienes acceso completo a Trimly mientras tanto
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
