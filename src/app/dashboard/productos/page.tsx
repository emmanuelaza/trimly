import { getProducts, getSales, getBarbersActive, getAppointmentsToday } from '@/app/actions/productos';
import { Card, StatCard } from '@/components/ui/RedesignComponents';
import { ShoppingBag, TrendingUp, AlertCircle } from 'lucide-react';
import { ProductosTabs } from './ProductosTabs';
import { getBarbershopId } from '@/lib/getBarbershopId';

export const metadata = {
  title: 'Productos | Trimly',
};

export default async function ProductosPage() {
  const barbershopId = await getBarbershopId();
  if (!barbershopId) return null;

  const [products, sales, barbers, appointments] = await Promise.all([
    getProducts(),
    getSales('hoy'),
    getBarbersActive(),
    getAppointmentsToday()
  ]);

  // Calcular métricas
  const ingresosHoy = sales.reduce((acc: number, sale: any) => acc + Number(sale.total), 0);

  // Producto más vendido
  const salesByProduct = sales.reduce((acc: any, sale: any) => {
    acc[sale.product_id] = (acc[sale.product_id] || 0) + sale.cantidad;
    return acc;
  }, {});
  
  let mostSoldId = null;
  let maxSold = 0;
  for (const [id, cant] of Object.entries(salesByProduct)) {
    if ((cant as number) > maxSold) {
      maxSold = cant as number;
      mostSoldId = id;
    }
  }
  const mostSoldProduct = mostSoldId ? products.find((p: any) => p.id === mostSoldId) : null;
  const mostSoldText = mostSoldProduct ? `${(mostSoldProduct as any).nombre} (${maxSold})` : 'Ninguno hoy';

  // Productos con stock bajo (<= 5)
  const lowStockCount = products.filter((p: any) => p.activo && p.stock <= 5).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text-primary">Productos</h1>
          <p className="text-text-tertiary mt-1">Controla tu inventario y registra ventas</p>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          label="Ingresos por productos hoy" 
          value={`$${ingresosHoy.toLocaleString('es-CO')}`} 
          icon={ShoppingBag} 
          color="accent" 
        />
        <StatCard 
          label="Producto más vendido" 
          value={mostSoldText} 
          icon={TrendingUp} 
          color="success" 
        />
        <StatCard 
          label="Productos con stock bajo" 
          value={lowStockCount.toString()} 
          icon={AlertCircle} 
          color={lowStockCount > 0 ? "danger" : "neutral"} 
        />
      </div>

      <ProductosTabs 
        products={products} 
        sales={sales} 
        barbers={barbers}
        appointments={appointments}
      />
    </div>
  );
}
