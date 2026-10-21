'use client';
// Produktkachel: große Bühne, Name in Serif, Schnell-in-den-Warenkorb mit kurzer Bestätigung.
import { Check, Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Placeholder } from '@/components/ui/badge';
import type { Product } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatEuro } from '@/lib/format';
import { useCart } from './cart';
import { ProductVisual } from './product-visual';
import { ritualLabel, ritualsOf } from './rituals';

export function ProductTile({ product, index = 0, className }: { product: Product; index?: number; className?: string }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const [shown, setShown] = useState(false);
  const soldOut = product.stock <= 0;

  // Einblenden nach dem Mount (Filterwechsel = neue Kacheln = neue Animation)
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(t);
  }, [added]);

  const labels = ritualsOf(product.id).map(ritualLabel);

  return (
    <li
      className={cn('transition-[opacity,transform] duration-[900ms] ease-[var(--ease-soft)] motion-reduce:transition-none', shown ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0', className)}
      style={{ transitionDelay: `${Math.min(index, 8) * 70}ms` }}
    >
      <div className="relative">
        <Link href={`/shop/${product.id}/`} data-label={product.name} className="block" aria-label={product.name}>
          <ProductVisual product={product} className="aspect-[4/5] rounded-[1.25rem] transition-[border-radius] duration-700 hover:rounded-[3.5rem] sm:rounded-[2rem]" />
        </Link>
        <button
          type="button"
          disabled={soldOut}
          onClick={() => {
            add({ productId: product.id, quantity: 1 }, { silent: true });
            setAdded(true);
          }}
          aria-label={`${product.name} in den Warenkorb`}
          className={cn(
            'absolute bottom-3 right-3 flex h-12 min-w-12 items-center justify-center gap-0 overflow-hidden sm:gap-2 rounded-full px-3.5 sm:bottom-4 sm:right-4 sm:px-4 text-sm font-medium shadow-lg shadow-honey-950/15 transition-all duration-500 ease-[var(--ease-soft)] disabled:opacity-40',
            added ? 'gap-2 bg-honey-950 text-cream-50' : 'bg-cream-50/95 text-honey-950 hover:bg-honey-950 hover:text-cream-50',
          )}
        >
          {added ? <Check className="h-4 w-4" strokeWidth={2} /> : <Plus className="h-4 w-4" strokeWidth={1.5} />}
          <span className={cn('overflow-hidden whitespace-nowrap transition-[max-width] duration-500', added ? 'max-w-40' : 'max-w-0 sm:max-w-40')}>{added ? 'Im Warenkorb' : soldOut ? 'Ausverkauft' : 'Hinzufügen'}</span>
        </button>
      </div>
      <div className="mt-5">
        {labels.length > 0 && <p className="text-[0.7rem] uppercase tracking-[0.18em] text-amber-800">{labels.join(' · ')}</p>}
        <Link href={`/shop/${product.id}/`} className="mt-1.5 block font-serif text-[clamp(1.3rem,2.1vw,2.1rem)] leading-[1.05] transition-colors hover:text-amber-600">
          {product.name}
        </Link>
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-line-soft pt-3">
          <p className="min-w-0 text-sm text-muted">
            {product.size ?? 'Handgemacht in Berlin'} {product.isPlaceholder && <Placeholder label="Text folgt" className="ml-1" />}
          </p>
          <p className="whitespace-nowrap font-serif text-xl sm:text-2xl">{formatEuro(product.priceCents)}</p>
        </div>
      </div>
    </li>
  );
}
