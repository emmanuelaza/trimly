import Image from 'next/image'

export const metadata = { title: 'Planes | Trimly' }
export const dynamic = 'force-dynamic'

const SUPPORT_WA = process.env.NEXT_PUBLIC_SUPPORT_WA || '573001234567'

const PLANES = [
  {
    id: 'Básico',
    precio: '$29.900',
    periodo: '/mes',
    destacado: false,
    features: ['1 barbero', 'Agenda online', '100 citas/mes', 'Confirmación y recordatorio'],
  },
  {
    id: 'Filo Pro',
    precio: '$79.900',
    periodo: '/mes',
    destacado: true,
    features: [
      'Barberos ilimitados',
      'Citas ilimitadas',
      'Todas las automatizaciones',
      'Nómina y comisiones',
      'Reportes avanzados',
      'Cupones y referidos',
      'Métricas avanzadas',
      'Soporte prioritario',
    ],
  },
  {
    id: 'Lifetime',
    precio: '$559.000',
    periodo: ' pago único',
    destacado: false,
    features: [
      'Todo el plan Filo Pro',
      'Sin mensualidades nunca',
      'Funciones futuras incluidas',
    ],
  },
]

export default function UpgradePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-text-primary">Elige tu plan</h1>
        <p className="text-text-secondary">Activa las funciones que necesitas para hacer crecer tu barbería</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANES.map((plan) => {
          const msg = encodeURIComponent(`Hola, quiero activar el plan ${plan.id} en Trimly`)
          return (
            <div
              key={plan.id}
              className={`rounded-2xl border p-6 flex flex-col gap-4 ${
                plan.destacado
                  ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10 relative'
                  : 'border-border bg-background-secondary'
              }`}
            >
              {plan.destacado && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black bg-accent text-white px-3 py-1 rounded-full">
                  Más popular
                </span>
              )}
              <div>
                <p className={`text-base font-black ${plan.destacado ? 'text-accent' : 'text-text-primary'}`}>
                  {plan.id}
                </p>
                <p className="text-2xl font-black text-text-primary mt-1">
                  {plan.precio}
                  <span className="text-sm font-normal text-text-tertiary">{plan.periodo}</span>
                </p>
              </div>
              <ul className="text-sm text-text-secondary space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={`https://wa.me/${SUPPORT_WA}?text=${msg}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`block text-center py-3 rounded-xl text-sm font-bold transition-colors ${
                  plan.destacado
                    ? 'bg-accent text-white hover:bg-accent/90'
                    : 'bg-background-tertiary text-text-primary hover:bg-border'
                }`}
              >
                Activar {plan.id}
              </a>
            </div>
          )
        })}
      </div>

      <p className="text-center text-xs text-text-tertiary">
        ¿Tienes dudas? Escríbenos por WhatsApp y te ayudamos en minutos 💬
      </p>
    </div>
  )
}
