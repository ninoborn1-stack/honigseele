'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Ruhiges Einblenden beim Scrollen (respektiert prefers-reduced-motion per CSS) */
export function Reveal({ children, className, delay = 0, as: Tag = 'div' }: { children: ReactNode; className?: string; delay?: number; as?: 'div' | 'li' | 'section' }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref as never} data-reveal className={cn(className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}
