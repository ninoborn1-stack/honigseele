'use client';
// Stapelkarten wie auf der Behandlungs-Übersicht: Karte bleibt stehen, die nächste gleitet darüber.
// Genutzt auf Über uns (Werte) und Kurse (Formate).
import { useEffect, useRef, type ReactNode } from 'react';
import { Photo } from '@/components/ui/photo';
import { cn } from '@/lib/cn';

export interface StackCard {
  title: string;
  text: string;
  image: string;
  /** kleine Zeile oben rechts */
  kicker?: string;
  /** zusätzlicher Inhalt unter dem Text, z. B. Liste + Buttons (erbt Textfarbe; Karten 1, 3 … sind dunkel) */
  extra?: ReactNode;
}

export function StackCards({ cards, kicker = '' }: { cards: StackCard[]; kicker?: string }) {
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
      {cards.map((v, i) => {
        const dark = i % 2 === 0;
        return (
          <article
            key={v.title}
            data-stack
            className="mb-4 md:sticky md:mb-0 md:h-[calc(100svh-var(--top-h,96px)-2.5rem)] md:min-h-[600px]"
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
                <div className={cn('flex flex-col justify-between p-8 sm:p-12 lg:px-16', v.extra ? 'gap-6 lg:py-10' : 'gap-10 lg:py-14', !dark && 'md:order-2')}>
                  <div className="flex items-baseline justify-between gap-6">
                    <span className={cn('font-serif leading-[0.8]', v.extra ? 'text-[clamp(2.6rem,min(6vw,8vh),4.5rem)]' : 'text-[clamp(3.5rem,min(10vw,12vh),9rem)]', dark ? 'text-honey-300/80' : 'text-honey-400')}>{String(i + 1).padStart(2, '0')}</span>
                    <span className={cn('text-right text-xs font-medium uppercase tracking-[0.2em]', dark ? 'text-cream-100/70' : 'text-amber-800')}>{v.kicker ?? kicker}</span>
                  </div>
                  <div>
                    <h3 className={cn('font-serif leading-[0.92] tracking-[-0.02em]', v.extra ? 'text-[clamp(2.4rem,min(5vw,8vh),4.8rem)]' : 'text-[clamp(2.6rem,min(6vw,9vh),6.4rem)]')}>{v.title}</h3>
                    <p className={cn('max-w-md', v.extra ? 'mt-4 md:text-lg' : 'mt-6 text-lg md:text-xl', dark ? 'text-cream-100/80' : 'text-muted')}>{v.text}</p>
                    {v.extra}
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
