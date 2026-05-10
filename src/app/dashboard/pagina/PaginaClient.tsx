"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/RedesignComponents';
import { 
  Copy, 
  ExternalLink, 
  Check, 
  Share2, 
  Smartphone, 
  Globe, 
  MessageCircle,
  Scissors
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaginaClient({ barbershop }: { barbershop: any }) {
  const [copied, setCopied] = useState(false);
  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/book/${barbershop?.slug}` 
    : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("¡Link copiado al portapapeles!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const text = `¡Hola! Ya puedes agendar tu cita online en ${barbershop?.name} aquí: ${publicUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
      <div className="space-y-8">
        {/* Main Link Card */}
        <Card className="p-8 border-accent/20 bg-accent/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-background-primary shadow-lg shadow-accent/20">
                <Globe size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-text-primary">Tu dirección web</h3>
                <p className="text-sm text-text-tertiary">Este es el link que tus clientes usarán para agendar.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 bg-background-primary border border-border rounded-xl px-4 py-3.5 flex items-center justify-between font-mono text-sm text-text-secondary overflow-hidden">
                <span className="truncate">{publicUrl}</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={copyToClipboard}
                  className="h-12 px-6 gap-2 min-w-[140px]"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Copiado' : 'Copiar'}
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => window.open(publicUrl, '_blank')}
                  className="h-12 w-12 p-0 flex items-center justify-center"
                >
                  <ExternalLink size={18} />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Tips & Sharing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500">
              <Share2 size={20} />
            </div>
            <h4 className="font-bold text-text-primary">Bio de Instagram</h4>
            <p className="text-sm text-text-tertiary leading-relaxed">
              Agrega tu link en la biografía de Instagram para que tus seguidores agenden apenas vean tus trabajos.
            </p>
            <Button variant="secondary" size="sm" className="w-full" onClick={copyToClipboard}>
              Copiar para Instagram
            </Button>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
              <MessageCircle size={20} />
            </div>
            <h4 className="font-bold text-text-primary">Estado de WhatsApp</h4>
            <p className="text-sm text-text-tertiary leading-relaxed">
              Comparte el link en tu estado de WhatsApp cada mañana para llenar los huecos libres del día.
            </p>
            <Button variant="secondary" size="sm" className="w-full" onClick={shareOnWhatsApp}>
              Compartir en WhatsApp
            </Button>
          </Card>
        </div>

        {/* Features list */}
        <Card className="p-8">
          <h3 className="text-lg font-black text-text-primary mb-6">Lo que tus clientes verán</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: Smartphone, t: 'Optimizado para móvil', d: 'Funciona perfecto en cualquier celular sin instalar nada.' },
              { icon: Share2, t: 'Fácil de compartir', d: 'Un solo link para todas tus redes sociales.' },
              { icon: Scissors, t: 'Personaliza tu página', d: 'Próximamente: cambia colores y fotos de tu barbería.' },
              { icon: Check, t: 'Confirmación al instante', d: 'Reciben un mensaje de confirmación apenas agendan.' },
            ].map((f, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-background-tertiary flex items-center justify-center text-accent shrink-0">
                  <f.icon size={16} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-text-primary">{f.t}</p>
                  <p className="text-xs text-text-tertiary leading-relaxed">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Preview Card */}
        <div className="sticky top-8">
          <p className="text-xs font-black text-text-tertiary uppercase tracking-widest mb-4">Vista previa rápida</p>
          <div className="relative w-full aspect-[9/19] bg-background-secondary border-[8px] border-border-strong rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-border-strong rounded-b-xl z-20" />
            <div className="p-4 pt-10 space-y-4">
              <div className="w-12 h-12 rounded-full bg-background-tertiary border border-border mx-auto flex items-center justify-center text-xs font-bold text-text-tertiary">
                Logo
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-text-primary">{barbershop?.name}</p>
                <div className="h-2 w-16 bg-accent/20 rounded-full mx-auto" />
              </div>
              <div className="space-y-2 pt-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-10 bg-background-tertiary border border-border rounded-lg" />
                ))}
              </div>
              <div className="h-10 bg-accent/20 rounded-lg mt-4" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background-secondary via-transparent to-transparent opacity-60 pointer-events-none" />
            <div className="absolute bottom-4 left-0 right-0 px-4">
              <Button disabled className="w-full h-10 text-[10px] uppercase font-black tracking-widest opacity-50">Reservar cita</Button>
            </div>
          </div>
          <Button 
            variant="secondary" 
            onClick={() => window.open(publicUrl, '_blank')}
            className="w-full mt-6 gap-2"
          >
            <ExternalLink size={16} />
            Ver página real
          </Button>
        </div>
      </div>
    </div>
  );
}
