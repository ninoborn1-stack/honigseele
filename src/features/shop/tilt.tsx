'use client';
// Leichtes 3D-Kippen zur Maus + sanftes Schweben. Auf Touch und bei reduzierter Bewegung: ruhig.
import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Tilt({ children, className, max = 9 }: { children: ReactNode; className?: string; max?: number }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = outer.current;
    const card = inner.current;
    if (!el || !card || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const float = card.animate([{ translate: '0 0' }, { translate: '0 -10px' }, { translate: '0 0' }], { duration: 6000, iterations: Infinity, easing: 'ease-in-out' });
    if (!matchMedia('(pointer: fine)').matches) return () => float.cancel();
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(1100px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)`;
      card.style.setProperty('--glare-x', `${(x + 0.5) * 100}%`);
      card.style.setProperty('--glare-y', `${(y + 0.5) * 100}%`);
    };
    const leave = () => {
      card.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg)';
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      float.cancel();
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [max]);

  return (
    <div ref={outer} className={cn('relative', className)}>
      <div ref={inner} className="relative transition-transform duration-500 ease-[var(--ease-soft)] [transform-style:preserve-3d] will-change-transform">
        {children}
        {/* Lichtreflex, folgt der Maus */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[1.75rem] opacity-60 mix-blend-soft-light"
          style={{ background: 'radial-gradient(40% 50% at var(--glare-x,30%) var(--glare-y,20%), rgba(255,240,210,0.55), transparent 70%)' }}
        />
      </div>
    </div>
  );
}
