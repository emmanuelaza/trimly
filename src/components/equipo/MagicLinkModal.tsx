'use client'

import React, { useState } from 'react'
import { 
  X, 
  ShieldAlert, 
  MessageCircle, 
  Copy, 
  Check, 
  Link2 
} from 'lucide-react'
import { Button } from '@/components/ui/RedesignComponents'
import toast from 'react-hot-toast'

interface MagicLinkModalProps {
  isOpen: boolean
  onClose: () => void
  barberName: string
  accessLink: string
}

export function MagicLinkModal({ isOpen, onClose, barberName, accessLink }: MagicLinkModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(accessLink)
    setCopied(true)
    toast.success('Link copiado al portapapeles')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Hola ${barberName}, te comparto tu acceso a Trimly para que puedas ver tus citas y ganancias 👇\n\n🔗 ${accessLink}\n\n⚠️ Este link es solo para ti, no lo compartas con nadie.`)
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background-primary w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background-secondary/50">
          <div className="flex items-center gap-2 text-accent">
            <Link2 size={20} />
            <h3 className="font-bold text-text-primary">Acceso generado para {barberName}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-background-tertiary rounded-full transition-colors text-text-tertiary">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Aviso de Seguridad */}
          <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <ShieldAlert size={20} className="text-accent" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-text-primary leading-tight">
                ⚠️ Este link es personal e intransferible
              </p>
              <p className="text-[12px] text-text-secondary leading-relaxed">
                Este link le da acceso directo a la cuenta de <span className="font-bold text-text-primary">{barberName}</span> en tu barbería. Compártelo ÚNICAMENTE con él y dile que no lo reenvíe a nadie más.
              </p>
            </div>
          </div>

          {/* Link Box */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Link de acceso</p>
            <div className="bg-background-tertiary rounded-2xl p-3 flex items-center justify-between gap-3 border border-border/50">
              <p className="text-xs text-text-secondary truncate font-mono">
                {accessLink.split('/access/')[0]}/access/{accessLink.split('/access/')[1]?.substring(0, 8)}...
              </p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-8 text-[11px] font-bold gap-1.5 shrink-0"
                onClick={handleCopy}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3">
            <Button 
              className="bg-[#25D366] hover:bg-[#22c35e] text-white h-12 rounded-2xl font-bold gap-2 w-full"
              onClick={handleWhatsApp}
            >
              <MessageCircle size={20} />
              Enviar por WhatsApp
            </Button>
            <Button 
              variant="secondary" 
              className="h-12 rounded-2xl font-bold gap-2 w-full border-border-strong"
              onClick={handleCopy}
            >
              <Copy size={18} />
              Copiar link completo
            </Button>
          </div>

          <div className="space-y-1 text-center">
            <p className="text-[10px] text-text-tertiary">
              Este acceso expira en 7 días · Puedes revocarlo en cualquier momento
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
