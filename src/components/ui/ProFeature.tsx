'use client'

import Link from 'next/link'

interface Props {
  available: boolean
  featureName: string
  children: React.ReactNode
}

export function ProFeature({ available, featureName, children }: Props) {
  if (available) return <>{children}</>

  return (
    <div className="relative">
      <div className="opacity-40 pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background-primary/80 backdrop-blur-sm rounded-xl border border-accent/20 z-10">
        <div className="text-center p-6 max-w-xs">
          <div className="text-4xl mb-4">🔒</div>
          <p className="font-bold text-text-primary text-base">{featureName}</p>
          <p className="text-sm text-text-secondary mt-1 mb-4">Disponible en el plan Filo Pro</p>
          <Link
            href="/dashboard/upgrade"
            className="inline-block px-5 py-2.5 bg-accent text-background-primary text-sm font-bold rounded-xl hover:bg-accent/90 transition-colors"
          >
            Ver planes →
          </Link>
        </div>
      </div>
    </div>
  )
}
