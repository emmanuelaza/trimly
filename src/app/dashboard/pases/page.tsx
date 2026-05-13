import {
  getPlanes,
  getClientSubscriptions,
  getPaseStats,
  getLoyaltyPoints,
  getServiciosParaPases,
  getClientesParaPases,
} from '@/app/actions/pases'
import PasesClient from './PasesClient'

export default async function PasesPage() {
  const [planes, suscripciones, stats, puntos, servicios, clientes] = await Promise.all([
    getPlanes(),
    getClientSubscriptions(),
    getPaseStats(),
    getLoyaltyPoints(),
    getServiciosParaPases(),
    getClientesParaPases(),
  ])

  return (
    <PasesClient
      planes={planes}
      suscripciones={suscripciones}
      stats={stats}
      puntos={puntos}
      servicios={servicios}
      clientes={clientes}
    />
  )
}
