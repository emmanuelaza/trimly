"use client";
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEP_LABELS = ['Negocio', 'Horarios', 'Barberos', 'Servicios', 'Tu estilo'];

interface Props { current: number; total?: number; onGoTo?: (s: number) => void; }

export function OnboardingProgress({ current, total = 5, onGoTo }: Props) {
  return (
    <>
      {/* Desktop stepper */}
      <div className="hidden sm:flex items-center justify-between mb-10 relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border z-0" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-accent z-0 transition-all duration-700"
          style={{ width: `${((current - 1) / (total - 1)) * 100}%` }}
        />
        {STEP_LABELS.map((label, i) => {
          const step = i + 1;
          const done = current > step;
          const active = current === step;
          return (
            <button
              key={step}
              onClick={() => done && onGoTo?.(step)}
              className={cn(
                "relative z-10 flex flex-col items-center gap-2 group",
                done && "cursor-pointer"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 text-sm font-black transition-all duration-300",
                done  && "bg-accent border-accent text-background-primary",
                active && "bg-accent border-accent text-background-primary shadow-lg shadow-accent/30 scale-110",
                !done && !active && "bg-background-secondary border-border text-text-tertiary"
              )}>
                {done ? <Check size={16} strokeWidth={3} /> : step}
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
                (done || active) ? "text-text-primary" : "text-text-tertiary"
              )}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile: just "Paso X de 5" */}
      <div className="sm:hidden flex items-center justify-between mb-6">
        <span className="text-xs font-black text-text-secondary uppercase tracking-widest">
          Paso {current} de {total}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: total }, (_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i + 1 <= current ? "bg-accent w-5" : "bg-border w-3"
              )}
            />
          ))}
        </div>
      </div>
    </>
  );
}
