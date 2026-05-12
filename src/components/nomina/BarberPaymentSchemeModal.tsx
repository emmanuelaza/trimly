"use client";

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button, Input, Card, Badge } from '@/components/ui/RedesignComponents';
import { Wallet, Percent, Calendar, Briefcase, Save, Loader2 } from 'lucide-react';
import { updateBarberPaymentScheme, updateBarberServiceRate } from '@/app/actions/nomina';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  barber: { id: string; name: string };
  initialScheme?: any;
  services: any[];
  initialRates?: any[];
}

export function BarberPaymentSchemeModal({ isOpen, onClose, barber, initialScheme, services, initialRates }: Props) {
  const [type, setType] = useState(initialScheme?.type || 'percentage');
  const [percentage, setPercentage] = useState(initialScheme?.percentage || 50);
  const [fixedAmount, setFixedAmount] = useState(initialScheme?.fixed_amount || 0);
  const [serviceRates, setServiceRates] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialRates) {
      const rates: Record<string, number> = {};
      initialRates.forEach(r => {
        rates[r.service_id] = r.fixed_amount;
      });
      setServiceRates(rates);
    }
  }, [initialRates]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateBarberPaymentScheme(barber.id, type, percentage, fixedAmount);
      
      if (type === 'per_service') {
        const ratePromises = Object.entries(serviceRates).map(([serviceId, amount]) => 
          updateBarberServiceRate(barber.id, serviceId, amount)
        );
        await Promise.all(ratePromises);
      }

      if (result.success) {
        toast.success('Esquema de pago actualizado');
        onClose();
      } else {
        toast.error(result.error || 'Error al actualizar');
      }
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Esquema de Pago: ${barber.name}`}>
      <div className="space-y-6 py-2">
        <p className="text-sm text-text-tertiary">
          Define cómo quieres pagarle a {barber.name}. Este esquema se usará para calcular la liquidación en el módulo de Nómina.
        </p>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => setType('percentage')}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
              type === 'percentage' 
              ? 'border-accent bg-accent/5 ring-1 ring-accent' 
              : 'border-border hover:border-border-strong bg-background-secondary/50'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type === 'percentage' ? 'bg-accent text-background-primary' : 'bg-background-tertiary text-text-tertiary'}`}>
              <Percent size={20} />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-bold ${type === 'percentage' ? 'text-text-primary' : 'text-text-secondary'}`}>Porcentaje por Servicio</p>
              <p className="text-xs text-text-tertiary">El barbero gana un % de cada corte que realiza.</p>
            </div>
            {type === 'percentage' && <Badge variant="success">Seleccionado</Badge>}
          </button>

          <button
            onClick={() => setType('fixed_monthly')}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
              type === 'fixed_monthly' 
              ? 'border-accent bg-accent/5 ring-1 ring-accent' 
              : 'border-border hover:border-border-strong bg-background-secondary/50'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type === 'fixed_monthly' ? 'bg-accent text-background-primary' : 'bg-background-tertiary text-text-tertiary'}`}>
              <Calendar size={20} />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-bold ${type === 'fixed_monthly' ? 'text-text-primary' : 'text-text-secondary'}`}>Nómina Fija Mensual</p>
              <p className="text-xs text-text-tertiary">Un monto fijo mensual sin importar los cortes.</p>
            </div>
            {type === 'fixed_monthly' && <Badge variant="success">Seleccionado</Badge>}
          </button>

          <button
            onClick={() => setType('per_service')}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
              type === 'per_service' 
              ? 'border-accent bg-accent/5 ring-1 ring-accent' 
              : 'border-border hover:border-border-strong bg-background-secondary/50'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type === 'per_service' ? 'bg-accent text-background-primary' : 'bg-background-tertiary text-text-tertiary'}`}>
              <Briefcase size={20} />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-bold ${type === 'per_service' ? 'text-text-primary' : 'text-text-secondary'}`}>Pago Fijo por Servicio</p>
              <p className="text-xs text-text-tertiary">Valor fijo para el barbero según el servicio.</p>
            </div>
            {type === 'per_service' && <Badge variant="success">Seleccionado</Badge>}
          </button>
        </div>

        <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {type === 'percentage' && (
            <div className="space-y-4">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Porcentaje de Comisión</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={percentage} 
                  onChange={(e) => setPercentage(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-background-tertiary rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <div className="w-20 px-3 py-2 bg-background-secondary border border-border rounded-lg text-center font-bold text-accent">
                  {percentage}%
                </div>
              </div>
              <p className="text-[10px] text-text-tertiary italic">Ejemplo: Si un corte vale $30.000, el barbero gana ${((30000 * percentage) / 100).toLocaleString()}.</p>
            </div>
          )}

          {type === 'fixed_monthly' && (
            <div className="space-y-4">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Monto Fijo Mensual (COP)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary font-bold">$</span>
                <Input 
                  type="number" 
                  className="pl-8" 
                  placeholder="0.000" 
                  value={fixedAmount}
                  onChange={(e) => setFixedAmount(Number(e.target.value))}
                />
              </div>
            </div>
          )}

          {type === 'per_service' && (
            <div className="space-y-4">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Tarifas por Servicio</label>
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-background-secondary border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-bold text-text-tertiary uppercase tracking-wider">Servicio</th>
                      <th className="px-4 py-3 font-bold text-text-tertiary uppercase tracking-wider">Precio Cliente</th>
                      <th className="px-4 py-3 font-bold text-text-tertiary uppercase tracking-wider text-right">Pago Barbero</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {services.map(service => (
                      <tr key={service.id} className="hover:bg-background-tertiary/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-text-primary">{service.name}</td>
                        <td className="px-4 py-3 text-text-tertiary">${Number(service.price).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-text-tertiary font-bold">$</span>
                            <input 
                              type="number" 
                              className="w-24 bg-background-primary border border-border rounded-md px-2 py-1 text-right focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                              value={serviceRates[service.id] || 0}
                              onChange={(e) => setServiceRates(prev => ({ ...prev, [service.id]: Number(e.target.value) }))}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-6 border-t border-border">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1 gap-2" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Guardar Esquema
          </Button>
        </div>
      </div>
    </Modal>
  );
}
