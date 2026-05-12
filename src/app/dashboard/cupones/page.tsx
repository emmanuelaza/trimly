import { getCupones } from '@/app/actions/cupones'
import { CuponesClient } from './CuponesClient'

export const metadata = { title: 'Cupones | Trimly' }
export const dynamic = 'force-dynamic'

export default async function CuponesPage() {
  const cupones = await getCupones()
  return <CuponesClient cupones={cupones} />
}
