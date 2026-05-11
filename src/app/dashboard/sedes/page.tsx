import { Building2 } from 'lucide-react';

export const metadata = { title: 'Sedes | Trimly' };

export default function SedesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
        <Building2 size={28} className="text-accent" />
      </div>
      <h1 className="text-2xl font-black text-text-primary tracking-tight">Sedes</h1>
      <p className="text-text-secondary text-sm mt-3 max-w-sm leading-relaxed">
        Pronto podrás gestionar múltiples locales de tu barbería desde un solo lugar.
        Esta sección está en desarrollo.
      </p>
      <span className="mt-6 px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full uppercase tracking-wider">
        Próximamente
      </span>
    </div>
  );
}
