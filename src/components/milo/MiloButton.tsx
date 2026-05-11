"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import miloImg from '@/assets/milo.png';
import { MiloPanel } from './MiloPanel';

export function MiloButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="bg-[#1A1A2E] text-white text-[11px] font-medium px-4 py-2 rounded-2xl shadow-xl border border-[#A8E063]/30 relative mr-2"
            >
              ¿Necesitas ayuda? Soy Milo 👋
              <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-[#1A1A2E] rotate-45 border-r border-b border-[#A8E063]/30" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => {
            setIsOpen(true);
            setHasNewMessage(false);
            setShowTooltip(false);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            y: [0, -6, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative w-16 h-16 rounded-full bg-[#1A1A2E] border-2 border-[#A8E063] shadow-lg shadow-[#A8E063]/20 flex items-center justify-center overflow-hidden"
        >
          <div className="relative w-12 h-12">
            <Image 
              src={miloImg} 
              alt="Milo" 
              fill
              className="object-contain"
            />
          </div>
          
          {hasNewMessage && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#1A1A2E] shadow-lg">
              ?
            </span>
          )}
        </motion.button>
      </div>

      <MiloPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
