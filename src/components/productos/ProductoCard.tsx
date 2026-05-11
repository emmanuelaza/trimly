'use client';

import { ShoppingCart, Edit2, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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

interface ProductoCardProps {
  product: Product;
  onVender: (product: Product) => void;
  onEdit: (product: Product) => void;
}

export function ProductoCard({ product, onVender, onEdit }: ProductoCardProps) {
  const isLowStock = product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  return (
    <div className={`bg-background-secondary border rounded-xl p-4 flex flex-col gap-3 transition-all ${
      !product.activo ? 'opacity-50 border-border' : 'border-border hover:border-accent/40'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text-primary truncate">{product.nombre}</p>
          <p className="text-xs text-text-tertiary mt-0.5">{product.categoria}</p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium shrink-0 ${
          isOutOfStock
            ? 'bg-danger/10 text-danger'
            : isLowStock
            ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
            : 'bg-background-tertiary text-text-secondary'
        }`}>
          <Package size={12} />
          {product.stock}
        </div>
      </div>

      {product.descripcion && (
        <p className="text-xs text-text-tertiary line-clamp-2">{product.descripcion}</p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-lg font-black text-accent">
          ${Number(product.precio_venta).toLocaleString('es-CO')}
        </p>
        {!product.activo && (
          <span className="text-xs text-text-tertiary italic">Inactivo</span>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          variant="primary"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={() => onVender(product)}
          disabled={isOutOfStock || !product.activo}
        >
          <ShoppingCart size={13} />
          Vender
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="gap-1.5"
          onClick={() => onEdit(product)}
        >
          <Edit2 size={13} />
          Editar
        </Button>
      </div>
    </div>
  );
}
