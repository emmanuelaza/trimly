import { Star } from 'lucide-react';

export const metadata = { title: 'Reseñas | Trimly' };

export default function ResenasPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
        <Star size={28} className="text-accent" />
      </div>
      <h1 className="text-2xl font-black text-text-primary tracking-tight">Reseñas</h1>
      <p className="text-text-secondary text-sm mt-3 max-w-sm leading-relaxed">
        Pronto podrás ver y gestionar las opiniones de tus clientes directamente desde aquí.
        Esta sección está en desarrollo.
      </p>
      <span className="mt-6 px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full uppercase tracking-wider">
        Próximamente
      </span>
    </div>
  );
}
