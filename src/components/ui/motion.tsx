'use client';
// Ruhige, aber spürbare Scroll-Animationen. Alle respektieren prefers-reduced-motion (CSS).
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { withBase } from '@/lib/config';

/** Setzt .is-visible, sobald das Element ins Bild kommt */
export function useInView<T extends HTMLElement>(margin = '0px 0px -10% 0px') {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return { ref, visible };
}

/** Text in Wörter zerlegen; *Wort* wird zum kursiven Akzent */
export function SplitText({ text, offset = 0 }: { text: string; offset?: number }) {
  let i = offset;
  return (
    <>
      {text.split(/(\*[^*]+\*)/g).map((part, k) => {
        const accent = part.startsWith('*') && part.endsWith('*');
        const words = (accent ? part.slice(1, -1) : part).split(/(\s+)/);
        const inner = words.map((w, j) =>
          /^\s+$/.test(w) || w === '' ? (
            w
          ) : (
            <span key={j} className="w">
              <span style={{ ['--d' as string]: i++ }}>{w}</span>
            </span>
          ),
        );
        return accent ? <em key={k}>{inner}</em> : <span key={k}>{inner}</span>;
      })}
    </>
  );
}

export function RevealHeading({
  as: Tag = 'h2',
  text,
  className,
}: {
  as?: 'h1' | 'h2' | 'h3' | 'p';
  text: string;
  className?: string;
}) {
  const { ref, visible } = useInView<HTMLHeadingElement>();
  return (
    <Tag ref={ref as never} aria-label={text.replace(/\*/g, '')} className={cn('split', visible && 'is-visible', className)}>
      <span aria-hidden>
        <SplitText text={text} />
      </span>
    </Tag>
  );
}

/** Bild, das sich beim Scrollen von unten öffnet */
export function RevealImage({ src, alt, className, imgClassName }: { src: string; alt: string; className?: string; imgClassName?: string }) {
  const { ref, visible } = useInView<HTMLDivElement>('0px 0px -5% 0px');
  return (
    <div ref={ref} className={cn('img-reveal relative overflow-hidden bg-cream-200', visible && 'is-visible', className)}>
      <img src={withBase(src)} alt={alt} loading="lazy" decoding="async" className={cn('h-full w-full object-cover', imgClassName)} />
    </div>
  );
}

/** Leichte Parallaxe für Kinder-Elemente */
export function Parallax({ children, speed = 0.12, className }: { children: ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      const r = el.getBoundingClientRect();
      const center = r.top + r.height / 2 - innerHeight / 2;
      el.style.transform = `translate3d(0, ${(-center * speed).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    addEventListener('scroll', onScroll, { passive: true });
    return () => {
      removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [speed]);
  return (
    <div ref={ref} className={cn('will-change-transform', className)}>
      {children}
    </div>
  );
}

/** Endlos-Laufband */
export function Marquee({ items, className, speed = 45, dots = true }: { items: ReactNode[]; className?: string; speed?: number; dots?: boolean }) {
  const row = (hidden?: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {items.map((it, i) => (
        <span key={i} className="flex items-center">
          {it}
          {dots && <span className="mx-[0.5em] inline-block h-[0.18em] w-[0.18em] rounded-full bg-current opacity-50" />}
        </span>
      ))}
    </div>
  );
  return (
    <div className={cn('marquee-wrap overflow-hidden', className)}>
      <div className="marquee" style={{ ['--marquee-speed' as string]: `${speed}s` }}>
        {row()}
        {row(true)}
      </div>
    </div>
  );
}

/** Zahl zählt beim Erscheinen hoch */
export function CountUp({ to, decimals = 0, className, duration = 1800 }: { to: number; decimals?: number; className?: string; duration?: number }) {
  const { ref, visible } = useInView<HTMLSpanElement>();
  const [value, setValue] = useState(to);
  useEffect(() => {
    if (!visible || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setValue(to * (1 - Math.pow(1 - p, 4)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    setValue(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, to, duration]);
  return (
    <span ref={ref} className={className}>
      {value.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  );
}
