"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function StickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4 pb-4 pt-2 bg-gradient-to-t from-background-primary via-background-primary/95 to-transparent">
      <Link
        href="/register"
        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-primary text-background-primary font-bold text-sm tracking-wide shadow-glow"
      >
        Empieza gratis hoy <ArrowRight size={16} />
      </Link>
    </div>
  );
}
