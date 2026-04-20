"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function OnboardingPage() {
  const [paso, setPaso] = useState(1);
  const router = useRouter();

  const handleNext = () => setPaso(p => Math.min(p + 1, 3));
  const handleSkip = () => router.push('/dashboard');
  const handleFinish = () => router.push('/dashboard');

  return (
    <div className="min-h-screen bg-background-primary flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header / Config */}
        <div className="text-center mb-8">
          <p className="text-2xl font-semibold text-text-primary">Bienvenido a Trimly</p>
          <p className="text-sm text-text-secondary mt-1">Configuremos tu barbería en 3 pasos</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((n) => (
            <React.Fragment key={n}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                paso > n  ? 'bg-success text-background-primary' :   
                paso === n ? 'bg-accent text-background-primary' :   
                            'bg-background-tertiary text-text-tertiary'       
              }`}>
                {paso > n ? '✓' : n}
              </div>
              {n < 3 && (
                <div className={`w-12 h-px transition-colors ${
                  paso > n ? 'bg-success' : 'bg-border'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Cards */}
        <div className="relative">
          {paso === 1 && (
            <Card className="animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-semibold text-text-primary mb-1">Añade tu primer servicio</h2>
              <p className="text-sm text-text-secondary mb-5">Empieza con tu servicio más popular.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-text-secondary mb-1.5 block">Nombre del servicio</label>
                  <Input placeholder="Ej. Corte de cabello clásico" autoFocus />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-text-secondary mb-1.5 block">Duración (min)</label>
                    <Input type="number" placeholder="45" />
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary mb-1.5 block">Precio (COP)</label>
                    <Input type="number" placeholder="35000" />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <Button variant="primary" className="flex-1 py-3" onClick={handleNext}>Continuar</Button>
              </div>
            </Card>
          )}

          {paso === 2 && (
            <Card className="animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-semibold text-text-primary mb-1">Horario de atención</h2>
              <p className="text-sm text-text-secondary mb-5">Pre-configuramos un horario base para ti.</p>
              
              <div className="space-y-2">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(dia => (
                  <div key={dia} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background-tertiary/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-5 bg-accent rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 left-5" />
                      </div>
                      <span className="text-sm font-medium text-text-primary">{dia}</span>
                    </div>
                    <div className="text-sm font-mono text-text-secondary">
                      08:00 - 19:00
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background-tertiary/10 opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-5 bg-border-strong rounded-full relative">
                      <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5" />
                    </div>
                    <span className="text-sm font-medium text-text-secondary">Domingo</span>
                  </div>
                  <div className="text-sm text-text-tertiary">
                    Cerrado
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <Button variant="secondary" onClick={() => setPaso(1)}>Atrás</Button>
                <Button variant="primary" className="flex-1 py-3" onClick={handleNext}>Continuar</Button>
              </div>
            </Card>
          )}

          {paso === 3 && (
            <Card className="animate-in fade-in slide-in-from-right-4 text-center py-10">
              <div className="w-16 h-16 bg-success-bg border-4 border-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl text-success">✓</span>
              </div>
              <h2 className="text-2xl font-semibold text-text-primary mb-2">¡Todo listo!</h2>
              <p className="text-sm text-text-secondary mb-8 max-w-sm mx-auto">
                Tu barbería está configurada. Ya puedes empezar a gestionar tus citas y clientes.
              </p>
              
              <Button variant="primary" className="w-full py-3" onClick={handleFinish}>
                Ir al Panel de Control
              </Button>
            </Card>
          )}
        </div>

        <div className="text-center mt-6">
          <button onClick={handleSkip} className="text-sm text-text-tertiary hover:text-text-primary transition-colors">
            Configurar después
          </button>
        </div>

      </div>
    </div>
  );
}
