'use client';

import { useState, useTransition } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { registerSale } from '@/app/actions/productos';
import { Minus, Plus } from 'lucide-react';

interface Product {
  id: string;
  nombre: string;
  precio_venta: number;
  stock: number;
}

interface Barber {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  client_name: string;
  time: string;
}

interface VentaModalProps {
  onClose: () => void;
  product: Product;
  barbers: Barber[];
  appointments: Appointment[];
}

export function VentaModal({ onClose, product, barbers, appointments }: VentaModalProps) {
  const [cantidad, setCantidad] = useState(1);
  const [barberId, setBarberId] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const total = product.precio_venta * cantidad;

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await registerSale({
        product_id: product.id,
        cantidad,
        precio_unitario: product.precio_venta,
        total,
        barber_id: barberId || undefined,
        appointment_id: appointmentId || undefined,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <Modal isOpen onClose={onClose} title="Registrar venta">
      <div className="space-y-5">
        <div className="bg-background-tertiary rounded-xl p-4">
          <p className="text-xs text-text-tertiary mb-1">Producto</p>
          <p className="font-semibold text-text-primary">{product.nombre}</p>
          <p className="text-lg font-black text-accent mt-1">
            ${Number(product.precio_venta).toLocaleString('es-CO')} c/u
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-2">Cantidad</label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCantidad(c => Math.max(1, c - 1))}
              className="w-10 h-10 rounded-lg bg-background-tertiary border border-border flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="text-2xl font-black text-text-primary w-8 text-center">{cantidad}</span>
            <button
              type="button"
              onClick={() => setCantidad(c => Math.min(product.stock, c + 1))}
              disabled={cantidad >= product.stock}
              className="w-10 h-10 rounded-lg bg-background-tertiary border border-border flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              <Plus size={16} />
            </button>
            <span className="text-xs text-text-tertiary">Stock: {product.stock}</span>
          </div>
        </div>

        {barbers.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Barbero <span className="font-normal text-text-tertiary">(opcional)</span>
            </label>
            <select
              value={barberId}
              onChange={e => setBarberId(e.target.value)}
              className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
            >
              <option value="">Sin asignar</option>
              {barbers.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        {appointments.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Cita de hoy <span className="font-normal text-text-tertiary">(opcional)</span>
            </label>
            <select
              value={appointmentId}
              onChange={e => setAppointmentId(e.target.value)}
              className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
            >
              <option value="">Sin cita asociada</option>
              {appointments.map(a => (
                <option key={a.id} value={a.id}>{a.time} — {a.client_name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-text-secondary">Total a cobrar</span>
          <span className="text-2xl font-black text-accent">${total.toLocaleString('es-CO')}</span>
        </div>

        {error && (
          <p className="text-sm text-danger bg-danger/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" variant="primary" className="flex-1" loading={isPending} onClick={handleSubmit}>
            Confirmar venta
          </Button>
        </div>
      </div>
    </Modal>
  );
}
