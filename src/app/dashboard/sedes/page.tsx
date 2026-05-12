import { getSedes } from '@/app/actions/sedes'
import { SedesClient } from './SedesClient'

export const metadata = { title: 'Sedes | Trimly' }
export const dynamic = 'force-dynamic'

export default async function SedesPage() {
  const sedes = await getSedes()
  return <SedesClient sedes={sedes} />
}
