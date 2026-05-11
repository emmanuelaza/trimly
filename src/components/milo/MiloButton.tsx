"use client";

import { useState, useEffect } from 'react';
import { MiloPanel } from './MiloPanel';

export function MiloButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const alreadySeen = localStorage.getItem('milo_tooltip_seen');
    if (!alreadySeen) {
      localStorage.setItem('milo_tooltip_seen', '1');
    }
  }, []);

  return (
    <MiloPanel isOpen={open} onClose={() => setOpen(false)} />
  );
}
