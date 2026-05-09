"use client";

import React from 'react';
import Image from 'next/image';
import miloImg from '@/assets/milo.png';

export function MiloTooltip({ text, children }: { text: string, children: React.ReactNode }) {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex items-center gap-2 bg-[#1A1A2E] text-white text-[10px] font-bold px-3 py-2 rounded-xl shadow-xl border border-[#A8E063]/30 whitespace-nowrap z-50">
        <div className="relative w-4 h-4 shrink-0">
          <Image src={miloImg} alt="Milo" fill className="object-contain" />
        </div>
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1A1A2E] rotate-45 border-r border-b border-[#A8E063]/30" />
      </div>
    </div>
  );
}
