"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/RedesignComponents';
import miloImg from '@/assets/milo.png';
import { createClient } from '@/lib/supabase/client';

export function MiloWelcome() {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkMiloState() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data } = await supabase
          .from('milo_state')
          .select('welcome_shown')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!data || !data.welcome_shown) {
          setIsVisible(true);
        }
      }
      setLoading(false);
    }
    checkMiloState();
  }, []);

  const handleClose = async () => {
    setIsVisible(false);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('milo_state').upsert({
        user_id: user.id,
        welcome_shown: true
      });
    }
  };

  if (loading || !isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background-primary/95 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative max-w-md w-full bg-background-secondary border border-border rounded-[32px] p-8 text-center shadow-2xl"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-32 h-32 mx-auto mb-6"
          >
            <Image src={miloImg} alt="Milo" fill className="object-contain" />
          </motion.div>

          <h2 className="text-3xl font-black text-text-primary mb-4">¡Hola, soy Milo! 👋</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-8">
            Soy tu asistente en Trimly. Cuando tengas una duda sobre cómo usar algo, búscame en la esquina inferior derecha. 
            ¡Siempre estoy aquí para ayudarte!
          </p>

          <Button 
            className="w-full h-14 text-base font-bold rounded-2xl shadow-xl shadow-accent/20"
            onClick={handleClose}
          >
            ¡Entendido, empecemos! →
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
