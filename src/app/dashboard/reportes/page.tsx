import { getResumenFinanciero, getExpenses } from '@/app/actions/finanzas'
import FinanzasClient from './ReportesClient'

export const metadata = { title: 'Ingresos y Egresos | Trimly' }
export const dynamic = 'force-dynamic'

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>
}) {
  const { mes } = await searchParams
  const [resumen, expenses] = await Promise.all([
    getResumenFinanciero(mes),
    getExpenses(mes),
  ])

  return <FinanzasClient resumen={resumen} expenses={expenses} mesFiltro={mes} />
}
