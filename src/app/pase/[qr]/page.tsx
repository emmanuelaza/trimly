import { notFound } from 'next/navigation'
import { getPaseByQR } from '@/app/actions/pases'
import { CarnetDigital } from '@/components/pases/CarnetDigital'
import { PaseQRButton } from './PaseQRButton'
import { AlertTriangle, Clock } from 'lucide-react'

interface Props {
  params: Promise<{ qr: string }>
}

export default async function PaseQRPage({ params }: Props) {
  const { qr } = await params
  const pase = await getPaseByQR(qr.toUpperCase())

  if (!pase) notFound()

  const plan = pase.subscription_plans
  const client = pase.clients

  const isExpired = pase.status !== 'active'
  const agotado = !plan.unlimited_services && pase.services_used >= (plan.services_included ?? 0)

  return (
    <div className="min-h-screen bg-background-primary p-6 flex flex-col items-center justify-center gap-6">
      {isExpired && (
        <div className="w-full max-w-sm flex items-center gap-2 px-4 py-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-bold">
          <AlertTriangle size={16} className="shrink-0" />
          Este pase está {pase.status === 'cancelled' ? 'cancelado' : 'vencido'}
        </div>
      )}

      {!isExpired && agotado && (
        <div className="w-full max-w-sm flex items-center gap-2 px-4 py-3 rounded-xl bg-warning/10 border border-warning/20 text-warning text-sm font-bold">
          <Clock size={16} className="shrink-0" />
          Cortes agotados en este período
        </div>
      )}

      <CarnetDigital
        clientName={client.name}
        planName={plan.name}
        planColor={plan.color}
        servicesUsed={pase.services_used}
        servicesIncluded={plan.services_included}
        unlimitedServices={plan.unlimited_services}
        expiresAt={pase.expires_at}
        qrCode={pase.qr_code}
        phone={client.phone}
      />

      {!isExpired && (
        <div className="w-full max-w-sm">
          <PaseQRButton qr={qr.toUpperCase()} agotado={agotado} />
        </div>
      )}

      <p className="text-[10px] text-text-tertiary">Trimly · Sistema de Pases</p>
    </div>
  )
}
