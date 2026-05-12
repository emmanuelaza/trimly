"use client";

import { useState } from 'react';
import Link from 'next/link';
import {
  Menu, X, ArrowRight, Check, Star, ChevronDown,
  Calendar, Bell, BarChart3, Users, ShoppingBag,
  Clock, DollarSign, SmilePlus, TrendingUp,
  CreditCard, Shield, Ban, Rocket,
  Camera, Tv, MessageCircle, Music2,
  MapPin, Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrimlyLogo } from '@/components/ui/TrimlyLogo';
import { StickyCTA } from '@/components/landing/StickyCTA';

// ─── Inline assets ─────────────────────────────────────────────────────────────

const ColombiaFlag = () => (
  <svg width="18" height="13" viewBox="0 0 18 13" className="rounded-sm flex-shrink-0" aria-label="Bandera Colombia">
    <rect width="18" height="6.5"  fill="#FCD116"/>
    <rect y="6.5" width="18" height="3.25" fill="#003580"/>
    <rect y="9.75" width="18" height="3.25" fill="#CE1126"/>
  </svg>
);

// ─── Data ──────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: '#funciones',   label: 'Funciones' },
  { href: '#beneficios',  label: 'Beneficios' },
  { href: '#testimonios', label: 'Testimonios' },
  { href: '#precios',     label: 'Precios' },
  { href: '#faq',         label: 'FAQ' },
];

const FEATURES = [
  { icon: Calendar,    title: 'Agenda online 24/7',                desc: 'Tus clientes reservan a cualquier hora, desde el link de tu WhatsApp.' },
  { icon: Bell,        title: 'Recordatorios automáticos',          desc: 'Menos ausencias, más clientes que sí llegan.' },
  { icon: BarChart3,   title: 'Reportes claros y simples',          desc: 'Entiende tu negocio y toma mejores decisiones.' },
  { icon: Users,       title: 'Clientes y equipo en un solo lugar', desc: 'Gestiona barberos, comisiones y permisos sin enredos.' },
  { icon: ShoppingBag, title: 'Inventario y productos',             desc: 'Controla tu stock y nunca te quedes sin lo esencial.' },
  { icon: Star,        title: 'Reseñas y fidelización',             desc: 'Convierte cada cliente feliz en tu mejor promotor.' },
];

const BENEFITS = [
  { icon: Clock,      title: 'Ahorra hasta 10 horas por semana' },
  { icon: DollarSign, title: 'Aumenta tus ingresos desde el primer mes' },
  { icon: SmilePlus,  title: 'Clientes más felices y leales a tu barbería' },
  { icon: TrendingUp, title: 'Haz crecer tu barbería de forma profesional' },
];

const BRANDS = [
  'La Esquina Barbería',
  'Don Pedro Barber Shop',
  'Prime Cuts',
  'Black Fade',
  'La 20 Barbería',
];

const TESTIMONIALS = [
  {
    quote: 'Desde que uso Trimly, mis ausencias bajaron un 70% y mis citas aumentaron cada semana. Es como tener un asistente que trabaja 24/7 por mi barbería.',
    name: 'Carlos M.',
    shop: 'Dueño de La Esquina Barbería',
    location: 'Bogotá',
    stars: 5,
    initials: 'CM',
  },
  {
    quote: 'Antes perdía tiempo tomando citas por WhatsApp. Con Trimly todo es automático. Mis clientes reservan solos y yo me concentro en lo que sé hacer: cortar.',
    name: 'Andrés R.',
    shop: 'Filo & Estilo',
    location: 'Bogotá',
    stars: 5,
    initials: 'AR',
  },
  {
    quote: 'Configuré Trimly en 4 minutos y ese mismo día recibí mi primera reserva online. El sistema de recordatorios redujo mis no-shows en un 80%.',
    name: 'Diego V.',
    shop: 'Prime Cuts',
    location: 'Medellín',
    stars: 5,
    initials: 'DV',
  },
  {
    quote: 'Los reportes me ayudan a entender qué servicios son más rentables. Ahora tomo mejores decisiones para mi negocio y mis ingresos aumentaron 35%.',
    name: 'Juan P.',
    shop: 'Black Fade',
    location: 'Cali',
    stars: 5,
    initials: 'JP',
  },
];

const PLANS = [
  {
    id: 'basico',
    name: 'BÁSICO',
    tagline: 'Para barberías que están comenzando.',
    price: '$29.900',
    period: '/mes',
    features: ['Agenda online', '1 barbero', 'Recordatorios básicos', 'Reportes básicos', 'Soporte por WhatsApp'],
    popular: false,
  },
  {
    id: 'pro',
    name: 'PRO',
    badge: 'Más popular',
    tagline: 'Para barberías que quieren crecer.',
    price: '$79.900',
    period: '/mes',
    features: ['Todo lo del plan Básico', 'Barberos ilimitados', 'Recordatorios avanzados', 'Productos y stock', 'Cupones y descuentos', 'Reportes avanzados'],
    popular: true,
  },
  {
    id: 'lifetime',
    name: 'LIFETIME',
    tagline: 'Paga una vez y úsalo para siempre.',
    price: '$559.000',
    period: 'pago único',
    features: ['Todo lo del plan Pro', 'Todas las funciones futuras', 'Sin pagos mensuales', 'Transferible'],
    popular: false,
  },
];

const FAQ_ITEMS = [
  { q: '¿Necesito saber de tecnología para usar Trimly?',   a: 'Para nada. Si sabes usar WhatsApp y Instagram, te sobra. La configuración inicial toma menos de 5 minutos y el sistema funciona solo desde ahí.' },
  { q: '¿Funciona con WhatsApp Business?',                   a: 'Sí. El link de reservas de Trimly funciona desde cualquier dispositivo. Puedes pegarlo en tu perfil de WhatsApp Business, en tu bio de Instagram o donde quieras.' },
  { q: '¿Qué pasa si mi cliente no tiene internet?',         a: 'Siempre puedes agendar la cita tú mismo desde el panel de Trimly. El sistema te permite agregar citas manualmente en segundos.' },
  { q: '¿Puedo cancelar cuando quiera?',                     a: 'Sí, sin contratos ni permanencia. Cancelas desde tu cuenta en cualquier momento. Tus datos quedan disponibles para descargar por 30 días.' },
  { q: '¿Mis datos y los de mis clientes están seguros?',    a: 'Completamente. Trimly usa encriptación estándar de la industria y los datos no se comparten con terceros jamás.' },
];

const SOCIAL_LINKS = [
  { href: '#', label: 'Instagram', Icon: Camera },
  { href: '#', label: 'TikTok',    Icon: Music2 },
  { href: '#', label: 'WhatsApp',  Icon: MessageCircle },
  { href: '#', label: 'YouTube',   Icon: Tv },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-background-secondary hover:bg-background-tertiary transition-colors gap-4"
      >
        <span className="text-sm font-semibold text-text-primary">{q}</span>
        <ChevronDown size={16} className={cn('flex-shrink-0 text-text-muted transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="px-5 py-4 bg-background-secondary border-t border-border">
          <p className="text-sm text-text-secondary leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-background-secondary border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 group">
      <div className="w-12 h-12 rounded-xl bg-primary-bg flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
        <Icon size={22} className="text-primary" />
      </div>
      <h3 className="text-sm font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-xs text-text-muted leading-relaxed">{desc}</p>
    </div>
  );
}

function DashboardMockup() {
  const appointments = [
    { name: 'Carlos M.', time: '10:00', service: 'Corte clásico', status: 'Confirmada' },
    { name: 'Mario G.',  time: '11:30', service: 'Barba',         status: 'Pendiente' },
    { name: 'Juan P.',   time: '13:00', service: 'Corte + Barba', status: 'Completada' },
  ];

  const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
  const days  = ['Lun\n10', 'Mar\n11', 'Mié\n12', 'Jue\n13', 'Vie\n14', 'Sáb\n15', 'Dom\n16'];

  const blocks: { col: number; row: number; color: string }[] = [
    { col: 0, row: 1, color: 'bg-primary/20' },
    { col: 1, row: 1, color: 'bg-success/20' },
    { col: 1, row: 2, color: 'bg-success/15' },
    { col: 2, row: 2, color: 'bg-warning/20' },
    { col: 3, row: 3, color: 'bg-primary/15' },
    { col: 4, row: 1, color: 'bg-success/20' },
    { col: 4, row: 3, color: 'bg-primary/20' },
    { col: 5, row: 4, color: 'bg-warning/15' },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto bg-white border border-border rounded-2xl shadow-lg shadow-black/8 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <TrimlyLogo size={24} textClassName="text-sm" />
        <span className="ml-auto text-sm font-semibold text-text-primary">Hola, Don Pedro</span>
        <div className="w-8 h-8 rounded-full bg-primary-bg flex items-center justify-center text-xs font-bold text-primary">DP</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-px bg-border">
        {[
          { label: 'Ingresos hoy', value: '$187.000', sub: '+12% vs ayer', pos: true },
          { label: 'Citas hoy',    value: '8',        sub: '5 completadas', pos: null },
          { label: 'Clientes nuevos', value: '5',     sub: '+8% vs ayer',  pos: true },
        ].map((s) => (
          <div key={s.label} className="bg-white px-4 py-3">
            <p className="text-[10px] text-text-muted font-medium mb-0.5">{s.label}</p>
            <p className="text-lg font-bold text-text-primary leading-none">{s.value}</p>
            <p className={cn('text-[10px] font-medium mt-0.5', s.pos === true ? 'text-success' : 'text-text-muted')}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Calendar + appointments */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Calendar */}
        <div className="p-4">
          <p className="text-xs font-bold text-text-primary mb-3">Mayo 10 - 16</p>
          <div className="grid grid-cols-[40px_repeat(7,1fr)] gap-0.5 mb-1">
            <div />
            {days.map((d) => (
              <div key={d} className="text-center">
                <p className="text-[9px] text-text-muted font-medium leading-tight whitespace-pre-line">{d}</p>
              </div>
            ))}
          </div>
          <div className="space-y-0.5">
            {hours.map((h, rowIdx) => (
              <div key={h} className="grid grid-cols-[40px_repeat(7,1fr)] gap-0.5 items-center h-6">
                <span className="text-[9px] text-text-muted font-mono text-right pr-1.5">{h}</span>
                {days.map((_, colIdx) => {
                  const block = blocks.find((b) => b.col === colIdx && b.row === rowIdx);
                  return <div key={colIdx} className={cn('h-5 rounded', block ? block.color : '')} />;
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Appointments */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-text-primary">Próximas citas</span>
            <span className="text-[10px] text-primary">Ver todas</span>
          </div>
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div key={apt.name} className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-primary-bg flex items-center justify-center text-[9px] font-bold text-primary flex-shrink-0">
                  {apt.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-text-primary truncate">{apt.name}</p>
                  <p className="text-[10px] text-text-muted truncate">{apt.time} · {apt.service}</p>
                </div>
                <span className={cn(
                  'text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0',
                  apt.status === 'Confirmada' && 'bg-success/10 text-success',
                  apt.status === 'Pendiente'  && 'bg-warning/10 text-warning',
                  apt.status === 'Completada' && 'bg-background-tertiary text-text-muted',
                )}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);


  return (
    <div className="min-h-screen bg-background font-body">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <TrimlyLogo href="/" size={32} textClassName="text-base" />

          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-background-tertiary rounded-lg transition-all">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/registro" className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary-dark transition-all shadow-sm hover:shadow-glow">
              Regístrate gratis
            </Link>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-background-tertiary text-text-secondary">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-1">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-background-tertiary rounded-lg transition-all">
                {l.label}
              </a>
            ))}
            <div className="pt-3 space-y-2 border-t border-border mt-2">
              <Link href="/login" className="block text-center py-2.5 text-sm font-medium text-text-secondary hover:text-primary transition-colors">
                Iniciar sesión
              </Link>
              <Link href="/registro" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 bg-primary text-white text-sm font-bold py-3 rounded-xl hover:bg-primary-dark transition-all">
                Regístrate gratis <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary-bg text-primary text-xs font-semibold px-4 py-2 rounded-full mb-8 border border-primary/20">
          <ColombiaFlag />
          Hecho para barberos que quieren más
        </div>

        <h1 className="text-4xl md:text-6xl font-display font-bold text-text-primary leading-[1.1] tracking-tight mb-6">
          Más reservas.<br />
          Menos ausencias.<br />
          <span className="text-primary">Más ingresos.</span>
        </h1>

        <p className="max-w-xl mx-auto text-base md:text-lg text-text-secondary leading-relaxed mb-8">
          Trimly digitaliza tu barbería en minutos.<br className="hidden md:block" />
          Tus clientes reservan solos, reciben recordatorios automáticos y tú solo llegas a cortar.
        </p>

        <Link href="/registro" className="inline-flex items-center gap-2.5 bg-primary text-white text-base font-bold px-8 py-4 rounded-xl hover:bg-primary-dark transition-all shadow-md hover:shadow-glow">
          Regístrate gratis <Rocket size={18} />
        </Link>

        <p className="mt-4 text-xs text-text-muted flex items-center justify-center gap-3 flex-wrap">
          <span>Prueba gratis</span>
          <span className="w-1 h-1 rounded-full bg-border-strong inline-block" />
          <span>Sin tarjeta</span>
          <span className="w-1 h-1 rounded-full bg-border-strong inline-block" />
          <span>En 2 minutos estás listo</span>
        </p>

        <div className="mt-12 px-0 md:px-4">
          <DashboardMockup />
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <p className="text-center text-xs font-bold text-text-muted uppercase tracking-widest mb-6">
          Barberías que ya crecen con Trimly
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {BRANDS.map((brand) => (
            <div key={brand} className="flex items-center gap-2 text-text-muted hover:text-text-secondary transition-colors">
              <div className="w-6 h-6 rounded-lg bg-background-tertiary border border-border flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary">{brand[0]}</span>
              </div>
              <span className="text-sm font-medium">{brand}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="funciones" className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Todo lo que necesitas</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary tracking-tight">
            Un sistema. Todo bajo control.
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURES.map((f) => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section id="beneficios" className="bg-background-secondary border-y border-border py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Por qué Trimly</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary tracking-tight">
              ¿Qué ganas al usar Trimly?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {BENEFITS.map(({ icon: Icon, title }) => (
              <div key={title} className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl bg-background hover:bg-primary-bg transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-primary-bg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon size={22} className="text-primary" />
                </div>
                <p className="text-sm font-semibold text-text-primary leading-snug">{title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS (infinite scroll carousel) ── */}
      <section id="testimonios" className="py-16 overflow-hidden">
        <div className="text-center mb-10 px-4">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Barberos que ya crecen con Trimly</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary tracking-tight">
            Ellos ya están viendo resultados
          </h2>
        </div>

        {/* Carousel track — duplicated for seamless infinite loop */}
        <div className="relative">
          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <div
            className="flex gap-5"
            style={{ animation: 'scroll-cards 28s linear infinite', width: 'max-content' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.animationPlayState = 'paused'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.animationPlayState = 'running'; }}
          >
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <div
                key={i}
                className="w-[320px] md:w-[380px] flex-shrink-0 bg-background-secondary border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4"
              >
                {/* Stars */}
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={14} className="fill-warning text-warning" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-text-secondary leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <div className="w-9 h-9 rounded-full bg-primary-bg flex items-center justify-center text-xs font-bold text-primary border border-primary/20 flex-shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{t.name}</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs text-primary font-medium">{t.shop}</p>
                      <span className="text-border-strong">·</span>
                      <div className="flex items-center gap-1">
                        <MapPin size={10} className="text-text-muted" />
                        <span className="text-xs text-text-muted">{t.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="precios" className="bg-background-secondary border-y border-border py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary tracking-tight">
              Planes simples y transparentes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {PLANS.map((plan) => (
              <div key={plan.id} className={cn('rounded-2xl p-7 flex flex-col gap-5', plan.popular ? 'bg-white border-2 border-primary shadow-lg shadow-primary/10' : 'bg-white border border-border')}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-text-muted uppercase tracking-widest">{plan.name}</span>
                    {plan.badge && <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{plan.badge}</span>}
                  </div>
                  <p className="text-xs text-text-muted">{plan.tagline}</p>
                </div>

                <div>
                  <span className="text-3xl font-display font-bold text-text-primary">{plan.price}</span>
                  <span className="text-sm text-text-muted ml-1">{plan.period}</span>
                </div>

                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-text-secondary">
                      <Check size={14} className="text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href="/registro" className={cn('flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all', plan.popular ? 'bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-glow' : 'bg-background-tertiary text-text-primary hover:bg-background-4 border border-border')}>
                  Regístrate gratis
                </Link>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-8 mt-10">
            {[
              { Icon: CreditCard, text: 'Sin tarjeta de crédito',       sub: 'No te pediremos tarjeta' },
              { Icon: Shield,     text: 'Prueba gratis',                 sub: 'Con el plan Básico' },
              { Icon: Ban,        text: 'Cancela cuando quieras',        sub: 'Sin permanencias' },
            ].map(({ Icon, text, sub }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-bg flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">{text}</p>
                  <p className="text-xs text-text-muted">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-display font-bold text-text-primary">Preguntas frecuentes</h2>
        </div>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => <FaqItem key={item.q} {...item} />)}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="bg-primary rounded-3xl px-8 py-12 md:py-16 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <img src="/logo_trimly-removebg-preview.png" alt="Trimly" width={56} height={56} className="mx-auto md:mx-0 mb-4" />
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white leading-tight mb-2">
              Tu barbería puede ser<br />la próxima historia de éxito
            </h2>
            <p className="text-primary-light text-sm">Empieza hoy gratis. Sin riesgos. Sin tarjeta.</p>
          </div>
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <Link href="/registro" className="inline-flex items-center gap-2 bg-white text-primary text-sm font-bold px-8 py-4 rounded-xl hover:bg-primary-bg transition-all shadow-md">
              Regístrate gratis <ArrowRight size={16} />
            </Link>
            <p className="text-primary-light text-xs">En 2 minutos estás listo</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border bg-background-secondary">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 mb-10">
            {/* Brand */}
            <div>
              <TrimlyLogo size={32} textClassName="text-base" className="mb-3" />
              <p className="text-sm text-text-muted leading-relaxed max-w-xs">
                El sistema #1 para barberías que quieren crecer.
              </p>
              <div className="flex items-center gap-2.5 mt-5">
                {SOCIAL_LINKS.map(({ href, label, Icon }) => (
                  <a key={label} href={href} aria-label={label} className="w-9 h-9 rounded-xl bg-background-tertiary border border-border flex items-center justify-center hover:bg-primary-bg hover:border-primary/30 hover:text-primary text-text-muted transition-all">
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {[
              { title: 'Producto',  links: [{ label: 'Funciones', href: '#funciones' }, { label: 'Precios', href: '#precios' }, { label: 'Actualizaciones', href: '#' }] },
              { title: 'Recursos',  links: [{ label: 'Blog', href: '#' }, { label: 'Guías', href: '#' }, { label: 'Centro de ayuda', href: '#' }] },
              { title: 'Legal',     links: [{ label: 'Términos', href: '#' }, { label: 'Privacidad', href: '#' }, { label: 'Cookies', href: '#' }] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-xs font-bold text-text-primary uppercase tracking-wider mb-4">{col.title}</p>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className="text-sm text-text-muted hover:text-text-primary transition-colors">{l.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-8 border-t border-border">
            <p className="text-xs text-text-muted">© 2024 Trimly. Todos los derechos reservados.</p>
            <p className="flex items-center gap-1.5 text-xs text-text-muted">
              Hecho en Colombia
              <ColombiaFlag />
              <Heart size={12} className="fill-red-500 text-red-500" />
            </p>
          </div>
        </div>
      </footer>

      <StickyCTA />
    </div>
  );
}
