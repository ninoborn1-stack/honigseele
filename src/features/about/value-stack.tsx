'use client';
// Werte als Stapelkarten – gleiche Bewegung wie auf der Behandlungs-Übersicht.
import { useEffect, useRef } from 'react';
import { Photo } from '@/components/ui/photo';
import { cn } from '@/lib/cn';

export interface Value {
  title: string;
  text: string;
  image: string;
}

export function ValueStack({ values }: { values: Value[] }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mq = matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)');
    const items = [...el.querySelectorAll<HTMLElement>('[data-stack]')];
    let raf = 0;
    const update = () => {
      items.forEach((item, i) => {
        const inner = item.querySelector<HTMLElement>('[data-stack-inner]');
        const shade = item.querySelector<HTMLElement>('[data-stack-shade]');
        const next = items[i + 1];
        if (!inner || !shade) return;
        if (!mq.matches || !next) {
          inner.style.transform = '';
          shade.style.opacity = '0';
          return;
        }
        const p = Math.min(1, Math.max(0, 1 - (next.getBoundingClientRect().top - item.getBoundingClientRect().top) / item.offsetHeight));
        inner.style.transform = `scale(${(1 - 0.06 * p).toFixed(4)})`;
        shade.style.opacity = (p * 0.55).toFixed(3);
      });
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div ref={root} className="px-[clamp(0.75rem,1.6vw,1.75rem)]">
      {values.map((v, i) => {
        const dark = i % 2 === 0;
        return (
          <article
            key={v.title}
            data-stack
            className="mb-4 md:sticky md:mb-0 md:h-[calc(88svh-var(--top-h,96px))] md:min-h-[540px]"
            style={{ top: `calc(var(--top-h, 96px) + 0.75rem + ${i * 12}px)` }}
          >
            <div
              data-stack-inner
              className={cn(
                'relative h-full origin-top overflow-hidden rounded-t-[2.5rem] rounded-b-[1.5rem] will-change-transform md:rounded-t-[4rem]',
                dark ? 'honey-glow on-dark text-cream-50' : 'bg-cream-100 text-honey-950',
              )}
            >
              <div className="grid h-full md:grid-cols-[1.1fr_1fr]">
                <div className={cn('flex flex-col justify-between gap-10 p-8 sm:p-12 lg:px-16 lg:py-14', !dark && 'md:order-2')}>
                  <div className="flex items-baseline justify-between gap-6">
                    <span className={cn('font-serif text-[clamp(3.5rem,min(10vw,12vh),9rem)] leading-[0.8]', dark ? 'text-honey-300/80' : 'text-honey-400')}>{String(i + 1).padStart(2, '0')}</span>
                    <span className={cn('text-xs font-medium uppercase tracking-[0.2em]', dark ? 'text-cream-100/70' : 'text-amber-800')}>Was uns ausmacht</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-[clamp(2.6rem,min(6vw,9vh),6.4rem)] leading-[0.92] tracking-[-0.02em]">{v.title}</h3>
                    <p className={cn('mt-6 max-w-md text-lg md:text-xl', dark ? 'text-cream-100/80' : 'text-muted')}>{v.text}</p>
                  </div>
                </div>
                <div className={cn('relative min-h-[42vh] md:min-h-0', !dark && 'md:order-1')}>
                  <Photo src={v.image} alt="" className="!absolute inset-0 md:inset-4 md:rounded-[2rem] lg:inset-6 lg:rounded-t-[3rem]" />
                </div>
              </div>
              <div data-stack-shade aria-hidden className="pointer-events-none absolute inset-0 bg-honey-950 opacity-0" />
            </div>
          </article>
        );
      })}
    </div>
  );
}
