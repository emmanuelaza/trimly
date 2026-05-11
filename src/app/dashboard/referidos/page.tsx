import { Gift } from 'lucide-react';

export const metadata = { title: 'Referidos | Trimly' };

export default function ReferidosPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
        <Gift size={28} className="text-accent" />
      </div>
      <h1 className="text-2xl font-black text-text-primary tracking-tight">Referidos</h1>
      <p className="text-text-secondary text-sm mt-3 max-w-sm leading-relaxed">
        Pronto podrás ganar beneficios invitando a otros dueños de barbería a usar Trimly.
        Esta sección está en desarrollo.
      </p>
      <span className="mt-6 px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full uppercase tracking-wider">
        Próximamente
      </span>
    </div>
  );
}
