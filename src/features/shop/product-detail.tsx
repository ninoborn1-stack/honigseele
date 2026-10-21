'use client';
import { ArrowLeft, Minus, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Placeholder } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { site } from '@/content';
import type { Product } from '@/domain/types';
import { formatEuro } from '@/lib/format';
import { useData } from '@/lib/use-data';
import { useCart } from './cart';
import { ProductVisual } from './product-visual';

export function ProductDetail({ initial }: { initial: Product }) {
  // Live aus dem Adapter, damit Preisänderungen im Admin sofort sichtbar sind
  const { data: product = initial } = useData(
    (db) => db.listProducts().then((all) => all.find((p) => p.id === initial.id) ?? initial),
    [initial.id],
    initial,
  );
  const [qty, setQty] = useState(1);
  const { add } = useCart();

  return (
    <section className="honey-light">
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-8 md:px-10 md:pb-28 md:pt-12">
        <Link href="/shop/" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-honey-950">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Zurück zum Shop
        </Link>
        <div className="mt-6 grid gap-10 md:grid-cols-2 md:gap-16">
          <ProductVisual product={product} large className="aspect-[4/5] rounded-t-full md:sticky md:top-28" />
          <div>
            <p className="eyebrow">Pflegeserie · handgemacht in Berlin</p>
            <h1 className="mt-4 text-5xl md:text-6xl">{product.name}</h1>
            {product.size && <p className="mt-2 text-muted">{product.size}</p>}
            <p className="mt-6 font-serif text-4xl">{formatEuro(product.priceCents)}</p>
            <p className="mt-1 text-xs text-muted">inkl. MwSt., zzgl. {formatEuro(site.shipping.flatCents)} Versand</p>

            <p className="mt-8 max-w-lg text-lg text-muted">{product.description}</p>
            {product.isPlaceholder && <Placeholder label="Produkttext folgt" className="mt-3" />}

            <div className="mt-8 flex items-center gap-3">
              <div className="flex items-center rounded-full border border-line">
                <button className="grid h-12 w-12 place-items-center" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Weniger">
                  <Minus className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <span className="w-8 text-center" aria-live="polite">
                  {qty}
                </span>
                <button className="grid h-12 w-12 place-items-center" onClick={() => setQty((q) => Math.min(product.stock || 1, q + 1))} aria-label="Mehr">
                  <Plus className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
              <Button size="lg" className="flex-1" disabled={!product.active || product.stock <= 0} onClick={() => add({ productId: product.id, quantity: qty })}>
                {product.stock > 0 ? 'In den Warenkorb' : 'Gerade ausverkauft'}
              </Button>
            </div>

            <div className="mt-10 flex gap-3 rounded-2xl bg-cream-100 p-5 text-sm">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" strokeWidth={1.5} />
              <p>
                <span className="font-medium">Wird in unseren Behandlungen verwendet.</span>{' '}
                <span className="text-muted">Frag gern beim nächsten Termin nach einer Probe – wir beraten Dich, was zu Deiner Haut passt.</span>
              </p>
            </div>

            <div className="mt-10 divide-y divide-line border-y border-line">
              {[
                { title: 'Anwendung', text: product.usage },
                { title: 'Inhaltsstoffe', text: product.ingredients },
              ].map((s) => (
                <details key={s.title} className="group">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between font-serif text-2xl [&::-webkit-details-marker]:hidden">
                    {s.title}
                    <Plus className="h-5 w-5 text-amber-800 transition-transform duration-300 group-open:rotate-45" strokeWidth={1.5} />
                  </summary>
                  <div className="pb-5 text-muted">{s.text ?? <Placeholder label="Text folgt von Anna" />}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
