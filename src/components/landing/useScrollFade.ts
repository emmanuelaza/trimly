import { useEffect, useState, type RefObject } from 'react';

/**
 * Fade-in muy sutil al entrar en pantalla — solo opacidad, sin movimiento.
 * Respeta prefers-reduced-motion (queda visible sin transición).
 */
export function useScrollFadeVisible(ref: RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return `transition-opacity duration-700 ease-out motion-reduce:transition-none motion-reduce:!opacity-100 ${
    visible ? 'opacity-100' : 'opacity-0'
  }`;
}
