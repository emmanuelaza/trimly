import Link from 'next/link';
import { Scissors } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background-primary flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
        <Scissors size={28} className="text-accent" />
      </div>
      <h1 className="text-4xl font-black text-text-primary tracking-tight">404</h1>
      <p className="text-lg font-semibold text-text-secondary mt-2">Página no encontrada</p>
      <p className="text-text-tertiary text-sm mt-3 max-w-xs leading-relaxed">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        href="/"
        className="mt-8 px-5 py-2.5 bg-accent text-background-primary text-sm font-semibold rounded-lg hover:bg-accent-hover transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
