"use client";

import { useTransition, useState, useRef } from 'react';
import {
  Plus, Trash2, UserCheck, Wallet, Link2, ShieldOff,
  Pencil, Camera, X,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, Input, Button, Badge } from '@/components/ui/RedesignComponents';
import {
  createBarber, deleteBarber, generateBarberTokenAction,
  revokeBarberTokenAction, updateBarberProfile,
} from '@/app/actions/barbers';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { BarberPaymentSchemeModal } from '@/components/nomina/BarberPaymentSchemeModal';
import { usePlan } from '@/hooks/usePlan';
import { MagicLinkModal } from '@/components/equipo/MagicLinkModal';
import { Modal } from '@/components/ui/Modal';
import Image from 'next/image';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const initials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

interface EditState {
  id: string;
  name: string;
  phone: string;
  email: string;
  specialty: string;
  avatar_url: string;
  previewUrl: string;
  file: File | null;
}

export default function BarberosClient({ initialBarberos, services }: { initialBarberos: any[], services: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { features } = usePlan();

  // Existing modals
  const [selectedBarber,   setSelectedBarber]   = useState<any>(null);
  const [isModalOpen,      setIsModalOpen]      = useState(false);
  const [isMagicModalOpen, setIsMagicModalOpen] = useState(false);
  const [generatedLink,    setGeneratedLink]    = useState('');
  const [magicBarberName,  setMagicBarberName]  = useState('');

  // Edit profile modal
  const [editing,       setEditing]       = useState<EditState | null>(null);
  const [uploading,     setUploading]     = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openEdit = (b: any) => {
    setEditing({
      id: b.id,
      name: b.name ?? '',
      phone: b.phone ?? '',
      email: b.email ?? '',
      specialty: b.specialty ?? '',
      avatar_url: b.avatar_url ?? '',
      previewUrl: b.avatar_url ?? '',
      file: null,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    const previewUrl = URL.createObjectURL(file);
    setEditing(prev => prev ? { ...prev, file, previewUrl } : null);
  };

  const handleSaveProfile = () => {
    if (!editing) return;
    startTransition(async () => {
      let avatarUrl = editing.avatar_url;

      if (editing.file) {
        setUploading(true);
        try {
          const supabase = getSupabase();
          const ext = editing.file.name.split('.').pop() ?? 'jpg';
          const filename = `${editing.id}-${Date.now()}.${ext}`;
          const { error: uploadErr } = await supabase.storage
            .from('avatars')
            .upload(filename, editing.file, { upsert: true, contentType: editing.file.type });

          if (uploadErr) throw uploadErr;

          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filename);
          avatarUrl = urlData.publicUrl;
        } catch (err: any) {
          toast.error('Error al subir la foto');
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      const result = await updateBarberProfile(editing.id, {
        name:      editing.name,
        phone:     editing.phone,
        email:     editing.email,
        specialty: editing.specialty,
        avatar_url: avatarUrl || undefined,
      });

      if (result.success) {
        toast.success('Perfil actualizado');
        setEditing(null);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Error al guardar');
      }
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (features.maxBarbers !== -1 && initialBarberos.length >= features.maxBarbers) {
      toast.error(
        `Has alcanzado el límite de ${features.maxBarbers} barbero del plan Básico. Actualiza a Filo Pro para añadir barberos ilimitados.`
      );
      return;
    }
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
    if (!confirm('¿Eliminar a este barbero?')) return;
    startTransition(async () => {
      const result = await deleteBarber(id);
      if (result.success) { toast.success('Barbero eliminado'); router.refresh(); }
      else toast.error(result.error || 'Error al eliminar');
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
    if (!confirm(`¿Revocar el acceso de ${barber.name}?`)) return;
    startTransition(async () => {
      const result = await revokeBarberTokenAction(barber.id);
      if (result.success) { toast.success('Acceso revocado'); router.refresh(); }
      else toast.error('Error al revocar acceso');
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      {/* ── Formulario nuevo barbero ─────────────────────────────── */}
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

      {/* ── Lista de barberos ─────────────────────────────────────── */}
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
            const hasUsed   = activeToken?.last_used_at;

            return (
              <Card key={b.id} className="group hover:border-border-strong transition-all overflow-hidden">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative w-12 h-12 shrink-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-accent-muted flex items-center justify-center">
                          {b.avatar_url ? (
                            <Image
                              src={b.avatar_url}
                              alt={b.name}
                              width={48} height={48}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <span className="text-accent font-bold text-sm">{initials(b.name)}</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-semibold text-text-primary">{b.name}</p>
                          {!activeToken ? (
                            <Badge variant="outline" className="text-[10px] py-0 opacity-50">Sin acceso</Badge>
                          ) : isExpired ? (
                            <Badge variant="danger" className="text-[10px] py-0">Expirado</Badge>
                          ) : !hasUsed ? (
                            <Badge variant="warning" className="text-[10px] py-0">Pendiente</Badge>
                          ) : (
                            <Badge variant="success" className="text-[10px] py-0">Activo</Badge>
                          )}
                        </div>
                        <p className="text-xs text-text-tertiary">
                          {b.specialty
                            ? b.specialty
                            : activeToken && hasUsed
                              ? `Última entrada: ${new Date(activeToken.last_used_at).toLocaleDateString()}`
                              : 'Barbero Profesional'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(b)}
                        className="p-2 text-text-tertiary hover:text-text-primary hover:bg-background-tertiary rounded-xl transition-colors"
                        title="Editar perfil"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => { setSelectedBarber(b); setIsModalOpen(true); }}
                        className="p-2 text-text-tertiary hover:text-accent hover:bg-accent/10 rounded-xl transition-colors"
                        title="Configurar esquema de pago"
                      >
                        <Wallet size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-2 text-text-tertiary hover:text-danger hover:bg-danger-bg rounded-xl transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      {activeToken && !isExpired ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary" size="sm" className="h-8 text-[11px] gap-1.5"
                            onClick={() => {
                              setGeneratedLink(`${window.location.origin}/barber/access/${activeToken.token}`);
                              setMagicBarberName(b.name);
                              setIsMagicModalOpen(true);
                            }}
                          >
                            <Link2 size={12} /> Reenviar Acceso
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            className="h-8 text-[11px] text-danger hover:text-danger hover:bg-danger-bg"
                            onClick={() => handleRevoke(b)}
                          >
                            <ShieldOff size={12} /> Revocar
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="secondary" size="sm" className="h-8 text-[11px] gap-1.5"
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

      {/* ── Edit profile modal ───────────────────────────────────── */}
      {editing && (
        <Modal
          isOpen
          onClose={() => setEditing(null)}
          title="Editar perfil del barbero"
          footer={
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleSaveProfile} loading={isPending || uploading}>
                Guardar cambios
              </Button>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Avatar picker */}
            <div className="flex flex-col items-center gap-3">
              <div
                className="relative w-20 h-20 cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-20 h-20 rounded-full overflow-hidden bg-accent-muted flex items-center justify-center">
                  {editing.previewUrl ? (
                    <Image
                      src={editing.previewUrl}
                      alt="preview"
                      width={80} height={80}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-accent font-bold text-xl">{initials(editing.name || '?')}</span>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={20} className="text-white" />
                </div>
              </div>
              <p className="text-xs text-text-tertiary">Toca para cambiar la foto</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {editing.file && (
                <button
                  onClick={() => setEditing(prev => prev ? { ...prev, file: null, previewUrl: prev.avatar_url } : null)}
                  className="text-xs text-text-tertiary flex items-center gap-1 hover:text-danger transition-colors"
                >
                  <X size={12} /> Quitar foto nueva
                </button>
              )}
            </div>

            {/* Fields */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Nombre *</label>
              <input
                value={editing.name}
                onChange={e => setEditing(prev => prev ? { ...prev, name: e.target.value } : null)}
                className="w-full h-11 px-4 rounded-xl border border-border bg-background-secondary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Especialidad</label>
              <input
                value={editing.specialty}
                onChange={e => setEditing(prev => prev ? { ...prev, specialty: e.target.value } : null)}
                placeholder="Ej. Cortes clásicos, Barbas, Degradados..."
                className="w-full h-11 px-4 rounded-xl border border-border bg-background-secondary text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Teléfono</label>
                <input
                  value={editing.phone}
                  onChange={e => setEditing(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  placeholder="+57 300..."
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background-secondary text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Email</label>
                <input
                  value={editing.email}
                  onChange={e => setEditing(prev => prev ? { ...prev, email: e.target.value } : null)}
                  placeholder="correo@..."
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background-secondary text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {selectedBarber && (
        <BarberPaymentSchemeModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedBarber(null); }}
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
