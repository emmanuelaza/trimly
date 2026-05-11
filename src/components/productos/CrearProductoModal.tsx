'use client';

import { useState, useTransition } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createProduct, updateProduct } from '@/app/actions/productos';

const CATEGORIAS = ['Cuidado del cabello', 'Barba', 'Cuidado de la piel', 'Accesorios', 'Otros'];

interface Product {
  id: string;
  nombre: string;
  categoria: string;
  precio_venta: number;
  precio_costo: number;
  stock: number;
  descripcion?: string;
  activo: boolean;
}

interface CrearProductoModalProps {
  onClose: () => void;
  product?: Product | null;
}

export function CrearProductoModal({ onClose, product }: CrearProductoModalProps) {
  const isEditing = !!product;
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = isEditing
        ? await updateProduct(product.id, formData)
        : await createProduct(formData);

      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEditing ? 'Editar producto' : 'Agregar producto'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">Nombre *</label>
          <Input name="nombre" required defaultValue={product?.nombre} placeholder="Ej: Pomada mate" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">Categoría *</label>
          <select
            name="categoria"
            required
            defaultValue={product?.categoria ?? ''}
            className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
          >
            <option value="" disabled>Seleccionar categoría</option>
            {CATEGORIAS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Precio de venta *</label>
            <Input name="precio_venta" type="number" min="0" step="100" required defaultValue={product?.precio_venta} placeholder="25000" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Precio de costo</label>
            <Input name="precio_costo" type="number" min="0" step="100" defaultValue={product?.precio_costo} placeholder="12000" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">Stock *</label>
          <Input name="stock" type="number" min="0" required defaultValue={product?.stock ?? 0} placeholder="0" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">Descripción</label>
          <textarea
            name="descripcion"
            defaultValue={product?.descripcion ?? ''}
            placeholder="Descripción opcional del producto..."
            rows={2}
            className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent transition-colors resize-none"
          />
        </div>

        <input type="hidden" name="activo" value="true" />

        {error && (
          <p className="text-sm text-danger bg-danger/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" className="flex-1" loading={isPending}>
            {isEditing ? 'Guardar cambios' : 'Agregar producto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
