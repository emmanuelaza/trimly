"use client";

import React, { useState, useTransition } from 'react';
import { 
  Card, 
  Button, 
  Badge, 
  StatCard, 
  Input, 
  Avatar 
} from '@/components/ui/RedesignComponents';
import { 
  Wallet, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Download,
  Search,
  Filter,
  ArrowRight,
  Clock,
  ExternalLink
} from 'lucide-react';
import { markAsPaid } from '@/app/actions/nomina';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';

export default function NominaClient({ initialLiquidation, initialHistory, period }: any) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<'liquidacion' | 'historial'>('liquidacion');
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [paymentNote, setPaymentNote] = useState('');

  const totalToPay = initialLiquidation.reduce((sum: number, item: any) => sum + (item.status === 'pending' ? item.amountBarber : 0), 0);
  const totalPaid = initialLiquidation.reduce((sum: number, item: any) => sum + (item.status === 'paid' ? item.amountBarber : 0), 0);
  const bestBarber = [...initialLiquidation].sort((a: any, b: any) => b.amountGenerated - a.amountGenerated)[0];

  const handleMarkAsPaid = async (item: any) => {
    if (!confirm(`¿Confirmar pago de $${item.amountBarber.toLocaleString()} a ${item.barber.name}?`)) return;

    startTransition(async () => {
      const result = await markAsPaid({
        barberId: item.barber.id,
        periodStart: period.start,
        periodEnd: period.end,
        amountGenerated: item.amountGenerated,
        amountBarber: item.amountBarber,
        note: paymentNote
      });

      if (result.success) {
        toast.success('Pago registrado correctamente');
        setIsDetailOpen(false);
        setPaymentNote('');
        router.refresh();
      } else {
        toast.error(result.error || 'Error al registrar pago');
      }
    });
  };

  const exportToCSV = () => {
    const headers = ['Fecha', 'Barbero', 'Monto Pagado', 'Periodo', 'Nota'];
    const rows = initialHistory.map((p: any) => [
      new Date(p.payment_date).toLocaleDateString(),
      p.barber?.name,
      p.amount_barber,
      `${p.period_start} a ${p.period_end}`,
      p.payment_note || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map((e: any) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nomina_trimly_${period.start}_${period.end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Period Selector & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex p-1 bg-background-secondary rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('liquidacion')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'liquidacion' ? 'bg-background-primary shadow-sm text-accent' : 'text-text-tertiary hover:text-text-secondary'}`}
          >
            Liquidación Actual
          </button>
          <button 
            onClick={() => setActiveTab('historial')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'historial' ? 'bg-background-primary shadow-sm text-accent' : 'text-text-tertiary hover:text-text-secondary'}`}
          >
            Historial de Pagos
          </button>
        </div>

        <div className="flex items-center gap-2 bg-background-secondary px-3 py-2 rounded-xl border border-border">
          <Calendar size={16} className="text-text-tertiary" />
          <span className="text-xs font-medium text-text-secondary">{period.start} — {period.end}</span>
          <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 ml-2">Cambiar</Button>
        </div>
      </div>

      {activeTab === 'liquidacion' ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              label="Total a Pagar" 
              value={`$${totalToPay.toLocaleString()}`} 
              icon={Wallet} 
              color="accent"
              trend={{ value: 'Pendiente', isPositive: false }}
            />
            <StatCard 
              label="Ya Pagado" 
              value={`$${totalPaid.toLocaleString()}`} 
              icon={CheckCircle2} 
              color="success"
              trend={{ value: 'Este período', isPositive: true }}
            />
            <StatCard 
              label="Total Generado" 
              value={`$${(totalToPay + totalPaid).toLocaleString()}`} 
              icon={FileText} 
              color="primary"
            />
            <StatCard 
              label="Top Barbero" 
              value={bestBarber?.barber?.name || 'N/A'} 
              icon={ArrowRight} 
              color="warning"
              trend={{ value: `$${(bestBarber?.amountGenerated || 0).toLocaleString()}`, isPositive: true }}
            />
          </div>

          {/* Liquidation Table */}
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-background-secondary border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Barbero</th>
                    <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Esquema</th>
                    <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Citas</th>
                    <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest text-right">Generado</th>
                    <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest text-right">A Pagar</th>
                    <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest text-center">Estado</th>
                    <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {initialLiquidation.map((item: any) => (
                    <tr key={item.barber.id} className="hover:bg-background-tertiary/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar initials={item.barber.name[0]} size="sm" className="bg-accent-muted text-accent" />
                          <span className="text-sm font-semibold text-text-primary">{item.barber.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="capitalize text-[10px]">
                          {item.scheme.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">{item.appointmentsCount} citas</td>
                      <td className="px-6 py-4 text-sm text-text-secondary text-right font-medium">${item.amountGenerated.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-bold text-accent text-right">${item.amountBarber.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        {item.status === 'paid' ? (
                          <Badge variant="success" className="gap-1"><CheckCircle2 size={10} /> Pagado</Badge>
                        ) : (
                          <Badge variant="warning" className="gap-1"><Clock size={10} /> Pendiente</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-[11px]"
                            onClick={() => {
                              setSelectedBarber(item);
                              setIsDetailOpen(true);
                            }}
                          >
                            Ver Detalle
                          </Button>
                          {item.status === 'pending' && (
                            <Button 
                              size="sm" 
                              className="h-8 text-[11px] bg-success hover:bg-success/90"
                              onClick={() => handleMarkAsPaid(item)}
                              disabled={isPending}
                            >
                              Marcar Pagado
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        /* History View */
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">Registro Histórico</h3>
            <Button variant="outline" size="sm" className="gap-2" onClick={exportToCSV}>
              <Download size={14} /> Exportar CSV
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-background-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Fecha Pago</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Barbero</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Monto</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Período</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {initialHistory.map((p: any) => (
                  <tr key={p.id} className="hover:bg-background-tertiary/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-text-secondary">{new Date(p.payment_date).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar initials={p.barber?.name?.[0]} size="xs" className="bg-accent-muted text-accent" />
                        <span className="text-sm font-medium text-text-primary">{p.barber?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-success">${p.amount_barber.toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs text-text-tertiary">{p.period_start} al {p.period_end}</td>
                    <td className="px-6 py-4 text-sm text-text-tertiary italic truncate max-w-[200px]">{p.payment_note || '—'}</td>
                  </tr>
                ))}
                {initialHistory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-text-tertiary italic">No hay registros de pagos realizados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Detail Modal */}
      {selectedBarber && (
        <Modal 
          isOpen={isDetailOpen} 
          onClose={() => setIsDetailOpen(false)} 
          title={`Detalle de Liquidación: ${selectedBarber.barber.name}`}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-background-secondary rounded-xl border border-border">
              <div>
                <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Período Seleccionado</p>
                <p className="text-sm font-bold text-text-primary">{period.start} — {period.end}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Total Barbero</p>
                <p className="text-xl font-black text-accent">${selectedBarber.amountBarber.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Resumen de Citas ({selectedBarber.appointmentsCount})</h4>
              <div className="max-h-[300px] overflow-y-auto border border-border rounded-xl divide-y divide-border">
                {/* Normally we'd fetch specific appointments here, for now using a placeholder or list from data if available */}
                <div className="p-3 text-center text-xs text-text-tertiary italic">
                  Mostrando resumen basado en {selectedBarber.appointmentsCount} servicios realizados.
                </div>
              </div>
            </div>

            {selectedBarber.status === 'pending' && (
              <div className="space-y-3 pt-4 border-t border-border">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Nota del Pago (opcional)</label>
                <Input 
                  placeholder="Ej. Transferencia Nequi, efectivo..." 
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                />
                <Button 
                  className="w-full h-12 bg-success hover:bg-success/90 gap-2" 
                  onClick={() => handleMarkAsPaid(selectedBarber)}
                  disabled={isPending}
                >
                  {isPending ? 'Procesando...' : <><CheckCircle2 size={18} /> Confirmar Pago de ${selectedBarber.amountBarber.toLocaleString()}</>}
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
