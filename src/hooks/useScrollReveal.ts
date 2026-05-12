"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollRevealOptions {
  threshold?: number;
  once?: boolean;
  delay?: number;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(options: ScrollRevealOptions = {}) {
  const { threshold = 0.15, once = true, delay = 0 } = options;
  const ref = useRef<T>(null);
  const elementRef = ref;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => setIsVisible(true), delay);
          } else {
            setIsVisible(true);
          }
          if (once && ref.current) observer.unobserve(ref.current);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    const currentElement = ref.current;
    if (currentElement) observer.observe(currentElement);
    return () => { if (currentElement) observer.unobserve(currentElement); };
  }, [threshold, once, delay]);

  return {
    ref,
    elementRef,
    isVisible,
    className: `transition-all duration-700 ease-out ${
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`,
  };
}
