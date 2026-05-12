import { getResenas } from '@/app/actions/resenas'
import { ResenasClient } from './ResenasClient'

export const metadata = { title: 'Reseñas | Trimly' }
export const dynamic = 'force-dynamic'

export default async function ResenasPage() {
  const resenas = await getResenas()
  return <ResenasClient resenas={resenas} />
}
