'use client';
import { ArrowLeft, Check, Minus, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Placeholder } from '@/components/ui/badge';
import { ArrowLink, Button } from '@/components/ui/button';
import { RevealHeading } from '@/components/ui/motion';
import { Reveal } from '@/components/ui/reveal';
import { Eyebrow, Title } from '@/components/ui/typography';
import { products as contentProducts, site } from '@/content';
import type { Product } from '@/domain/types';
import { formatEuro } from '@/lib/format';
import { useData } from '@/lib/use-data';
import { useCart } from './cart';
import { ProductTile } from './product-tile';
import { ProductVisual } from './product-visual';
import { ritualLabel, ritualsOf } from './rituals';

export function ProductDetail({ initial }: { initial: Product }) {
  // Live aus dem Adapter, damit Preisänderungen im Admin sofort sichtbar sind
  const { data: all = contentProducts } = useData((db) => db.listProducts(), [], contentProducts);
  const product = all.find((p) => p.id === initial.id) ?? initial;
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { add } = useCart();

  const own = ritualsOf(product.id);
  const related = all
    .filter((p) => p.kind === 'pflege' && p.active && p.id !== product.id)
    .sort((a, b) => Number(ritualsOf(b.id).some((r) => own.includes(r))) - Number(ritualsOf(a.id).some((r) => own.includes(r))))
    .slice(0, 4);

  const sections = [
    { title: 'Anwendung', text: product.usage },
    { title: 'Inhaltsstoffe', text: product.ingredients },
    { title: 'Versand & Rückgabe', text: `Versand innerhalb Deutschlands ${formatEuro(site.shipping.flatCents)}. Alles Weitere unter „Zahlung & Versand“ und in der Widerrufsbelehrung.` },
  ];

  return (
    <>
      <section className="honey-light">
        <div className="wrap pb-24 pt-6 md:pb-32 md:pt-10">
          <nav aria-label="Brotkrumen" className="flex min-h-11 items-center gap-3 text-[0.72rem] uppercase tracking-[0.18em] text-muted">
            <Link href="/shop/" className="inline-flex min-h-11 items-center gap-2 hover:text-honey-950">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Shop
            </Link>
            {own[0] && (
              <>
                <span aria-hidden>/</span>
                <span>{ritualLabel(own[0])}</span>
              </>
            )}
          </nav>
          <div className="mt-6 grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
            <div className="lg:sticky lg:top-[calc(var(--top-h,96px)+1rem)] lg:self-start">
              <ProductVisual product={product} large className="aspect-[4/5] animate-fade rounded-[2.5rem] lg:aspect-auto lg:h-[calc(100svh-var(--top-h,96px)-3rem)]" />
            </div>
            <div className="lg:py-10">
              <Eyebrow>{own.length ? own.map(ritualLabel).join(' · ') : 'Pflegeserie'}</Eyebrow>
              <RevealHeading as="h1" text={product.name} className="mt-6 text-[clamp(3rem,6.5vw,6.8rem)] leading-[0.95] tracking-[-0.02em]" />
              <div className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2">
                <p className="font-serif text-5xl">{formatEuro(product.priceCents)}</p>
                {product.size && <p className="text-lg text-muted">{product.size}</p>}
              </div>
              <p className="mt-2 text-xs text-muted">inkl. MwSt., zzgl. {formatEuro(site.shipping.flatCents)} Versand</p>

              <Reveal delay={150}>
                <p className="mt-10 max-w-lg text-lg leading-relaxed text-muted md:text-xl">{product.description}</p>
                {product.isPlaceholder && <Placeholder label="Produkttext folgt" className="mt-4" />}
              </Reveal>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-full border border-honey-950/25">
                  <button className="grid h-14 w-14 place-items-center" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Weniger">
                    <Minus className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                  <span className="w-8 text-center text-lg tabular-nums" aria-live="polite">
                    {qty}
                  </span>
                  <button className="grid h-14 w-14 place-items-center" onClick={() => setQty((q) => Math.min(product.stock || 1, q + 1))} aria-label="Mehr">
                    <Plus className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
                <Button
                  size="lg"
                  className="min-w-64 flex-1"
                  disabled={!product.active || product.stock <= 0}
                  onClick={() => {
                    add({ productId: product.id, quantity: qty });
                    setAdded(true);
                    setTimeout(() => setAdded(false), 1800);
                  }}
                >
                  {added && <Check className="h-4 w-4" strokeWidth={2} />}
                  {product.stock <= 0 ? 'Gerade ausverkauft' : added ? 'Im Warenkorb' : `In den Warenkorb · ${formatEuro(product.priceCents * qty)}`}
                </Button>
              </div>

              <div className="mt-10 flex gap-4 border-l-2 border-honey-400 pl-5">
                <Sparkles className="mt-1 h-5 w-5 shrink-0 text-amber-800" strokeWidth={1.5} />
                <p>
                  <span className="font-medium">In unseren Behandlungen im Einsatz.</span>{' '}
                  <span className="text-muted">Frag beim nächsten Termin gern nach einer Probe – wir beraten Dich, was zu Deiner Haut passt.</span>
                </p>
              </div>

              <div className="mt-12 border-t border-honey-950/20">
                {sections.map((s) => (
                  <details key={s.title} className="group border-b border-honey-950/20">
                    <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 font-serif text-[clamp(1.5rem,2vw,2rem)] [&::-webkit-details-marker]:hidden">
                      {s.title}
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-honey-950/25 transition-all duration-500 group-open:rotate-45 group-open:bg-honey-950 group-open:text-cream-50">
                        <Plus className="h-4 w-4" strokeWidth={1.5} />
                      </span>
                    </summary>
                    <div className="max-w-lg pb-6 text-muted">{s.text ?? <Placeholder label="Text folgt von Anna" />}</div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-cream-50 py-24 md:py-32">
          <div className="wrap">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div>
                <Eyebrow>Passt dazu</Eyebrow>
                <Title className="mt-6">Für Dein *Ritual*.</Title>
              </div>
              <ArrowLink href="/shop/#sortiment">Ganzes Sortiment</ArrowLink>
            </div>
            <ul className="mt-14 grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-6 sm:gap-y-16 lg:grid-cols-4">
              {related.map((p, i) => (
                <ProductTile key={p.id} product={p} index={i} />
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
