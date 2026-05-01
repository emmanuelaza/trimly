"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Menu, 
  X, 
  ArrowRight, 
  Play, 
  Calendar, 
  Zap, 
  Bot, 
  BarChart3, 
  UserCheck, 
  Link2, 
  UserPlus, 
  Share2, 
  Sparkles, 
  Check, 
  Star, 
  Scissors, 
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

// --- Subcomponents ---

const DashboardMockup = () => {
  const { elementRef, isVisible } = useScrollReveal();
  const [counts, setCounts] = useState({ revenue: 0, appointments: 0, clients: 0 });

  useEffect(() => {
    if (isVisible) {
      const duration = 2000;
      const steps = 60;
      const interval = duration / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        setCounts({
          revenue: Math.floor(progress * 187000),
          appointments: Math.floor(progress * 8),
          clients: Math.floor(progress * 134)
        });
        if (currentStep === steps) clearInterval(timer);
      }, interval);
      return () => clearInterval(timer);
    }
  }, [isVisible]);

  return (
    <div 
      ref={elementRef}
      className={cn(
        "relative w-full max-w-2xl mx-auto transition-all duration-1000 delay-400 perspective-1000 hidden md:block",
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
      )}
      style={{ transform: isVisible ? "rotateY(-5deg) rotateX(2deg)" : "" }}
    >
      <div className="bg-background-secondary border border-border rounded-xl shadow-2xl shadow-accent/5 overflow-hidden">
        {/* Browser Header */}
        <div className="bg-background-tertiary border-b border-border px-4 py-3 flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          </div>
          <div className="flex-1 bg-background-primary border border-border-strong rounded-md py-1 px-3 text-[10px] text-text-tertiary font-mono">
            app.trimly.co/dashboard
          </div>
        </div>

        <div className="flex h-[400px]">
          {/* Sidebar */}
          <div className="w-40 border-r border-border p-4 space-y-6 hidden lg:block">
            <div className="text-sm font-bold text-text-primary">Trimly</div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={cn("h-7 rounded-md w-full", i === 1 ? "bg-accent-muted" : "bg-background-tertiary/50")} />
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 space-y-6 overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-background-tertiary rounded" />
              <div className="w-8 h-8 rounded-full bg-background-tertiary" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { l: 'Ingresos hoy', v: `$${counts.revenue.toLocaleString()}` },
                { l: 'Citas hoy', v: counts.appointments },
                { l: 'Clientes activos', v: counts.clients }
              ].map((stat, i) => (
                <div key={i} className="bg-background-tertiary border border-border p-3 rounded-lg space-y-1">
                  <div className="text-[8px] uppercase tracking-wider text-text-tertiary font-bold">{stat.l}</div>
                  <div className="text-sm font-bold text-text-primary">{stat.v}</div>
                </div>
              ))}
            </div>

            {/* Calendar Mini View */}
            <div className="bg-background-tertiary border border-border rounded-lg p-4 h-full">
              <div className="flex justify-between mb-4 border-b border-border pb-2">
                {['L', 'M', 'M', 'J', 'V'].map(d => (
                  <div key={d} className="text-[10px] font-bold text-text-tertiary">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-2 h-full">
                {[1, 2, 3, 4, 5].map(col => (
                  <div key={col} className="space-y-2">
                    {[1, 2, 3].map(row => (
                      <div 
                        key={row} 
                        className={cn(
                          "h-10 rounded-md border",
                          Math.random() > 0.5 
                            ? "bg-accent/10 border-accent/20" 
                            : "bg-background-elevated/30 border-transparent"
                        )}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingPageMockup = () => {
  return (
    <div className="relative w-64 mx-auto animate-float">
      <div className="bg-background-secondary border-[8px] border-border-strong rounded-[3rem] overflow-hidden shadow-2xl relative aspect-[9/19]">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-border-strong rounded-b-2xl z-20" />
        
        <div className="p-4 pt-10 space-y-6">
          <div className="text-center space-y-2">
            <Avatar initials="BP" className="mx-auto" />
            <div className="text-sm font-bold text-text-primary">Barbería Don Pedro</div>
          </div>

          <div className="space-y-2">
            <div className="text-[9px] font-black text-text-tertiary uppercase tracking-widest">Servicios</div>
            {[
              { n: 'Corte', p: '25.000' },
              { n: 'Barba', p: '15.000' },
              { n: 'Corte + Barba', p: '35.000' }
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-background-tertiary rounded-xl border border-border">
                <div className="flex items-center gap-2">
                  <div className={cn("w-3.5 h-3.5 rounded-full border border-border-strong flex items-center justify-center", i === 2 && "bg-accent border-accent")}>
                    {i === 2 && <div className="w-1.5 h-1.5 bg-background-primary rounded-full" />}
                  </div>
                  <span className="text-[11px] font-medium text-text-secondary">{s.n}</span>
                </div>
                <span className="text-[11px] font-mono text-text-primary">${s.p}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="text-[9px] font-black text-text-tertiary uppercase tracking-widest">Barbero</div>
            <div className="flex gap-2">
              {['Carlos', 'Andrés'].map((name, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <Avatar initials={name[0]} size="sm" className={i === 0 ? "border-accent ring-2 ring-accent/20" : ""} />
                  <span className="text-[8px] text-text-tertiary font-bold">{name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[9px] font-black text-text-tertiary uppercase tracking-widest">Día</div>
            <div className="flex gap-1">
              {[15, 16, 17, 18, 19].map(d => (
                <div key={d} className={cn("flex-1 h-10 rounded-lg flex flex-col items-center justify-center text-[10px] border", d === 17 ? "bg-accent/20 border-accent/40 text-accent" : "bg-background-tertiary border-border text-text-tertiary")}>
                  <span className="text-[7px] uppercase font-bold">May</span>
                  <span className="font-bold">{d}</span>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full h-11 text-xs font-black uppercase tracking-widest">Confirmar reserva</Button>
        </div>

        {/* Home bar */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-border-strong rounded-full" />
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(-8px); }
          50% { transform: translateY(0); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// --- Main Page ---

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Características', id: '#caracteristicas' },
    { label: 'Cómo funciona', id: '#como-funciona' },
    { label: 'Precios', id: '#precios' },
  ];

  return (
    <div className="min-h-screen bg-background-primary text-text-primary selection:bg-accent selection:text-background-primary overflow-x-hidden font-sans">
      {/* Navbar */}
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 h-16 z-50 transition-all duration-300 px-6 flex items-center justify-between",
          isScrolled ? "bg-background-primary/80 backdrop-blur-md border-b border-border/40" : "bg-transparent"
        )}
      >
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center transition-transform group-hover:rotate-12">
            <Scissors size={18} className="text-background-primary" />
          </div>
          <span className="text-xl font-bold text-text-primary tracking-tight">Trimly</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <button 
              key={link.id} 
              onClick={() => scrollTo(link.id)}
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/auth/register" className="hidden sm:block">
            <Button size="sm">Comenzar gratis</Button>
          </Link>
          <button 
            className="md:hidden text-text-primary p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Panel */}
        <div 
          className={cn(
            "fixed inset-0 top-16 bg-background-primary/95 backdrop-blur-xl z-40 transition-all duration-500 md:hidden flex flex-col p-8 gap-8",
            mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
          )}
        >
          {navLinks.map(link => (
            <button 
              key={link.id} 
              onClick={() => scrollTo(link.id)}
              className="text-2xl font-bold text-text-primary text-left border-b border-border pb-4"
            >
              {link.label}
            </button>
          ))}
          <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
            <Button size="lg" className="w-full h-14 text-lg font-black uppercase">Comenzar gratis</Button>
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section id="hero" className="relative pt-32 pb-20 md:pt-48 md:pb-40 px-6">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[140px] -z-10 translate-x-1/3 -translate-y-1/4" />
          <div className="absolute inset-0 -z-20 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(var(--color-text-tertiary) 0.8px, transparent 0.8px)', backgroundSize: '32px 32px' }} />

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] items-center gap-16 md:gap-24">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <span className="text-base">✂️</span> HECHO PARA BARBERÍAS COLOMBIANAS
              </div>
              
              <h1 className="text-5xl md:text-8xl font-black text-text-primary leading-[1.05] tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                Tu barbería merece trabajar con las <span className="text-accent">mejores herramientas</span>
              </h1>
              
              <p className="text-lg md:text-2xl text-text-secondary max-w-xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                Trimly digitaliza tu barbería en minutos. Agenda online, clientes organizados y automatizaciones que trabajan mientras tú cortas.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                <Link href="/auth/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full h-16 px-10 text-xl font-black group shadow-2xl shadow-accent/20">
                    Empieza gratis hoy <ArrowRight size={22} className="transition-transform group-hover:translate-x-1.5" />
                  </Button>
                </Link>
                <button 
                  onClick={() => scrollTo('#como-funciona')}
                  className="w-full sm:w-auto"
                >
                  <Button variant="secondary" size="lg" className="w-full h-16 px-10 text-xl font-bold">
                    <Play size={20} fill="currentColor" /> Ver demo
                  </Button>
                </button>
              </div>

              <p className="text-sm text-text-tertiary font-bold tracking-wide animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
                🔒 GRATIS PARA SIEMPRE EN EL PLAN BÁSICO · SIN TARJETA DE CRÉDITO
              </p>
            </div>

            <div className="relative">
              <DashboardMockup />
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="bg-background-secondary/30 border-y border-border/40 py-16 px-6">
          <div className="max-w-7xl mx-auto flex flex-col items-center gap-10">
            <p className="text-xs font-black text-text-tertiary uppercase tracking-[0.4em] text-center">
              Barberías en toda Colombia ya confían en Trimly
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8">
              {[
                { n: 'Barbería Don Pedro', w: 'font-black' },
                { n: 'Filo & Estilo', w: 'font-medium' },
                { n: 'El Corte Perfecto', w: 'font-bold' },
                { n: 'Kings Cut', w: 'font-semibold' },
                { n: 'Barbería Medellín', w: 'font-extrabold' }
              ].map((b, i) => {
                const { elementRef, className } = useScrollReveal();
                return (
                  <div 
                    key={b.n} 
                    ref={elementRef}
                    className={cn("text-xl md:text-2xl text-text-secondary/50 transition-colors hover:text-text-primary cursor-default", b.w, className)}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    {b.n}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="caracteristicas" className="py-24 md:py-40 px-6">
          <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-6 max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black text-text-primary tracking-tight">
                Todo lo que tu barbería necesita, en un solo lugar
              </h2>
              <p className="text-xl text-text-secondary leading-relaxed">
                Deja de perder citas, tiempo y dinero. Trimly lo organiza todo por ti.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Calendar className="text-accent" />,
                  title: 'Agenda online 24/7',
                  desc: 'Tus clientes reservan desde su celular a cualquier hora, sin llamarte ni escribirte un solo mensaje.'
                },
                {
                  icon: <Zap className="text-accent" />,
                  title: 'Sin dobles reservas, nunca',
                  desc: 'Los horarios se bloquean en tiempo real cuando alguien agenda. Cero cruces, cero líos.'
                },
                {
                  icon: <Bot className="text-accent" />,
                  title: 'Automatizaciones inteligentes',
                  desc: 'Recordatorios de cita, seguimiento post-visita y felicitaciones de cumpleaños en piloto automático.'
                },
                {
                  icon: <BarChart3 className="text-accent" />,
                  title: 'Reportes que te hablan',
                  desc: 'Sabe cuánto ganaste, qué servicios venden más y qué clientes están dejando de venir antes de perderlos.'
                },
                {
                  icon: <UserCheck className="text-accent" />,
                  title: 'Recupera clientes perdidos',
                  desc: 'Trimly detecta los inactivos y les escribe por WhatsApp automáticamente para traerlos de vuelta.'
                },
                {
                  icon: <Link2 className="text-accent" />,
                  title: 'Tu link de reservas',
                  desc: 'Un link personalizado para Instagram, WhatsApp o donde quieras. Tus clientes agendan solos en segundos.'
                }
              ].map((feat, i) => {
                const { elementRef, className } = useScrollReveal();
                return (
                  <Card 
                    key={feat.title} 
                    ref={elementRef}
                    className={cn("p-10 group hover:border-accent/40 transition-all duration-700 bg-background-secondary/20", className)}
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
                      {feat.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-text-primary mt-8">{feat.title}</h3>
                    <p className="text-text-secondary mt-3 leading-relaxed">{feat.desc}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="como-funciona" className="py-24 md:py-40 px-6 bg-background-secondary/20">
          <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-6">
              <h2 className="text-4xl md:text-6xl font-black text-text-primary tracking-tight">De cero a digitalizado en 3 pasos</h2>
              <p className="text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto">Sin complicaciones técnicas. Sin esperar a nadie. Tú solo.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
              {/* Connector lines (Desktop) */}
              <div className="hidden md:block absolute top-32 left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-border-strong -z-10" />

              {[
                {
                  step: '01',
                  icon: <UserPlus className="text-accent" size={32} />,
                  title: 'Crea tu cuenta',
                  desc: 'Regístrate gratis, agrega tus barberos y configura tus servicios en menos de 5 minutos.'
                },
                {
                  step: '02',
                  icon: <Share2 className="text-accent" size={32} />,
                  title: 'Comparte tu link',
                  desc: 'Copia tu link de reservas personalizado y pégalo en tu Instagram, WhatsApp o story. Listo.'
                },
                {
                  step: '03',
                  icon: <Sparkles className="text-accent" size={32} />,
                  title: 'Trimly hace el resto',
                  desc: 'Tus clientes agendan solos, reciben recordatorios automáticos y tú ves todo en tu agenda en tiempo real.'
                }
              ].map((step, i) => {
                const { elementRef, className } = useScrollReveal();
                return (
                  <div 
                    key={step.step} 
                    ref={elementRef}
                    className={cn("flex flex-col items-center md:items-start text-center md:text-left gap-6 group", className)}
                    style={{ transitionDelay: `${i * 200}ms` }}
                  >
                    <div className="text-8xl font-black text-accent/5 leading-none transition-colors group-hover:text-accent/10">{step.step}</div>
                    <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20 -mt-12 relative z-10 bg-background-primary shadow-xl shadow-accent/5">
                      {step.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-text-primary">{step.title}</h3>
                    <p className="text-text-secondary leading-relaxed max-w-xs">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Feature Spotlight */}
        <section className="py-24 md:py-40 px-6">
          <div className="max-w-7xl mx-auto bg-background-secondary/40 border border-border rounded-[3rem] p-10 md:p-24 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="text-sm font-black text-accent uppercase tracking-[0.3em]">✨ TU PÁGINA PÚBLICA DE RESERVAS</div>
              <h2 className="text-5xl md:text-6xl font-black text-text-primary leading-[1.1]">Tu página de reservas lista en segundos</h2>
              <p className="text-xl text-text-secondary leading-relaxed">
                Cada barbería en Trimly recibe su propia página pública con tu logo, tus servicios, tus precios y tus barberos. Tus clientes escogen, agendan y reciben confirmación automática. Tú solo llegas a cortar.
              </p>
              
              <ul className="space-y-5">
                {[
                  'Link personalizado listo para compartir',
                  'Funciona desde cualquier celular, sin app',
                  'Slots ocupados se bloquean en tiempo real',
                  'Confirmación automática por email al cliente',
                  'Tu barbería visible las 24 horas del día'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-text-primary font-bold text-lg">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <Check size={14} strokeWidth={3} className="text-accent" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/auth/register">
                <Button size="lg" className="h-16 px-10 text-lg font-black uppercase tracking-wider group shadow-xl shadow-accent/20">
                  Crear mi página gratis <ChevronRight size={20} className="transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            <div className="relative flex justify-center">
              <BookingPageMockup />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 md:py-40 px-6 bg-background-secondary/10">
          <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-6 max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black text-text-primary tracking-tight">Los barberos hablan por sí solos</h2>
              <p className="text-xl text-text-secondary leading-relaxed">Más de 50 barberías en Colombia ya organizaron su negocio con Trimly</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  text: '“Antes perdía clientes porque se me olvidaban las citas. Ahora Trimly me recuerda todo automáticamente y mis clientes también reciben su recordatorio. Un cambio total en mi negocio.”',
                  author: 'Carlos M.',
                  shop: 'El Corte Perfecto · Medellín',
                  stars: 5
                },
                {
                  text: '“El link de reservas fue lo mejor que le puse a mi Instagram. Empecé a recibir citas sin tener que contestar un solo WhatsApp. Ahora mis clientes agendan solos y yo me entero en la app.”',
                  author: 'Andrés R.',
                  shop: 'Filo & Estilo · Bogotá',
                  stars: 5
                },
                {
                  text: '“Los reportes me ayudaron a entender qué días son los más ocupados. Ahora organizo mejor mis horarios y gano más sin trabajar más horas. Vale cada peso.”',
                  author: 'Miguel T.',
                  shop: 'Kings Cut · Cali',
                  stars: 5
                }
              ].map((testi, i) => {
                const { elementRef, className } = useScrollReveal();
                return (
                  <Card 
                    key={i} 
                    ref={elementRef}
                    className={cn("p-10 hover:-translate-y-2 transition-all duration-700 bg-background-secondary border-border/60 group shadow-lg", className)}
                    style={{ transitionDelay: `${i * 150}ms` }}
                  >
                    <div className="text-6xl text-accent/15 font-black leading-none mb-6 -ml-3 select-none">“</div>
                    <p className="text-text-primary text-xl leading-relaxed mb-10 font-medium italic">{testi.text}</p>
                    <div className="flex items-center gap-5 border-t border-border pt-8">
                      <Avatar initials={testi.author[0]} isVip className="scale-110" />
                      <div>
                        <div className="flex gap-1 mb-1.5">
                          {[...Array(testi.stars)].map((_, i) => (
                            <Star key={i} size={14} className="fill-warning text-warning" />
                          ))}
                        </div>
                        <p className="text-base font-black text-text-primary">{testi.author}</p>
                        <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">{testi.shop}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="precios" className="py-24 md:py-40 px-6 bg-background-secondary/20">
          <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-6">
              <h2 className="text-4xl md:text-6xl font-black text-text-primary tracking-tight">Planes simples, sin sorpresas</h2>
              <p className="text-xl text-text-secondary leading-relaxed">Empieza gratis. Escala cuando tu barbería lo necesite.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
              {/* Basic Plan */}
              <Card className="p-10 space-y-10 flex flex-col border-border/60 hover:border-accent/20 transition-all duration-500 bg-background-primary/40">
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-text-primary uppercase tracking-widest">Básico</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-text-primary">$29.900</span>
                    <span className="text-lg font-bold text-text-tertiary">/ MES</span>
                  </div>
                  <p className="text-text-secondary text-base leading-relaxed">Para barberías que están empezando a digitalizarse</p>
                </div>

                <div className="space-y-5 flex-1">
                  {[
                    '1 barbero incluido',
                    'Agenda online activa 24/7',
                    'Link de reservas personalizado',
                    'Recordatorios automáticos de cita',
                    'Hasta 100 citas por mes'
                  ].map(item => (
                    <div key={item} className="flex items-center gap-4 text-sm font-bold text-text-secondary">
                      <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <Check size={12} strokeWidth={3} className="text-green-500" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>

                <Link href="/auth/register" className="w-full">
                  <Button variant="secondary" size="lg" className="w-full h-16 text-lg font-black uppercase tracking-widest">Comenzar gratis</Button>
                </Link>
              </Card>

              {/* Pro Plan */}
              <Card className="p-10 space-y-10 flex flex-col border-accent relative shadow-2xl shadow-accent/10 transform scale-[1.05] bg-background-secondary z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-background-primary px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-xl">
                  Más popular
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-text-primary uppercase tracking-widest">Filo Pro</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-text-primary">$79.900</span>
                    <span className="text-lg font-bold text-text-tertiary">/ MES</span>
                  </div>
                  <p className="text-text-secondary text-base leading-relaxed">Para barberías serias que quieren crecer sin límites</p>
                </div>

                <div className="space-y-5 flex-1">
                  <div className="flex items-center gap-4 text-base font-black text-accent mb-6">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <Check size={14} strokeWidth={3} className="text-accent" />
                    </div>
                    Todo lo del plan Básico
                  </div>
                  {[
                    'Barberos ilimitados',
                    'Citas ilimitadas',
                    'Reportes avanzados de ingresos y servicios',
                    'Recuperación automática de clientes inactivos',
                    'Automatizaciones completas (seguimiento, cumpleaños)',
                    'Soporte prioritario en español'
                  ].map(item => (
                    <div key={item} className="flex items-center gap-4 text-sm font-bold text-text-primary">
                      <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Check size={12} strokeWidth={3} className="text-accent" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <Link href="/auth/register" className="w-full">
                    <Button size="lg" className="w-full h-16 text-lg font-black uppercase tracking-widest shadow-xl shadow-accent/20">Comenzar gratis</Button>
                  </Link>
                  <p className="text-[10px] text-text-tertiary text-center font-black uppercase tracking-[0.2em]">Preferido por barberías con 2 o más barberos</p>
                </div>
              </Card>
            </div>

            <div className="flex flex-col items-center gap-4 mt-12">
              <p className="text-sm text-text-tertiary font-bold tracking-widest uppercase">
                🔒 Sin tarjeta de crédito · Cancela cuando quieras · Soporte en español
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-accent py-32 md:py-48 px-6 relative overflow-hidden">
          {/* Decorative scissors */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.08] -z-0">
            <Scissors size={800} className="-rotate-12" />
          </div>

          <div className="max-w-5xl mx-auto text-center space-y-12 relative z-10">
            <h2 className="text-5xl md:text-8xl font-black text-background-primary leading-tight tracking-tight">
              ¿Listo para llevar tu barbería al siguiente nivel?
            </h2>
            <p className="text-xl md:text-3xl text-background-primary/80 font-bold max-w-3xl mx-auto leading-relaxed">
              Únete a las barberías que ya digitalizaron su negocio con Trimly. Configura todo en 5 minutos. Empieza completamente gratis.
            </p>
            <div className="space-y-6">
              <Link href="/auth/register">
                <Button size="lg" className="h-20 px-16 text-2xl font-black bg-background-primary text-accent hover:bg-background-secondary border-none transform hover:scale-105 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all uppercase tracking-widest">
                  Crear mi cuenta gratis <ArrowRight size={28} className="ml-2" />
                </Button>
              </Link>
              <p className="text-xs text-background-primary/50 font-black uppercase tracking-[0.3em] mt-8">
                Sin tarjeta de crédito · Configuración en 5 minutos · Cancela cuando quieras
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="pt-32 pb-16 px-6 border-t border-border/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-20">
            <div className="space-y-8 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
                  <Scissors size={24} className="text-background-primary" />
                </div>
                <span className="text-2xl font-black text-text-primary tracking-tight">Trimly</span>
              </div>
              <p className="text-lg text-text-secondary leading-relaxed max-w-md font-medium">
                La plataforma de gestión para barberías colombianas. Digitaliza tu agenda y crece tu negocio hoy mismo.
              </p>
              <div className="flex gap-5">
                <a href="#" className="w-12 h-12 rounded-2xl bg-background-secondary flex items-center justify-center text-text-secondary hover:text-accent transition-all border border-border hover:border-accent/40 shadow-sm">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="w-12 h-12 rounded-2xl bg-background-secondary flex items-center justify-center text-text-secondary hover:text-accent transition-all border border-border hover:border-accent/40 shadow-sm">
                  <Zap size={22} fill="currentColor" />
                </a>
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="text-xs font-black text-text-primary uppercase tracking-[0.3em]">Legal</h4>
              <ul className="space-y-5">
                <li><Link href="#" className="text-base font-bold text-text-secondary hover:text-text-primary transition-colors">Términos y condiciones</Link></li>
                <li><Link href="#" className="text-base font-bold text-text-secondary hover:text-text-primary transition-colors">Política de privacidad</Link></li>
              </ul>
            </div>
            
            <div className="space-y-8">
              <h4 className="text-xs font-black text-text-primary uppercase tracking-[0.3em]">Producto</h4>
              <ul className="space-y-5">
                <li><button onClick={() => scrollTo('#caracteristicas')} className="text-base font-bold text-text-secondary hover:text-text-primary transition-colors">Características</button></li>
                <li><button onClick={() => scrollTo('#precios')} className="text-base font-bold text-text-secondary hover:text-text-primary transition-colors">Precios</button></li>
                <li><Link href="/auth/register" className="text-base font-bold text-text-secondary hover:text-text-primary transition-colors">Comenzar gratis</Link></li>
                <li><Link href="/login" className="text-base font-bold text-text-secondary hover:text-text-primary transition-colors">Iniciar sesión</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs font-bold text-text-tertiary uppercase tracking-widest">© 2026 TRIMLY. HECHO CON ❤️ EN COLOMBIA</p>
            <p className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.3em]">Trimly.co • Digitalización para barberos</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
