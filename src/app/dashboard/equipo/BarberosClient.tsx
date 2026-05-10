"use client";

import React, { useTransition, useState } from 'react';
import { 
  Plus, 
  Trash2, 
  UserCheck, 
  Wallet, 
  Link2, 
  ShieldAlert, 
  MessageCircle, 
  Copy, 
  Check, 
  ShieldOff 
} from 'lucide-react';
import { Card, Input, Button, Avatar, Badge } from '@/components/ui/RedesignComponents';
import { 
  createBarber, 
  deleteBarber, 
  generateBarberTokenAction, 
  revokeBarberTokenAction 
} from '@/app/actions/barbers';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { BarberPaymentSchemeModal } from '@/components/nomina/BarberPaymentSchemeModal';
import { MagicLinkModal } from '@/components/equipo/MagicLinkModal';

export default function BarberosClient({ initialBarberos, services }: { initialBarberos: any[], services: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMagicModalOpen, setIsMagicModalOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [magicBarberName, setMagicBarberName] = useState('');

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;

    startTransition(async () => {
      const result = await createBarber(formData);
      if (result.success) {
        toast.success('Barbero añadido correctamente');
        form.reset();
        router.refresh();
      } else {
        toast.error(result.error || 'Error al añadir barbero');
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar a este barbero?')) return;
    
    startTransition(async () => {
      const result = await deleteBarber(id);
      if (result.success) {
        toast.success('Barbero eliminado');
        router.refresh();
      } else {
        toast.error(result.error || 'Error al eliminar');
      }
    });
  };

  const handleGenerateToken = async (barber: any) => {
    startTransition(async () => {
      const result = await generateBarberTokenAction(barber.id);
      if (result.success && result.token) {
        const link = `${window.location.origin}/barber/access/${result.token}`;
        setGeneratedLink(link);
        setMagicBarberName(barber.name);
        setIsMagicModalOpen(true);
        toast.success('Acceso generado con éxito');
      } else {
        toast.error('Error al generar el acceso');
      }
    });
  };

  const handleRevoke = async (barber: any) => {
    if (!confirm(`¿Revocar el acceso de ${barber.name}? El link actual dejará de funcionar inmediatamente.`)) return;

    startTransition(async () => {
      const result = await revokeBarberTokenAction(barber.id);
      if (result.success) {
        toast.success('Acceso revocado');
        router.refresh();
      } else {
        toast.error('Error al revocar acceso');
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      {/* Formulario de registro */}
      <div className="lg:col-span-2">
        <Card className="bg-background-secondary/30 border-dashed sticky top-8">
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
            <Plus size={16} /> Registrar nuevo barbero
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Nombre Completo</label>
              <Input name="nombre" placeholder="Ej. Marlon Brando" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Teléfono (opcional)</label>
              <Input name="telefono" placeholder="+57 300..." />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Guardando...' : <><Plus size={18} /> Añadir al Equipo</>}
            </Button>
          </form>
        </Card>
      </div>

      {/* Lista de Barberos */}
      <div className="lg:col-span-3 space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Personal Activo</h2>
          <Badge variant="success">{initialBarberos.length} Miembros</Badge>
        </div>

        <div className="space-y-3">
          {initialBarberos.length === 0 && (
            <div className="py-20 border border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center">
               <UserCheck size={32} className="text-text-tertiary mb-3 opacity-20" />
               <p className="text-sm text-text-secondary">No hay miembros registrados aún.</p>
            </div>
          )}
          {initialBarberos.map((b: any) => {
            const activeToken = b.barber_tokens?.[0];
            const isExpired = activeToken && new Date(activeToken.expires_at) < new Date();
            const hasUsed = activeToken?.last_used_at;

            return (
              <Card key={b.id} className="group hover:border-border-strong transition-all overflow-hidden relative">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar initials={getInitials(b.name)} className="w-12 h-12 bg-accent-muted text-accent" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-semibold text-text-primary">{b.name}</p>
                          {!activeToken ? (
                            <Badge variant="outline" className="text-[10px] py-0 opacity-50">Sin acceso</Badge>
                          ) : isExpired ? (
                            <Badge variant="destructive" className="text-[10px] py-0">Expirado</Badge>
                          ) : !hasUsed ? (
                            <Badge variant="warning" className="text-[10px] py-0">Pendiente</Badge>
                          ) : (
                            <Badge variant="success" className="text-[10px] py-0">Activo</Badge>
                          )}
                        </div>
                        <p className="text-xs text-text-tertiary">
                          {activeToken && hasUsed ? `Última entrada: ${new Date(activeToken.last_used_at).toLocaleDateString()}` : 'Barbero Profesional'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setSelectedBarber(b);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-text-tertiary hover:text-accent hover:bg-accent/10 rounded-xl transition-colors"
                        title="Configurar Esquema de Pago"
                      >
                        <Wallet size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(b.id)}
                        className="p-2 text-text-tertiary hover:text-danger hover:bg-danger-bg rounded-xl transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      {activeToken && !isExpired ? (
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-8 text-[11px] gap-1.5"
                            onClick={() => {
                              setGeneratedLink(`${window.location.origin}/barber/access/${activeToken.token}`);
                              setMagicBarberName(b.name);
                              setIsMagicModalOpen(true);
                            }}
                          >
                            <Link2 size={12} />
                            Reenviar Acceso
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-[11px] text-danger hover:text-danger hover:bg-danger-bg"
                            onClick={() => handleRevoke(b)}
                          >
                            <ShieldOff size={12} />
                            Revocar
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-8 text-[11px] gap-1.5"
                          onClick={() => handleGenerateToken(b)}
                          disabled={isPending}
                        >
                          <Link2 size={12} />
                          {isExpired ? 'Renovar acceso' : 'Generar acceso'}
                        </Button>
                      )}
                    </div>

                    {b.payment_scheme && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Pago:</span>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {b.payment_scheme.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {selectedBarber && (
        <BarberPaymentSchemeModal 
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBarber(null);
          }}
          barber={selectedBarber}
          services={services}
          initialScheme={selectedBarber.barber_payment_schemes?.[0]}
          initialRates={selectedBarber.barber_service_rates}
        />
      )}

      <MagicLinkModal 
        isOpen={isMagicModalOpen}
        onClose={() => setIsMagicModalOpen(false)}
        barberName={magicBarberName}
        accessLink={generatedLink}
      />
    </div>
  );
}
