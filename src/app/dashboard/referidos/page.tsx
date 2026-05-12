import {
  getReferralProgram,
  getReferralActivity,
  getTopReferrers,
  getPendingCredits,
  getReferralStats,
} from '@/app/actions/referidos'
import { getBarbershop } from '@/app/actions/barbershops'
import { ReferidosClient } from './ReferidosClient'

export const metadata = { title: 'Referidos | Trimly' }
export const dynamic = 'force-dynamic'

export default async function ReferidosPage() {
  const [program, activity, topReferrers, pendingCredits, stats, barbershop] = await Promise.all([
    getReferralProgram(),
    getReferralActivity(),
    getTopReferrers(),
    getPendingCredits(),
    getReferralStats(),
    getBarbershop(),
  ])

  return (
    <ReferidosClient
      program={program}
      activity={activity}
      topReferrers={topReferrers}
      pendingCredits={pendingCredits}
      stats={stats}
      barbershopName={barbershop?.name ?? 'Tu barbería'}
    />
  )
}
