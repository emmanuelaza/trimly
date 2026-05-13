'use client'

import { useRef } from 'react'
import { Scissors, Star, Calendar } from 'lucide-react'

interface Props {
  clientName: string
  planName: string
  planColor: string
  servicesUsed: number
  servicesIncluded: number | null
  unlimitedServices: boolean
  expiresAt: string
  qrCode: string | null
  points?: number
  barbershopName?: string
  phone?: string | null
}

export function CarnetDigital({
  clientName, planName, planColor, servicesUsed, servicesIncluded,
  unlimitedServices, expiresAt, qrCode, points, barbershopName, phone,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null)

  const disponibles = unlimitedServices ? null : (servicesIncluded ?? 0) - servicesUsed
  const expiresFormatted = new Date(expiresAt).toLocaleDateString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  const waText = encodeURIComponent(
    `Hola ${clientName}, tu ${planName} está activo 🎉\n` +
    (unlimitedServices
      ? `Tienes servicios ilimitados este mes.\n`
      : `Te quedan ${disponibles} cortes disponibles.\n`) +
    `Muestra este código en tu próxima visita: ${qrCode}\nVence el ${expiresFormatted}`
  )
  const waHref = phone ? `https://wa.me/${phone.replace(/\D/g, '')}?text=${waText}` : undefined

  return (
    <div className="space-y-4 w-full max-w-sm mx-auto">
      {/* Card */}
      <div
        ref={cardRef}
        className="rounded-3xl overflow-hidden shadow-2xl select-none"
        style={{ background: `linear-gradient(135deg, ${planColor} 0%, ${planColor}cc 100%)` }}
      >
        {/* Top */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Scissors size={16} className="text-white" />
            </div>
            <span className="text-white/90 font-black text-sm tracking-wider">Trimly</span>
          </div>
          {barbershopName && (
            <span className="text-white/70 text-[10px] font-medium truncate max-w-[120px]">{barbershopName}</span>
          )}
        </div>

        {/* Client name */}
        <div className="px-6 pb-4 text-center">
          <p className="text-white font-black text-2xl tracking-tight leading-tight">{clientName}</p>
          <p className="text-white/80 font-semibold text-sm mt-1">{planName}</p>
        </div>

        {/* QR Code */}
        <div className="mx-6 mb-4 bg-white rounded-2xl p-4 flex flex-col items-center gap-2">
          <p className="font-mono text-gray-900 font-black text-lg tracking-[0.2em] text-center">
            {qrCode ?? 'SIN CÓDIGO'}
          </p>
          <p className="text-gray-400 text-[10px]">Muéstralo en tu próxima visita</p>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between px-6 pb-6">
          <div>
            <p className="text-white/70 text-[10px] uppercase tracking-widest font-bold">Cortes</p>
            <p className="text-white font-black text-base">
              {unlimitedServices ? 'Ilimitado ∞' : `${disponibles} disponibles`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-[10px] uppercase tracking-widest font-bold">Vence</p>
            <p className="text-white font-bold text-sm">{expiresFormatted}</p>
          </div>
        </div>

        {/* Points badge */}
        {points != null && points > 0 && (
          <div className="mx-6 mb-5 flex items-center justify-center gap-1.5 bg-white/20 rounded-xl py-2 px-4 w-fit mx-auto">
            <Star size={13} className="text-yellow-300 fill-yellow-300" />
            <span className="text-white font-bold text-sm">{points} puntos</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 rounded-xl bg-[#25D366] text-white font-bold text-sm text-center hover:opacity-90 transition-opacity"
          >
            Compartir por WhatsApp
          </a>
        )}
        <button
          onClick={() => window.print()}
          className="flex-1 py-3 rounded-xl border border-border bg-background-secondary text-text-primary font-bold text-sm hover:bg-background-tertiary transition-colors"
        >
          Imprimir / Guardar
        </button>
      </div>
    </div>
  )
}
