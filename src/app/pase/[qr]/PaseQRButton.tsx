'use client'

import { useState } from 'react'
import { registrarUsoPorQR } from '@/app/actions/pases'
import { CheckCircle2, Loader2, Scissors } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  qr: string
  agotado: boolean
}

export function PaseQRButton({ qr, agotado }: Props) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [used, setUsed] = useState(0)
  const [confirming, setConfirming] = useState(false)

  const handleRegister = async () => {
    setLoading(true)
    const result = await registrarUsoPorQR(qr)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    setUsed(result.usedCount ?? 0)
    setDone(true)
    setConfirming(false)
    toast.success('Uso registrado correctamente')
  }

  if (agotado) {
    return (
      <div className="w-full py-3 rounded-2xl bg-error/10 border border-error/20 text-error text-sm font-bold text-center">
        Pase agotado
      </div>
    )
  }

  if (done) {
    return (
      <div className="w-full py-4 rounded-2xl bg-success/10 border border-success/20 flex flex-col items-center gap-1">
        <CheckCircle2 size={28} className="text-success" />
        <p className="text-sm font-bold text-success">Uso registrado</p>
        <p className="text-xs text-text-tertiary">Total usos: {used}</p>
      </div>
    )
  }

  if (confirming) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-center text-text-secondary">¿Confirmar uso del pase?</p>
        <div className="flex gap-3">
          <button
            onClick={() => setConfirming(false)}
            className="flex-1 py-3 rounded-2xl border border-border text-sm font-bold text-text-secondary hover:bg-background-secondary transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleRegister}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl bg-accent text-background-primary text-sm font-bold flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors disabled:opacity-40"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Confirmar
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="w-full py-3 rounded-2xl bg-accent text-background-primary text-sm font-bold flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors"
    >
      <Scissors size={16} /> Registrar uso del pase
    </button>
  )
}
