'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/RedesignComponents';
import { Button } from '@/components/ui/Button';
import { CrearProductoModal } from '@/components/productos/CrearProductoModal';
import { VentaModal } from '@/components/productos/VentaModal';
import { ProductoCard } from '@/components/productos/ProductoCard';
import { Plus } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export function ProductosTabs({ products, sales, barbers, appointments }: any) {
  const [activeTab, setActiveTab] = useState('catalogo');
  const [isCrearModalOpen, setIsCrearModalOpen] = useState(false);
  const [isVenderModalOpen, setIsVenderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [editProductData, setEditProductData] = useState<any>(null);

  const handleVenderClick = (product: any) => {
    setSelectedProduct(product);
    setIsVenderModalOpen(true);
  };

  const handleEditClick = (product: any) => {
    setEditProductData(product);
    setIsCrearModalOpen(true);
  };

  const handleOpenCrearModal = () => {
    setEditProductData(null);
    setIsCrearModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 border-b border-border w-full max-w-sm">
          <button
            onClick={() => setActiveTab('catalogo')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'catalogo'
                ? 'border-accent text-text-primary'
                : 'border-transparent text-text-tertiary hover:text-text-primary'
            }`}
          >
            Catálogo
          </button>
          <button
            onClick={() => setActiveTab('ventas')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'ventas'
                ? 'border-accent text-text-primary'
                : 'border-transparent text-text-tertiary hover:text-text-primary'
            }`}
          >
            Ventas
          </button>
        </div>

        {activeTab === 'catalogo' && (
          <Button onClick={handleOpenCrearModal} className="gap-2">
            <Plus size={16} /> Agregar producto
          </Button>
        )}
      </div>

      {activeTab === 'catalogo' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product: any) => (
            <ProductoCard 
              key={product.id} 
              product={product} 
              onVender={handleVenderClick}
              onEdit={handleEditClick}
            />
          ))}
          {products.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                icon="🛍️"
                title="Sin productos en el catálogo"
                description="Agrega los productos que vendes en tu barbería para gestionarlos aquí."
                action={{ label: 'Agregar primer producto', onClick: handleOpenCrearModal }}
              />
            </div>
          )}
        </div>
      )}

      {activeTab === 'ventas' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-background-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Fecha</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Producto</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Cant.</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Precio U.</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest text-right">Total</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Barbero</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sales.map((sale: any) => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {new Date(sale.created_at).toLocaleDateString()} {new Date(sale.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-text-primary">
                      {sale.products?.nombre}
                      {(sale.appointments as any)?.clients?.name && (
                        <span className="block text-xs text-text-tertiary font-normal mt-0.5">Cita: {(sale.appointments as any).clients.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{sale.cantidad}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">${Number(sale.precio_unitario).toLocaleString('es-CO')}</td>
                    <td className="px-6 py-4 text-sm font-bold text-accent text-right">${Number(sale.total).toLocaleString('es-CO')}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{sale.barbers?.name || '-'}</td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-text-tertiary italic">
                      No hay ventas registradas en este período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {isCrearModalOpen && (
        <CrearProductoModal
          key={editProductData?.id ?? 'new'}
          onClose={() => setIsCrearModalOpen(false)}
          product={editProductData}
        />
      )}

      {isVenderModalOpen && selectedProduct && (
        <VentaModal 
          onClose={() => setIsVenderModalOpen(false)} 
          product={selectedProduct}
          barbers={barbers}
          appointments={appointments}
        />
      )}
    </div>
  );
}
