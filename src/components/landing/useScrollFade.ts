import { useEffect, useState, type RefObject } from 'react';

export type RevealDirection = 'up' | 'left' | 'right' | 'scale';

const HIDDEN_TRANSFORM: Record<RevealDirection, string> = {
  up: 'opacity-0 translate-y-6',
  left: 'opacity-0 -translate-x-8',
  right: 'opacity-0 translate-x-8',
  scale: 'opacity-0 scale-95',
};

/**
 * Animación de entrada sutil al hacer scroll — cada sección elige la
 * dirección que mejor calce con su forma (una fila horizontal entra desde
 * el lado, una tarjeta centrada crece, una lista vertical sube). Siempre
 * discreta: poco desplazamiento, sin rebote. Respeta prefers-reduced-motion.
 */
export function useScrollReveal(
  ref: RefObject<HTMLElement | null>,
  direction: RevealDirection = 'up'
) {
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

  const base =
    'transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:!opacity-100 motion-reduce:!translate-x-0 motion-reduce:!translate-y-0 motion-reduce:!scale-100';

  return `${base} ${visible ? 'opacity-100 translate-x-0 translate-y-0 scale-100' : HIDDEN_TRANSFORM[direction]}`;
}
