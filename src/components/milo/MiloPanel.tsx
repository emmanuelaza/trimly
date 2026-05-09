"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, MessageCircle, ArrowRight, ExternalLink } from 'lucide-react';
import miloImg from '@/assets/milo.png';

const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', color: '#A8E063' },
  { id: 'agenda', label: 'Agenda', icon: '📅', color: '#A8E063' },
  { id: 'clientes', label: 'Clientes', icon: '👥', color: '#A8E063' },
  { id: 'nomina', label: 'Nómina', icon: '💰', color: '#A8E063' },
  { id: 'servicios', label: 'Servicios', icon: '⚙️', color: '#A8E063' },
  { id: 'pagina', label: 'Mi página', icon: '🔗', color: '#A8E063' },
];

const CONTENT: Record<string, string[]> = {
  dashboard: [
    "El Dashboard es tu pantalla de inicio. Acá ves de un vistazo todo lo importante del día 📊",
    "Las tarjetas de arriba te muestran: \n💰 Cuánto llevas ganado hoy\n📅 Cuántas citas tienes\n👥 Cuántos clientes activos tienes",
    "Más abajo ves tu agenda del día con todas las citas organizadas por hora.",
    "Es lo primero que vas a ver cada mañana cuando abras Trimly. ¡Empieza siempre por acá!"
  ],
  agenda: [
    "La Agenda es donde viven todas tus citas 📅",
    "Puedes verla por día, semana o mes. Cada cita muestra el nombre del cliente, el servicio y el barbero asignado.",
    "Cuando un cliente reserva desde tu link público, la cita aparece acá automáticamente y el horario queda bloqueado para que nadie más lo tome.",
    "También puedes crear citas manualmente tocando cualquier espacio libre en el calendario.",
    "¿Quieres saber cómo compartir tu link de reservas?"
  ],
  clientes: [
    "En Clientes tienes toda la información de las personas que visitan tu barbería 👥",
    "Para cada cliente puedes ver:\n📋 Cuántas veces ha venido\n📅 Cuándo fue su última visita\n💇 Qué servicios pide normalmente",
    "Trimly detecta automáticamente los clientes que llevan mucho tiempo sin venir y puede escribirles un mensaje para traerlos de vuelta.",
    "¡Eso es plata que estaba perdida y Trimly la recupera por ti!"
  ],
  nomina: [
    "La Nómina es donde conrolas lo que le pagas a cada barbero 💰",
    "Cada barbero puede tener un esquema diferente:\n📊 Porcentaje — gana % de cada corte que hace\n📋 Nómina fija — recibe lo mismo cada mes\n🔧 Por servicio — un valor fijo por cada corte",
    "Al final del período ves exactamente cuánto le debes a cada uno.",
    "Cuando le pagues, marcas el pago como hecho y queda el registro guardado para siempre.",
    "¡Nunca más calculando en papel!"
  ],
  servicios: [
    "En Servicios configuras todo lo que ofrece tu barbería ✂️",
    "Para cada servicio defines:\n📝 El nombre (Corte, Barba, Corte + Barba...)\n⏱️ El tiempo que dura\n💰 El precio",
    "Estos servicios son los que van a ver tus clientes cuando entren a tu página pública para reservar su cita.",
    "Puedes agregar los que quieras y editarlos cuando cambies los precios."
  ],
  pagina: [
    "Tu página pública es la dirección que compartes con tus clientes para que reserven solos 🔗",
    "Se ve así:\ntrimlyapp-phi.vercel.app/[tu-barbería]",
    "Tus clientes entran, escogen el servicio, el barbero y la hora — y listo. Tú no tienes que contestar nada.",
    "Puedes compartir este link en:\n📱 Tu estado de WhatsApp\n📸 Tu bio de Instagram\n💬 En el grupo de tus clientes",
    "Cópialo y empieza a compartirlo hoy mismo 🚀"
  ]
};

export function MiloPanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [view, setView] = useState<'home' | 'detail'>('home');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const handleSectionClick = (id: string) => {
    setSelectedSection(id);
    setView('detail');
  };

  const handleBack = () => {
    setView('home');
    setSelectedSection(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[380px] bg-background-primary border-l border-border shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                  <Image src={miloImg} alt="Milo" fill className="object-contain" />
                </div>
                <div>
                  <h3 className="font-black text-text-primary">Milo</h3>
                  <p className="text-xs text-text-tertiary">Tu guía en Trimly</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-background-tertiary rounded-full text-text-tertiary transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {view === 'home' ? (
                <div className="space-y-8">
                  {/* Greeting Bubble */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-background-tertiary border border-border flex items-center justify-center shrink-0">
                      <Image src={miloImg} alt="Milo" width={20} height={20} />
                    </div>
                    <div className="bg-background-secondary border border-border rounded-2xl rounded-tl-none p-4 shadow-sm">
                      <p className="text-sm text-text-primary leading-relaxed">
                        ¡Hola! Soy Milo, tu asistente en Trimly 👋<br/><br/>
                        Estoy aquí para explicarte cada parte del sistema para que lo aproveches al máximo.<br/><br/>
                        ¿Por dónde quieres empezar?
                      </p>
                    </div>
                  </div>

                  {/* Options Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {SECTIONS.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => handleSectionClick(section.id)}
                        className="flex flex-col items-center justify-center p-4 bg-background-secondary border border-border rounded-2xl hover:border-[#A8E063] hover:shadow-lg hover:shadow-[#A8E063]/5 transition-all group"
                      >
                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{section.icon}</span>
                        <span className="text-xs font-bold text-text-secondary">{section.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <button 
                    onClick={handleBack}
                    className="flex items-center gap-2 text-xs font-bold text-accent hover:underline mb-4"
                  >
                    <ChevronLeft size={14} /> Volver al inicio
                  </button>

                  <div className="space-y-4">
                    {CONTENT[selectedSection!]?.map((text, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-background-tertiary border border-border flex items-center justify-center shrink-0 mt-1">
                          <Image src={miloImg} alt="Milo" width={20} height={20} />
                        </div>
                        <div className="bg-background-secondary border border-border rounded-2xl rounded-tl-none p-4 shadow-sm">
                          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                            {text}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="pt-8 space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-between h-12 text-xs font-bold border-dashed"
                      onClick={handleBack}
                    >
                      ¿Tienes otra duda? <ArrowRight size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-background-secondary/30">
              <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-3 text-center">¿No encontraste lo que buscabas?</p>
              <Button 
                variant="outline" 
                className="w-full gap-2 border-[#A8E063]/30 text-text-primary hover:bg-[#A8E063]/5 hover:border-[#A8E063]"
                onClick={() => window.open('https://wa.me/573000000000?text=Hola, tengo una duda sobre Trimly: ', '_blank')}
              >
                <MessageCircle size={18} className="text-[#A8E063]" />
                Escríbenos por WhatsApp
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
