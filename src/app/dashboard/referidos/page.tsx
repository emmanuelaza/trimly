import { getReferralProgram, getReferralUses } from '@/app/actions/referidos'
import { ReferidosClient } from './ReferidosClient'

export const metadata = { title: 'Referidos | Trimly' }
export const dynamic = 'force-dynamic'

export default async function ReferidosPage() {
  const [program, uses] = await Promise.all([getReferralProgram(), getReferralUses()])
  return <ReferidosClient program={program} uses={uses} />
}
