'use client';
// Bereiche als Stapelkarten: Jede Karte bleibt kurz stehen (sticky), die nächste gleitet darüber,
// die vorige tritt leicht zurück (kleiner, dunkler). Mobil und bei reduzierter Bewegung: normale Liste.
import { CalendarHeart } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ArrowLink, ButtonLink } from '@/components/ui/button';
import { Photo } from '@/components/ui/photo';
import { cn } from '@/lib/cn';
import { formatEuro } from '@/lib/format';

export interface PanelData {
  id: string;
  name: string;
  eyebrow: string;
  teaser: string;
  image: string;
  count: number;
  minCents: number;
  examples: { name: string; priceCents: number; from?: boolean }[];
}

export function StackPanels({ panels }: { panels: PanelData[] }) {
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
        // Wie weit ist die nächste Karte schon über diese geschoben? 0 … 1
        const top = item.getBoundingClientRect().top;
        const nextTop = next.getBoundingClientRect().top;
        const p = Math.min(1, Math.max(0, 1 - (nextTop - top) / item.offsetHeight));
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
    mq.addEventListener('change', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
      mq.removeEventListener('change', onScroll);
    };
  }, []);

  return (
    <div ref={root} className="px-[clamp(0.75rem,1.6vw,1.75rem)] pb-10">
      {panels.map((p, i) => {
        const dark = i % 2 === 1;
        return (
          <article
            key={p.id}
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
              <div className="grid h-full md:grid-cols-[1.05fr_1fr]">
                <div className={cn('flex flex-col justify-between gap-6 p-7 sm:p-10 lg:px-14 lg:py-12', dark ? 'md:order-2' : '')}>
                  <div>
                    <div className="flex items-baseline justify-between gap-6">
                      <span className={cn('font-serif text-[clamp(3rem,min(9vw,10vh),8.5rem)] leading-[0.8]', dark ? 'text-honey-300/80' : 'text-honey-400')}>{String(i + 1).padStart(2, '0')}</span>
                      <span className={cn('text-right text-xs font-medium uppercase tracking-[0.2em]', dark ? 'text-cream-100/70' : 'text-amber-800')}>
                        {p.count} Leistungen
                        <br />
                        ab {formatEuro(p.minCents)}
                      </span>
                    </div>
                    <p className="eyebrow mt-6">{p.eyebrow}</p>
                    <h2 className="mt-3 font-serif text-[clamp(2.6rem,min(5.8vw,9vh),6.6rem)] leading-[0.92] tracking-[-0.02em]">{p.name}</h2>
                    <p className={cn('mt-4 max-w-md md:text-lg', dark ? 'text-cream-100/80' : 'text-muted')}>{p.teaser}</p>
                  </div>
                  <div>
                    <ul className={cn('border-t', dark ? 'border-cream-50/15' : 'border-honey-950/15')}>
                      {p.examples.map((x, k) => (
                        <li key={x.name} className={cn('flex items-baseline justify-between gap-6 border-b py-2.5', dark ? 'border-cream-50/10' : 'border-honey-950/10', k === 2 && 'md:[@media(max-height:880px)]:hidden', k === 1 && 'md:[@media(max-height:800px)]:hidden')}>
                          <span className="truncate">{x.name}</span>
                          <span className="font-serif text-2xl whitespace-nowrap">{formatEuro(x.priceCents, { from: x.from })}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
                      <ButtonLink href={`/buchen/?kategorie=${p.id}`} variant={dark ? 'honey' : 'primary'} size="lg" arrow data-label="Buchen">
                        Buchen
                      </ButtonLink>
                      <ArrowLink href={`/behandlungen/${p.id}/`} light={dark} data-label={p.name}>
                        Ansehen
                      </ArrowLink>
                    </div>
                  </div>
                </div>
                <div className={cn('relative min-h-[46vh] md:min-h-0', dark ? 'md:order-1' : '')}>
                  <Photo src={p.image} alt={p.name} className="!absolute inset-0 md:inset-4 md:rounded-[2rem] lg:inset-6 lg:rounded-t-[3rem]" />
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

export function ComingSoon({ items }: { items: { id: string; name: string; eyebrow: string; image: string }[] }) {
  return (
    <div className="wrap grid gap-4 pb-24 md:grid-cols-2 md:pb-36">
      {items.map((c) => (
        <Link key={c.id} href={`/behandlungen/${c.id}/`} data-label={c.name} className="group relative flex min-h-72 items-end overflow-hidden rounded-[2rem] p-8 text-cream-50">
          <Photo src={c.image} alt="" className="!absolute inset-0" imgClassName="transition-transform duration-[1.4s] ease-[var(--ease-soft)] group-hover:scale-105" />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-honey-950/85 via-honey-950/30 to-transparent" />
          <span className="relative">
            <span className="eyebrow !text-honey-300">{c.eyebrow} · bald</span>
            <span className="mt-2 block font-serif text-5xl">{c.name}</span>
            <span className="mt-2 flex items-center gap-2 text-sm text-cream-100/80">
              <CalendarHeart className="h-4 w-4" strokeWidth={1.5} /> Angebot und Preise folgen
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
