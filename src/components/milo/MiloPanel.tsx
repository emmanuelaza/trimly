"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, ArrowRight, RotateCcw } from 'lucide-react';
import miloImg from '@/assets/milo.png';
import miloFlow, { MiloNode, MiloOption } from './miloFlow';
import { Button } from '@/components/ui/RedesignComponents';

interface Message {
  id: string;
  type: 'milo' | 'user';
  content: string;
  isSpecial?: boolean;
}

export function MiloPanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [history, setHistory] = useState<Message[]>([
    { id: 'initial', type: 'milo', content: miloFlow.inicio.message }
  ]);
  const [currentNodeId, setCurrentNodeId] = useState<string>('inicio');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentNode = miloFlow[currentNodeId];

  // Scroll to bottom when history changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [history, isTyping]);

  const handleOptionClick = (option: MiloOption) => {
    // 1. Add user message to history
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: option.label
    };
    setHistory(prev => [...prev, userMsg]);

    // Special case for WhatsApp support
    if (option.nextNode === 'whatsapp_support') {
      window.open('https://wa.me/573000000000?text=Hola, tengo una duda sobre Trimly: ', '_blank');
      return;
    }

    // 2. Start typing effect
    setIsTyping(true);

    // 3. Add milo message after delay
    setTimeout(() => {
      const nextNode = miloFlow[option.nextNode];
      if (nextNode) {
        const miloMsg: Message = {
          id: `milo-${Date.now()}`,
          type: 'milo',
          content: nextNode.message
        };
        setHistory(prev => [...prev, miloMsg]);
        setCurrentNodeId(option.nextNode);
      }
      setIsTyping(false);
    }, 600);
  };

  const resetFlow = () => {
    setHistory([{ id: 'initial', type: 'milo', content: miloFlow.inicio.message }]);
    setCurrentNodeId('inicio');
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
            className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-background-secondary border-l border-border shadow-xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-primary-bg shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <Image src={miloImg} alt="Milo" fill className="object-contain" />
                </div>
                <div>
                  <h3 className="font-black text-text-primary text-sm tracking-tight">Milo</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#A8E063] animate-pulse" />
                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">En línea</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={resetFlow}
                  className="p-2 hover:bg-background-tertiary rounded-full text-text-tertiary transition-colors"
                  title="Reiniciar chat"
                >
                  <RotateCcw size={18} />
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-background-tertiary rounded-full text-text-tertiary transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat History */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-none"
            >
              {history.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
                >
                  {msg.type === 'milo' && (
                    <div className="w-7 h-7 rounded-full bg-background-tertiary border border-border flex items-center justify-center shrink-0 mb-1 overflow-hidden">
                      <Image src={miloImg} alt="M" width={22} height={22} className="object-contain" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                      msg.type === 'user'
                        ? 'bg-primary text-text-inverse rounded-tr-none'
                        : 'bg-background-tertiary text-text-primary border border-border rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex justify-start items-end gap-2">
                  <div className="w-7 h-7 rounded-full bg-background-tertiary border border-border flex items-center justify-center shrink-0 mb-1 overflow-hidden">
                    <Image src={miloImg} alt="M" width={22} height={22} className="object-contain" />
                  </div>
                  <div className="bg-background-tertiary border border-border px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-text-muted rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-text-muted rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-text-muted rounded-full" />
                  </div>
                </div>
              )}
            </div>

            {/* Options Area */}
            <div className="p-5 border-t border-border bg-background-secondary shrink-0">
              <div className="flex flex-wrap justify-end gap-2">
                {!isTyping && currentNode.options.map((option, idx) => (
                  <motion.button
                    key={`${currentNodeId}-${idx}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.08 }}
                    onClick={() => handleOptionClick(option)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-2 ${
                      option.isSpecial
                        ? 'bg-[#25D366] text-white border-none hover:shadow-lg hover:shadow-[#25D366]/20'
                        : 'bg-primary-bg text-primary border-primary/20 hover:bg-primary hover:text-text-inverse'
                    }`}
                  >
                    {option.isSpecial && <MessageCircle size={14} />}
                    {option.label}
                    {!option.isSpecial && !option.label.includes('←') && <ArrowRight size={12} />}
                  </motion.button>
                ))}

                {currentNode.isFinal && !isTyping && (
                  <Button 
                    variant="secondary" 
                    className="w-full mt-4 h-11 text-xs font-black uppercase tracking-widest gap-2"
                    onClick={resetFlow}
                  >
                    <RotateCcw size={14} /> Volver al inicio
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
