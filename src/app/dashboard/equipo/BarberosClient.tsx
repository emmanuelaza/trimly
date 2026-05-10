"use client";

import React, { useTransition, useState } from 'react';
import { Plus, Trash2, UserCheck, Wallet, Share2, MessageCircle, Copy, Check } from 'lucide-react';
import { Card, Input, Button, Avatar, Badge } from '@/components/ui/RedesignComponents';
import { createBarber, deleteBarber, generateInvitationLink } from '@/app/actions/barbers';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { BarberPaymentSchemeModal } from '@/components/nomina/BarberPaymentSchemeModal';

export default function BarberosClient({ initialBarberos, services }: { initialBarberos: any[], services: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleInvite = async (id: string) => {
    const result = await generateInvitationLink(id);
    if (result.success) {
      toast.success('Link de invitación generado');
      router.refresh();
    } else {
      toast.error('Error al generar invitación');
    }
  };

  const copyToClipboard = (code: string, id: string) => {
    const link = `https://trimlyapp-phi.vercel.app/invite/${code}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast.success('Link copiado al portapapeles');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendWhatsApp = (barber: any) => {
    const link = `https://trimlyapp-phi.vercel.app/invite/${barber.invitation_code}`;
    const message = encodeURIComponent(`Hola ${barber.name}, te invito a Trimly para que puedas ver tus citas y ganancias desde tu celular. Regístrate aquí: ${link}`);
    window.open(`https://wa.me/${barber.phone?.replace(/\+/g, '')}?text=${message}`, '_blank');
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
          {initialBarberos.map((b: any) => (
            <Card key={b.id} className="group hover:border-border-strong transition-all overflow-hidden relative">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar initials={getInitials(b.name)} className="w-12 h-12 bg-accent-muted text-accent" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-semibold text-text-primary">{b.name}</p>
                        {b.invitation_status === 'accepted' ? (
                          <Badge variant="success" className="text-[10px] py-0">Activo</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] py-0 opacity-50">Sin registrar</Badge>
                        )}
                      </div>
                      <p className="text-xs text-text-tertiary">Barbero Profesional</p>
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
                    {b.invitation_code ? (
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-8 text-[11px] gap-1.5"
                          onClick={() => copyToClipboard(b.invitation_code, b.id)}
                        >
                          {copiedId === b.id ? <Check size={12} /> : <Copy size={12} />}
                          Copiar Link
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-8 text-[11px] gap-1.5 text-success hover:text-success"
                          onClick={() => sendWhatsApp(b)}
                        >
                          <MessageCircle size={12} />
                          WhatsApp
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="h-8 text-[11px] gap-1.5"
                        onClick={() => handleInvite(b.id)}
                      >
                        <Share2 size={12} />
                        Invitar a Trimly
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
          ))}
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
    </div>
  );
}
