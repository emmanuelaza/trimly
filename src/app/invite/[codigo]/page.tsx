"use client";

import React, { useState, useTransition, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBarberByCode } from '@/app/actions/barbers';
import { Card, Button, Input } from '@/components/ui/RedesignComponents';
import { Scissors, Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function BarberInvitePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.codigo as string;
  
  const [barber, setBarber] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    async function fetchBarber() {
      const data = await getBarberByCode(code);
      if (data) {
        setBarber(data);
        setFormData(prev => ({ ...prev, name: data.name }));
      }
      setLoading(false);
    }
    fetchBarber();
  }, [code]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      
      // 1. Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: 'barber',
            barbershop_id: barber.barbershop_id
          }
        }
      });

      if (authError) {
        toast.error(authError.message);
        return;
      }

      // 2. Link barber record to the new user and mark as accepted
      const { error: updateError } = await supabase
        .from('barbers')
        .update({
          user_id: authData.user?.id,
          invitation_status: 'accepted',
          email: formData.email
        })
        .eq('id', barber.id);

      if (updateError) {
        toast.error('Error al vincular cuenta: ' + updateError.message);
        return;
      }

      toast.success('¡Cuenta creada correctamente!');
      router.push('/barber/dashboard');
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center p-6">
        <Loader2 size={40} className="text-accent animate-spin" />
      </div>
    );
  }

  if (!barber) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center space-y-6 py-12 border-dashed">
          <div className="w-16 h-16 bg-danger-bg text-danger rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-text-primary">Invitación Inválida</h1>
            <p className="text-sm text-text-tertiary">Este link no es válido o ya fue usado. Pídele a tu dueño que te envíe uno nuevo.</p>
          </div>
          <Button variant="outline" className="w-full" onClick={() => router.push('/')}>Volver al Inicio</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-accent/20">
            <Scissors size={32} className="text-background-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-primary tracking-tight">Te han invitado a Trimly</h1>
            <p className="text-sm text-text-tertiary mt-2">
              Crea tu cuenta para {barber.barbershops.name} y empieza a ver tus citas en tiempo real.
            </p>
          </div>
        </div>

        <Card className="p-8 shadow-2xl shadow-accent/5 border-border/50">
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Nombre Completo</label>
              <Input 
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Tu nombre"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Correo Electrónico</label>
              <Input 
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Contraseña</label>
              <Input 
                type="password"
                value={formData.password}
                onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Mínimo 8 caracteres"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Confirmar Contraseña</label>
              <Input 
                type="password"
                value={formData.confirmPassword}
                onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Repite tu contraseña"
                required
              />
            </div>

            <Button type="submit" className="w-full h-12 text-sm font-bold gap-2 group" disabled={isPending}>
              {isPending ? <Loader2 size={18} className="animate-spin" /> : (
                <>
                  Crear mi cuenta 
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-text-tertiary">
          ¿Ya tienes una cuenta? <a href="/login" className="text-accent font-bold hover:underline">Inicia sesión</a>
        </p>
      </div>
    </div>
  );
}
