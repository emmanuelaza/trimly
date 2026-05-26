'use client';

import { useRef } from 'react';
import { Download } from 'lucide-react';

interface Props {
  barbershopName: string;
  plan: string;
  licenseNumber: string | null;
  activatedAt: string | null;
}

export function Certificado({ barbershopName, plan, licenseNumber, activatedAt }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: '#0A0A0F' });
    const link = document.createElement('a');
    link.download = `Licencia-Trimly-${barbershopName.replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const activationDate = activatedAt
    ? new Date(activatedAt).toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
        Certificado de licencia
      </p>

      <div
        ref={cardRef}
        className="rounded-2xl p-8 text-center"
        style={{
          background: 'linear-gradient(135deg, #0A0A0F 0%, #12121A 100%)',
          border: '1px solid rgba(var(--color-primary-rgb, 139, 92, 246), 0.4)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-icon.png" alt="Trimly" className="w-12 h-12 mx-auto mb-4" />

        <p className="text-xs tracking-widest text-gray-400 uppercase mb-4">
          Licencia oficial
        </p>

        <p className="text-2xl font-black text-white mb-2">{barbershopName}</p>

        {licenseNumber && (
          <p className="font-mono text-primary text-base font-bold mb-3">{licenseNumber}</p>
        )}

        <span
          className={`inline-block text-xs font-bold px-4 py-1.5 rounded-full mb-4 ${
            plan === 'pro'
              ? 'bg-primary/20 text-primary border border-primary/30'
              : 'bg-gray-700/50 text-gray-300 border border-gray-600/30'
          }`}
        >
          {plan === 'pro' ? 'Licencia Pro' : 'Licencia Básica'}
        </span>

        {activationDate && (
          <p className="text-xs text-gray-500 mt-2">Activada el {activationDate}</p>
        )}

        <p className="text-xs text-gray-600 mt-1">Válida de por vida</p>

        <p className="text-[10px] text-gray-600 mt-6">Trimly · Colombia 🇨🇴</p>
      </div>

      <button
        onClick={handleDownload}
        className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        <Download size={14} />
        Descargar certificado
      </button>
    </div>
  );
}
