'use client'

import { useState } from 'react'
import { Search, ExternalLink } from 'lucide-react'

interface Props {
  onScan?: (code: string) => void
}

export function ScannerQR({ onScan }: Props) {
  const [code, setCode] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    if (onScan) {
      onScan(trimmed)
    } else {
      window.open(`/pase/${trimmed}`, '_blank')
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-text-tertiary">
        Ingresa el código del pase manualmente o pide al cliente que muestre su carnet digital.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="PS-XXXXXX-XXXX"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-background-secondary text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 uppercase tracking-widest"
          />
        </div>
        <button
          type="submit"
          disabled={!code.trim()}
          className="h-10 px-4 rounded-xl bg-accent text-background-primary font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 hover:bg-accent/90 transition-colors"
        >
          <ExternalLink size={13} /> Abrir
        </button>
      </form>
    </div>
  )
}
